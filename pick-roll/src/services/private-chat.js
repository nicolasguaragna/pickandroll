import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// variable para cachear los documentos de chats privados que estan verificados que existen.
const cachedChats = {};

/**
 *
 * @param {string} senderId
 * @param {string} receiverId
 * @param {string} message
 * @returns {Promise<{id: string}>}
 */

export async function sendPrivateChatMessage(senderId, receiverId, message) {
  const chatId = generatePrivateChatId(senderId, receiverId);

  // creo documento del chat privado, si no existe.
  await existsOrCreatePrivateChat(senderId, receiverId);

  const messageRef = collection(db, `private-chats/${chatId}/messages`);
  const newDoc = await addDoc(messageRef, {
    sender_id: senderId,
    content: message,
    created_at: serverTimestamp(),
  });

  return {
    id: newDoc.id,
  };
}

/**
 * Crea el chat privado entre los usuarios
 *
 * @param {string} senderId
 * @param {string} receiverId
 * @returns {Promise<void>}
 */
async function existsOrCreatePrivateChat(senderId, receiverId) {
  //busco para ver si existe el documento para el chat privado
  //entre los 2 usuarios, sino existe lo creo.
  const chatId = generatePrivateChatId(senderId, receiverId);

  if (cachedChats[chatId]) return null;

  const chatRef = doc(db, `private-chats/${chatId}`);

  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      users: [senderId, receiverId], // Guarda como un array
    });
  }

  cachedChats[chatId] = true;

  return null;
}

/**
 *
 * @param {string} senderId
 * @param {string} receiverId
 * @param {() => {}} callback
 * @returns {() => void} - Función para cancelar la suscripción.
 */
export async function subscribeToPrivateChat(senderId, receiverId, callback) {
  try {
    // Validar IDs
    if (!senderId || !receiverId) {
      throw new Error("IDs de usuario inválidos.");
    }
    await existsOrCreatePrivateChat(senderId, receiverId);

    const chatId = generatePrivateChatId(senderId, receiverId);

    const messagesRef = collection(db, `private-chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("created_at"));

    return onSnapshot(q, (snapshot) => {
      try {
        const messages = snapshot.docs.map((aDoc) => ({
          id: aDoc.id,
          sender_id: aDoc.data().sender_id,
          content: aDoc.data().content,
          created_at: aDoc.data().created_at?.toDate(),
        }));

        callback(messages);
      } catch (error) {
        console.error(
          "[private-chat.js subscribeToPrivateChat callback] Error: ",
          error
        );
        throw error;
      }
    });
  } catch (error) {
    console.error("[private-chat.js subscribeToPrivateChat] Error: ", error);
    throw error;
  }
}

/**
 * retorna el id de la sala de chat privado entre ambos usuarios.
 *
 * @param {*} id1
 * @param {*} id2
 * @returns {string}
 */
function generatePrivateChatId(id1, id2) {
  if (!id1 || !id2) {
    console.warn(
      "generatePrivateChatId recibió IDs nulos. Usando valores por defecto."
    );
    return "default_chat_id";
  }
  return [id1.trim(), id2.trim()].sort().join("_");
}
