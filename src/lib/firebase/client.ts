
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration is now constructed conditionally
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app: FirebaseApp | undefined; // Allow app to be potentially undefined
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
  if (!firebaseApiKey) {
    console.warn(
      "Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is not defined in environment variables. " +
      "Firebase SDK will not be initialized. Firebase-dependent features like Analytics will be disabled."
    );
  } else {
    const firebaseConfig = {
      apiKey: firebaseApiKey, // Use the checked variable
      authDomain: "account-lockout-analyzer.firebaseapp.com",
      projectId: "account-lockout-analyzer",
      storageBucket: "account-lockout-analyzer.appspot.com",
      messagingSenderId: "1005710075157",
      appId: "1:1005710075157:web:76b8139a68b55d29e7351c",
      measurementId: "G-1G50JX55C9"
    };

    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (initError) {
        console.error("Failed to initialize Firebase app:", initError);
        // app remains undefined
      }
    } else {
      app = getApp();
    }
  
    // Check if app was successfully initialized before trying to get analytics
    if (app && app.name && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error("Failed to initialize Firebase Analytics:", error);
        // analytics remains null
      }
    }
  }
}

// Export app as potentially undefined if you want consuming code to check
// Or handle it such that other parts of the app don't break if app is undefined
export { app, analytics };
