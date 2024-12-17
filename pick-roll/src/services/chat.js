// va ser el archivo donde estan las funciones donde esta el chat publico
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda un mensaje en la colección "chat".
 *
 * @param {{user_id: string, email: string, content: string}} data
 * @returns {Promise<void>}
 */
export function saveMessage(data) {
  // Validar que los datos sean correctos antes de agregar a Firestore
  if (!data.user_id || !data.email || !data.content) {
    console.error("Error: Datos incompletos al guardar el mensaje:", data);
    return Promise.reject(new Error("Datos incompletos"));
  }

  // Referencia a la colección del chat
  const refChat = collection(db, "chat");

  // Agregar documento a Firestore
  return addDoc(refChat, {
    user_id: data.user_id, // ID del usuario autenticado
    email: data.email, // Email del usuario
    content: data.content, // Contenido del mensaje
    created_at: serverTimestamp(), // Fecha generada por el servidor
  });
}

/**
 * ejecuta el callback, cada vez que los msjs cambien.
 *
 * @param {(messages: {email: string, content: string}[]) => null} callback
 * @returns {Unsubscribe}
 */
export function subscribeToChatMessages(callback) {
  const refChat = collection(db, "chat");

  //ordenamos los mensajes por fecha de creacion
  const q = query(refChat, orderBy("created_at"));

  //seteamos una subscripcion para recibir nuevos mensajes
  return onSnapshot(q, (snapshot) => {
    //console.log("Snapshot: ", snapshot);
    console.log("Snapshot documentos:", snapshot.docs);

    const messages = snapshot.docs.map((doc) => {
      return {
        user_id: doc.data().user_id,
        email: doc.data().email,
        content: doc.data().content,
        created_at: doc.data().created_at.toDate(),
      };
    });
    //llamamos al callback pra que lo renderize.
    callback(messages);
  });
}
