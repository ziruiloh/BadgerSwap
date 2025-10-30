# BadgerSwap 🦡

A trusted marketplace app for UW-Madison students to buy and sell items.

## Features

- Product listings with search and filtering
- Firebase integration for data storage
- Modern UI with Expo and React Native
- Cross-platform support (iOS, Android, Web)

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Navigation**: React Navigation
- **Icons**: Expo Vector Icons

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. **⚠️ Configure Firebase (REQUIRED before running)**
   
   **Authentication will NOT work until you configure Firebase!**
   
   See detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   
   Quick steps:
   - Create a Firebase project at https://console.firebase.google.com/
   - Copy your Firebase config
   - Update `firebase/config.js` with your credentials
   - Enable Email/Password and Google authentication in Firebase Console

3. Start the app

   ```bash
   npx expo start
   ```


## Project Structure

```
src/
├── firebase/          # Firebase configuration and utilities
├── services/          # Business logic services
├── pages/            # Screen components
├── components/       # Reusable UI components
├── context/          # React Context providers
├── App.js            # Main app component
└── index.js          # Entry point
```

## Firebase Setup

This project uses Firebase for:
- **Firestore**: Product and user data storage
- **Authentication**: User login/signup
- **Storage**: Image uploads

### Configuration Steps

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google Sign-In providers
3. Update `firebase/config.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

4. In Firebase Console, set up Email/Password authentication
5. Enable Google Sign-In in the Authentication providers
6. Restrict Google Sign-In to `@wisc.edu` email addresses using Firebase Security Rules

### Authentication Features

- **Email/Password Login**: Standard email and password authentication
- **Google Sign-In**: Restricted to @wisc.edu emails only
- **UW-Madison Branding**: Uses official UW-Madison red (#C5050C) for primary actions


## License

This project is licensed under the MIT License.
