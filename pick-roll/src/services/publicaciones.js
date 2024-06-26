// src/services/publicaciones.js
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc} from "firebase/firestore";
import { db } from "./firebase";

/**
 * obtengo todas las publicaciones.
 * @returns {Promise}
 */
export async function getAllPublicaciones() {
    const publicacionesQuery = query(collection(db, "publicaciones"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(publicacionesQuery);
    const publicaciones = [];
    querySnapshot.forEach((doc) => {
         //añado cada documento al array de publicaciones con su id y datos
        publicaciones.push({ id: doc.id, ...doc.data() });
    });
    return publicaciones;
}

/**
 * creo una nueva publicación.
 * @param {Object} publicacion
 * @param {string} userEmail
 * @returns {Promise}
 */
export async function createPublicacion(publicacion, userEmail) {
    await addDoc(collection(db, "publicaciones"), {
        ...publicacion,
        userEmail,
        timestamp: serverTimestamp()
    });
    //agrego un nuevo documento a la colección publicaciones
    //await addDoc(collection(db, "publicaciones"), publicacion);
}

/**
 * obtengo comentarios de una publicación.
 * @param {string} publicacionId
 * @returns {Promise}
 */
export async function getComments(publicacionId) {
    const commentsQuery = query(collection(db, `publicaciones/${publicacionId}/comments`), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(commentsQuery);
    const comments = [];
    querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
}

/**
 * creo un comentario en una publicación.
 * @param {string} publicacionId
 * @param {Object} comment
 * @param {string} userEmail
 * @returns {Promise}
 */
export async function createComment(publicacionId, comment, userEmail) {
    await addDoc(collection(db, `publicaciones/${publicacionId}/comments`), {
        ...comment,
        userEmail,
        timestamp: serverTimestamp()
    });
}

export const getUltimasPublicaciones = async () => {
    const snapshot = await db.collection('publicaciones').orderBy('timestamp', 'desc').limit(3).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};