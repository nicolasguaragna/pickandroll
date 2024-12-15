import {
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase"; // Asegúrate de que `storage` esté correctamente importado

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
  return onSnapshot(publicacionesQuery, (querySnapshot) => {
    const publicaciones = [];
    querySnapshot.forEach((doc) => {
      publicaciones.push({ id: doc.id, ...doc.data() });
    });
    callback(publicaciones);
  });
}

/**
 * Crea una nueva publicación.
 *
 * @param {Object} publicacion - Datos de la publicación.
 * @param {string} userEmail - Email del usuario que crea la publicación.
 * @param {File|null} imageFile - Archivo de imagen, si existe.
 * @returns {Promise<void>}
 */
export async function createPublicacion(publicacion, userEmail, imageFile) {
  let imageUrl = null;

  if (imageFile) {
    const storageRef = ref(
      storage,
      `publicaciones/${Date.now()}_${imageFile.name}`
    );
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  await addDoc(collection(db, "publicaciones"), {
    ...publicacion,
    userEmail,
    imageUrl,
    timestamp: serverTimestamp(),
  });
}

/**
 * Edita una publicación existente.
 *
 * @param {string} publicacionId - ID de la publicación a editar.
 * @param {Object} updates - Datos actualizados de la publicación.
 * @returns {Promise<void>}
 */
export async function updatePublicacion(publicacionId, updates) {
  const publicacionRef = doc(db, "publicaciones", publicacionId);
  await updateDoc(publicacionRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina una publicación.
 *
 * @param {string} publicacionId - ID de la publicación a eliminar.
 * @returns {Promise<void>}
 */
export async function deletePublicacion(publicacionId) {
  const publicacionRef = doc(db, "publicaciones", publicacionId);
  await deleteDoc(publicacionRef);
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
export async function addComment(publicacionId, comment, userEmail) {
  await addDoc(collection(db, `publicaciones/${publicacionId}/comments`), {
    ...comment,
    userEmail,
    timestamp: serverTimestamp(),
  });
}

/**
 * Edita un comentario existente.
 *
 * @param {string} publicacionId - ID de la publicación.
 * @param {string} commentId - ID del comentario a editar.
 * @param {Object} updates - Datos actualizados del comentario.
 * @returns {Promise<void>}
 */
export async function updateComment(publicacionId, commentId, updates) {
  const commentRef = doc(
    db,
    `publicaciones/${publicacionId}/comments`,
    commentId
  );
  await updateDoc(commentRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina un comentario.
 *
 * @param {string} publicacionId - ID de la publicación.
 * @param {string} commentId - ID del comentario a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteComment(publicacionId, commentId) {
  const commentRef = doc(
    db,
    `publicaciones/${publicacionId}/comments`,
    commentId
  );
  await deleteDoc(commentRef);
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
