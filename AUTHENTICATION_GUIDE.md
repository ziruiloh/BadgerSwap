# Firebase Authentication & Firestore Integration Guide

This guide explains how BadgerSwap integrates Firebase Authentication and Firestore for user management.

## 🔥 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
├─────────────────────────────────────────────────────────────┤
│  SignupPage.jsx                    LoginPage.jsx            │
│  - Name input                       - Email input            │
│  - Email input                      - Password input         │
│  - Password inputs                  - Login button           │
│  - Signup button                                             │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Auth Layer                        │
│                   (firebase/auth.js)                         │
├─────────────────────────────────────────────────────────────┤
│  signUp(email, password)                                     │
│  - Creates Firebase Auth account                             │
│  - Creates Firestore user document                           │
│  - Enforces @wisc.edu email                                  │
│                                                              │
│  logIn(email, password)                                      │
│  - Authenticates with Firebase                               │
│  - Returns user credentials                                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firestore Data Layer                        │
│                  (firebase/firestore.js)                     │
├─────────────────────────────────────────────────────────────┤
│  createUser(userId, userData)  - CREATE                      │
│  getUser(userId)               - READ                        │
│  getAllUsers()                 - READ ALL                    │
│  updateUser(userId, updates)   - UPDATE                      │
│  deleteUser(userId)            - DELETE                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   User Service Layer                         │
│                  (services/userService.js)                   │
├─────────────────────────────────────────────────────────────┤
│  High-level functions with business logic:                   │
│  - getUserProfile(userId)                                    │
│  - getCurrentUserProfile()                                   │
│  - updateUserProfile(userId, updates)                        │
│  - deleteUserAccount(userId, user)                           │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Implementation Details

### 1. Signup Flow (SignupPage.jsx)

**User Journey:**
1. User enters name, email (@wisc.edu), and password
2. Client-side validation checks all fields
3. Firebase `signUp()` creates auth account and Firestore document
4. User document is updated with name
5. User is automatically logged in and navigated to MainApp

**Code Integration:**

```javascript
import { signUp } from "../firebase/auth";
import { updateUser } from "../firebase/firestore";

const handleEmailSignup = async () => {
  // Validation...
  
  try {
    // Create Firebase Auth account + Firestore document
    const userCredential = await signUp(email, password);
    
    // Add user's name to Firestore
    await updateUser(userCredential.user.uid, {
      name: name.trim(),
    });
    
    // Success - navigate to app
    navigation.replace("MainApp");
  } catch (error) {
    // Handle errors (email already exists, weak password, etc.)
  }
};
```

**What happens behind the scenes:**

```javascript
// firebase/auth.js - signUp()
export const signUp = async (email, password) => {
  // 1. Enforce UW-Madison email
  if (!email.endsWith("@wisc.edu")) {
    throw new Error("Please use a UW–Madison email.");
  }
  
  // 2. Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 3. Create Firestore document with default values
  await setDoc(doc(db, "users", userCredential.user.uid), {
    name: null,
    email: userCredential.user.email,
    bio: "New Badger at UW-Madison 🦡",
    reputation: 5.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return userCredential;
};
```

### 2. Login Flow (LoginPage.jsx)

**User Journey:**
1. User enters email and password
2. Client-side validation checks fields
3. Firebase `logIn()` authenticates user
4. On success, user is navigated to MainApp
5. App.js auth listener detects login and updates UI

**Code Integration:**

```javascript
import { logIn } from "../firebase/auth";

const handleEmailLogin = async () => {
  // Validation...
  
  try {
    // Authenticate with Firebase
    await logIn(email.trim(), password);
    
    // Success - navigate to app
    navigation.replace("MainApp");
  } catch (error) {
    // Handle errors (wrong password, user not found, etc.)
  }
};
```

**What happens behind the scenes:**

```javascript
// firebase/auth.js - logIn()
export const logIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
```

### 3. Auth State Management (App.js)

The app automatically responds to authentication changes:

```javascript
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Show MainApp if logged in, LoginPage if not
        initialRouteName={user ? "MainApp" : "LoginPage"}
      >
        <Stack.Screen name="MainApp" component={HomeTabs} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="SignupPage" component={SignupPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Auth State Listener:**
- Automatically triggers when user signs up, logs in, or logs out
- Updates the `user` state
- React Navigation automatically shows correct screen based on auth state

## 🔒 Security Features

### Email Validation
- **Enforced @wisc.edu domain** in both client and server
- Prevents non-UW-Madison users from signing up

### Firebase Auth Security
- Passwords are hashed and never stored in plain text
- Secure token-based authentication
- Automatic session management

### Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow create only during signup
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      // Anyone authenticated can read products
      allow read: if request.auth != null;
      
      // Only the seller can update/delete their product
      allow update, delete: if request.auth != null && 
                             resource.data.sellerId == request.auth.uid;
      
      // Authenticated users can create products
      allow create: if request.auth != null;
    }
  }
}
```

