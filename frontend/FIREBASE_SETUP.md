# Firebase Setup Guide for Techtan Website

This guide will help you set up Firebase for your Techtan website to solve the persistent data storage problem.

## 1. Create a Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com/) and sign in with your Google account
2. Click "Add project" and follow the steps:
   - Enter a project name (e.g., "techtan-website")
   - Enable Google Analytics if you want (optional)
   - Accept the terms and click "Create project"

## 2. Add a Web App to Your Firebase Project

1. In the Firebase console, click on the "</>" icon to add a web app
2. Give your app a nickname (e.g., "techtan-web")
3. Enable Firebase Hosting if you want (optional for now)
4. Click "Register app"
5. You'll see your Firebase configuration - **SAVE THIS INFORMATION!**

## 3. Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode (you can change security rules later)
4. Choose a location close to your target audience
5. Click "Enable"

## 4. Update the Firebase Configuration

1. Open the file `frontend/src/firebaseConfig.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 5. Migrate Your Existing Data

1. Log in to your admin panel
2. Click the "Migrate to Firebase" button at the bottom of the page
3. Confirm the migration when prompted
4. Wait for the migration to complete
5. Refresh the page and verify your data appears correctly

## 6. Update Firestore Security Rules

For better security, update your Firestore rules in the Firebase console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Team members, projects, and services can be read by anyone
    match /teamMembers/{document=**} {
      allow read: if true;
      allow write: if false; // Only allow writes through your admin panel
    }
    
    match /projects/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Contact submissions can only be read in your admin panel
    match /contactSubmissions/{document=**} {
      allow read: if false;
      allow write: if true; // Allow anyone to submit contact forms
    }
  }
}
```

## 7. Deploy Your Website

1. After testing locally, deploy your updated code to GitHub Pages
2. Test on multiple devices to ensure data persistence works correctly

## Firebase Free Tier Limits

The Firebase free tier is generous and should be more than adequate for your website:

- Firestore: 1GB storage, 50K reads/day, 20K writes/day, 20K deletes/day
- Authentication: 50K monthly active users
- Hosting: 10GB storage, 360MB/day data transfer

## Troubleshooting

If you encounter any issues:

1. Check browser console for errors
2. Verify your Firebase configuration is correct
3. Make sure your Firestore security rules allow the operations you're trying to perform
4. Test your site in incognito mode to rule out caching issues

## Need More Help?

- Firebase Documentation: [firebase.google.com/docs](https://firebase.google.com/docs)
- Firestore Documentation: [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
- Firebase GitHub forum: [github.com/firebase/firebase-js-sdk/discussions](https://github.com/firebase/firebase-js-sdk/discussions) 