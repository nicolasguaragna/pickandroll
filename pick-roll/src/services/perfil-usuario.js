import { doc, getDoc, setDoc } from "firebase/firestore";
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