import {
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit, // Asegúrate de importar 'limit'
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Listener en tiempo real para las publicaciones.
 *
 * @param {Function} callback - Función que se ejecuta cada vez que las publicaciones cambian.
 * @returns {Function} - Función para cancelar el listener.
 */
export function subscribeToPublicaciones(callback) {
  const publicacionesQuery = query(
    collection(db, "publicaciones"),
    orderBy("timestamp", "desc")
  );
  const unsubscribe = onSnapshot(publicacionesQuery, (querySnapshot) => {
    const publicaciones = [];
    querySnapshot.forEach((doc) => {
      publicaciones.push({ id: doc.id, ...doc.data() });
    });
    callback(publicaciones);
  });
  return unsubscribe;
}

/**
 * Obtiene todas las publicaciones.
 *
 * @returns {Promise<Array>} - Array de publicaciones.
 */
export async function getAllPublicaciones() {
  const publicacionesQuery = query(
    collection(db, "publicaciones"),
    orderBy("timestamp", "desc")
  );
  const querySnapshot = await getDocs(publicacionesQuery);
  const publicaciones = [];
  querySnapshot.forEach((doc) => {
    publicaciones.push({ id: doc.id, ...doc.data() });
  });
  return publicaciones;
}

/**
 * Crea una nueva publicación.
 *
 * @param {Object} publicacion - Datos de la publicación.
 * @param {string} userEmail - Email del usuario que crea la publicación.
 * @returns {Promise<void>}
 */
export async function createPublicacion(publicacion, userEmail) {
  await addDoc(collection(db, "publicaciones"), {
    ...publicacion,
    userEmail,
    timestamp: serverTimestamp(),
  });
}

/**
 * Listener en tiempo real para los comentarios de una publicación.
 *
 * @param {string} publicacionId - ID de la publicación.
 * @param {Function} callback - Función que se ejecuta cada vez que los comentarios cambian.
 * @returns {Function} - Función para cancelar el listener.
 */
export function subscribeToComments(publicacionId, callback) {
  const commentsQuery = query(
    collection(db, `publicaciones/${publicacionId}/comments`),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(comments);
  });
}

/**
 * Crea un comentario en una publicación.
 *
 * @param {string} publicacionId - ID de la publicación.
 * @param {Object} comment - Datos del comentario.
 * @param {string} userEmail - Email del usuario que crea el comentario.
 * @returns {Promise<void>}
 */
export async function createComment(publicacionId, comment, userEmail) {
  await addDoc(collection(db, `publicaciones/${publicacionId}/comments`), {
    ...comment,
    userEmail,
    timestamp: serverTimestamp(),
  });
}

/**
 * Obtiene las últimas publicaciones.
 *
 * @returns {Promise<Array>} - Array de las últimas publicaciones.
 */
export const getUltimasPublicaciones = async () => {
  const publicacionesQuery = query(
    collection(db, "publicaciones"),
    orderBy("timestamp", "desc"),
    limit(3)
  );
  const querySnapshot = await getDocs(publicacionesQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Obtiene las publicaciones específicas de un usuario.
 *
 * @param {string} email - Email del usuario.
 * @returns {Promise<Array>} - Array de publicaciones del usuario.
 */
export async function getUserPublications(email) {
  const publicacionesQuery = query(
    collection(db, "publicaciones"),
    where("userEmail", "==", email),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(publicacionesQuery);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
