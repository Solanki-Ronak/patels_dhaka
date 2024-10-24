import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyDYM9CMtgyzcb8BP3bVQXwAL9uhYi_v-0Y",
    authDomain: "task-management-system-2995d.firebaseapp.com",
    projectId: "task-management-system-2995d",
    storageBucket: "task-management-system-2995d.appspot.com",
    messagingSenderId: "1053708618580",
    appId: "1:1053708618580:web:ebe41f0eec73bed944d6c1",
    measurementId: "G-LCX6MEJWWH"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);