## 📊 Data Structure

### User Document in Firestore

```javascript
{
  uid: "abc123...",                      // Same as Firebase Auth UID (Document ID)
  name: "John Badger",                   // User's display name
  email: "john@wisc.edu",                // UW-Madison email
  bio: "New Badger at UW-Madison 🦡",    // Default bio (can be updated)
  reputation: 5.0,                       // Default reputation (5.0 = new user)
  createdAt: Timestamp,                  // Account creation date
  updatedAt: Timestamp,                  // Last profile update
  // Optional fields you can add later:
  avatarUrl: "https://...",
  phoneNumber: "+1234567890",
  totalTrades: 12,
  major: "Computer Science",
  graduationYear: 2025
}
```

## 🎯 Error Handling

Both pages handle Firebase-specific error codes:

### Signup Errors
- `auth/email-already-in-use` → "This email is already registered"
- `auth/invalid-email` → "Invalid email address"
- `auth/weak-password` → "Password is too weak"
- Custom validation → "@wisc.edu email required"

### Login Errors
- `auth/user-not-found` → "No account found with this email"
- `auth/wrong-password` → "Incorrect password"
- `auth/user-disabled` → "This account has been disabled"
- `auth/too-many-requests` → "Too many failed attempts"

## 🚀 Testing the Integration

### Test Signup:
1. Navigate to SignupPage
2. Enter:
   - Name: "Test Badger"
   - Email: "test@wisc.edu"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Sign Up"
4. Check Firebase Console → Authentication (should see new user)
5. Check Firebase Console → Firestore → users collection (should see new document)

### Test Login:
1. Navigate to LoginPage
2. Enter the credentials from signup
3. Click "Log In"
4. Should navigate to MainApp automatically

### Test Auth Persistence:
1. Log in successfully
2. Close and reopen the app
3. Should automatically show MainApp (user stays logged in)

## 🔄 User Flow Diagram

```
┌──────────────┐
│  App Starts  │
└──────┬───────┘
       │
       ▼
  Auth State?
       │
   ┌───┴───┐
   │       │
Not Logged  Logged In
   In      │
   │       └──────────► MainApp (Home Tabs)
   │
   ▼
LoginPage
   │
   ├──► Sign Up Link ──► SignupPage
   │                          │
   │                          │ (Signup Success)
   │                          ▼
   │                     Create Firebase Auth
   │                          │
   │                          ▼
   │                     Create Firestore Doc
   │                          │
   │                          ▼
   │                     Update User Name
   │                          │
   │    (Login Success)       │
   └──────────────┬───────────┘
                  │
                  ▼
              MainApp (Home Tabs)
```

## 📱 Next Steps

### Recommended Enhancements:

1. **Profile Management**
   - Add profile editing in ProfilePage.jsx
   - Use `updateUserProfile()` from userService.js
   - Allow users to update name, bio, avatar, etc.

2. **Logout Functionality**
   ```javascript
   import { signOut } from 'firebase/auth';
   import { auth } from './firebase/config';
   
   const handleLogout = async () => {
     await signOut(auth);
     navigation.replace('LoginPage');
   };
   ```

3. **Password Reset**
   ```javascript
   import { sendPasswordResetEmail } from 'firebase/auth';
   
   const handleForgotPassword = async (email) => {
     await sendPasswordResetEmail(auth, email);
     Alert.alert('Check your email for reset instructions');
   };
   ```

4. **Email Verification**
   ```javascript
   import { sendEmailVerification } from 'firebase/auth';
   
   await sendEmailVerification(auth.currentUser);
   ```

5. **User Profile Display**
   - Fetch user data using `getUserProfile(userId)` from userService.js
   - Display in ProfilePage, product listings, etc.

## 🐛 Troubleshooting

### "User not found" after signup
- Check Firebase Console → Authentication
- Verify email was added to Firestore users collection
- Ensure Firebase Auth is enabled in project settings

### "@wisc.edu validation not working"
- Check firebase/auth.js - validation should be in signUp()
- Ensure client-side validation matches in SignupPage.jsx

### User logged out unexpectedly
- Check Firebase session timeout settings
- Verify auth state listener in App.js
- Check for any signOut() calls

### Firestore permission denied
- Update Firestore security rules (see Security Rules section above)
- Ensure user is authenticated before accessing Firestore
- Check user.uid matches document ID

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `pages/SignupPage.jsx` | UI and logic for user registration |
| `pages/LoginPage.jsx` | UI and logic for user login |
| `firebase/auth.js` | Firebase Auth operations (signup, login) |
| `firebase/firestore.js` | Low-level Firestore CRUD operations |
| `services/userService.js` | High-level user management functions |
| `firebase/config.js` | Firebase initialization |
| `App.js` | Auth state management and navigation |

---

✅ **Status**: Signup and Login pages are now fully integrated with Firebase Authentication and Firestore!

