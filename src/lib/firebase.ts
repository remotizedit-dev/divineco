
'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// Ensure the config is not empty to avoid the invalid-api-key error
const config = firebaseConfig.apiKey ? firebaseConfig : {
  "projectId": "studio-360124392-b07a9",
  "appId": "1:317144157575:web:ff6284c4636dc4b8611722",
  "apiKey": "AIzaSyBFJCjetNtlziXKLuR5Bj0mU9D0TLGdmKI",
  "authDomain": "studio-360124392-b07a9.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "317144157575"
};

const app = getApps().length > 0 ? getApp() : initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
