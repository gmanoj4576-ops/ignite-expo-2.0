import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with user's specific Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const registerTeam = async (teamData) => {
    try {
        console.log("registerTeam: Checking for unique team name...");
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where("teamName", "==", teamData.teamName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.warn("registerTeam: Team name exists.");
            throw new Error("Team name already exists!");
        }

        console.log("registerTeam: Adding document to Firestore...");
        const docRef = await addDoc(teamsRef, {
            ...teamData,
            createdAt: serverTimestamp(),
            attendanceMarked: false
        });

        console.log("registerTeam: Success! ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("registerTeam: Error:", error);
        throw error;
    }

};
