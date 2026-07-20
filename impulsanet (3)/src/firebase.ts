/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYFU81fKMGKI6seMQI13GvKeeNwz_k8HU",
  authDomain: "gen-lang-client-0776513868.firebaseapp.com",
  projectId: "gen-lang-client-0776513868",
  storageBucket: "gen-lang-client-0776513868.firebasestorage.app",
  messagingSenderId: "518726707671",
  appId: "1:518726707671:web:bbf9e3ce4a8b614e84c392"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provided in config
const db = getFirestore(app, "ai-studio-5149ce93-aa35-4b1d-9194-63cd1e9b621e");
const auth = getAuth(app);

export { app, db, auth };
