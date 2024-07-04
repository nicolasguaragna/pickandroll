//conexion a servidor de firebase
//registra los modulos que ademas queremos usar

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyAYMv2hRaAsoOnk3nqOq5JO-p91BFdA4eY",
    authDomain: "pick-and-roll-ad384.firebaseapp.com",
    projectId: "pick-and-roll-ad384",
    storageBucket: "pick-and-roll-ad384.appspot.com",
    messagingSenderId: "808135412044",
    appId: "1:808135412044:web:4a55bd21d2ac01909e27e9"
};

// inicializamos Firebase
export const app = initializeApp(firebaseConfig);

//conectamos a firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);