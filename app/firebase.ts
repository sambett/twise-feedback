import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCeYDk4JYffPpwJXWD-edYqn9CjCpXtpUE",
  authDomain: "twise-feedback.firebaseapp.com",
  databaseURL: "https://twise-feedback-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "twise-feedback",
  storageBucket: "twise-feedback.firebasestorage.app",
  messagingSenderId: "349226192684",
  appId: "1:349226192684:web:1fa691d13cfbe6c8aee689",
  measurementId: "G-5YVC4K1SQ4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);