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

2. Start the app

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


## License

This project is licensed under the MIT License.
