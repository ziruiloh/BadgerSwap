# Firebase Setup Guide for BadgerSwap

## 🔴 CRITICAL: You Must Configure Firebase Before Testing

The authentication will **NOT work** until you configure Firebase with your actual credentials.

## Quick Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `BadgerSwap`
4. Follow the setup wizard

### 2. Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon `</>` to add a web app
5. Register your app with nickname: "BadgerSwap Web"
6. Copy the `firebaseConfig` object

### 3. Update firebase/config.js

Replace the placeholder values in `firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Your actual API key
  authDomain: "badgerswap.firebaseapp.com", // Your actual domain
  projectId: "badgerswap", // Your actual project ID
  storageBucket: "badgerswap.appspot.com", // Your actual storage bucket
  messagingSenderId: "123456789", // Your actual sender ID
  appId: "1:123456789:web:abc123" // Your actual app ID
};
```

### 4. Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

5. Enable **Google** provider:
   - Click "Google"
   - Toggle "Enable" to ON
   - Enter a project support email
   - Click "Save"

### 5. Set Up Authorization Domain (for Google Sign-In)

1. In Authentication, go to **Settings** tab
2. Scroll to "Authorized domains"
3. Add your domains (localhost is usually already there for testing)

## Testing the Authentication

### Test Email/Password Login

1. Open the app
2. Click "Sign In"
3. Enter any email (format: `test@wisc.edu`)
4. Enter any password (at least 6 characters)
5. You should see an error if the user doesn't exist

### Create a Test Account

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email: `test@wisc.edu`
4. Enter password: `test123`
5. Click "Add user"

Now you can sign in with these credentials!

### Test Google Sign-In (Web Only)

1. Make sure you're running on web: `npx expo start --web`
2. Click "Continue with Google"
3. A popup should appear asking for Google credentials
4. Use a `@wisc.edu` email to test

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)" 
- Your Firebase config values are still placeholders
- Follow step 3 above to update `firebase/config.js`

### "Firebase: Error (auth/operation-not-allowed)"
- Authentication method not enabled in Firebase Console
- Follow step 4 above to enable Email/Password and Google

### Google Sign-In Popup Blocked
- Check browser popup blocker settings
- Allow popups for localhost

### No Popup Appears on Mobile
- Google Sign-In with popup only works on web
- Use Email/Password login on mobile, or implement mobile Google Sign-In separately

## Need Help?

Check the browser console (F12) for detailed error messages. The app now logs all authentication attempts for debugging.

