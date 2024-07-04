// Acá vamos a definir todas las funciones que tengan que ver con la interacción con nuestro file system, que en este
// case, es Firebase Storage.

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Guarda un archivo en el file system del servidor.
 * 
 * @param {string} path 
 * @param {File} file 
 * @returns 
 */
export async function uploadFile(path, file) {
    const fileRef = ref(storage, path);
    return uploadBytes(fileRef, file);
}

/**
 * Retorn la ruta absoluta de un archivo almacenado en nuestro backend.
 * 
 * @param {string} path 
 * @returns 
 */
export async function getFileURL(path) {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
}