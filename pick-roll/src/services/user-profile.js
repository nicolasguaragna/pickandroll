import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';

/**
 * traigo el dato del usuario con el id.
 * 
 * @param {string} id 
 * @returns {Promise}
 */

export async function getUserProfileById(id) {
    const refUser = doc(db, `users/${id}`);

    const userDoc = await getDoc(refUser);

    return {
        id: userDoc.id,
        email: userDoc.data().email,
        displayName: userDoc.data().displayName,
        bio: userDoc.data().bio,
        career: userDoc.data().career,
        // photoURL: userDoc.data().photoURL,
    }
}

/**
 * 
 * @param {string} id 
 * @param {{email: string}} data 
 * @returns {Promise<void>}
 */
export async function createUserProfile(id, data) {
    const refUser = doc(db, `users/${id}`);

    await setDoc(refUser, data);
}

/**
 * 
 * @param {string} id 
 * @param {{displayName: string|null}} data 
 * @returns {Promise<void>}
 */
export async function updateUserProfile(id, data) {
    const refUser = doc(db, `users/${id}`);

    await updateDoc(refUser, data);
}