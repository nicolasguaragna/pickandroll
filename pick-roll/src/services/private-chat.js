import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc} from "firebase/firestore";
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
    await existOrCreatePrivateChat(senderId, receiverId);

    const messageRef = collection(db, `private-chat/${chatId}/messages`);
    const newDoc = await addDoc(messageRef, {
        sender_id: senderId,
        content: message,
        created_at: serverTimestamp(),
    });

    return {
        id: newDoc.id,
    }
}

/**
 * Crea el chat privado entre los usuarios
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @returns {Promise<void>}
 */
async function existOrCreatePrivateChat(senderId, receiverId) {
    //busco para ver si existe el documento para el chat privado
    //entre los 2 usuarios, sino existe lo creo.
    const chatId = generatePrivateChatId(senderId, receiverId);

    if(cachedChats[chatId]) return null;

    const chatRef = doc(db, `private-chats/${chatId}`);

    const chatDoc = getDoc(chatRef);

    if(!chatDoc.exists()) {
        return await setDoc(chatRef, {
            [senderId]: true,
            [receiverId]: true,
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
export function subscribeToPrivateChat(senderId, receiverId, callback) {
    const chatId = generatePrivateChatId(senderId, receiverId);

    const messagesRef = collection(db, `private-chats/${chatId}/messages`);

    const q = query(messagesRef, orderBy('created_at'));

    return onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(aDoc => {
            return {
                id: aDoc.id,
                sender_id: aDoc.data().sender_id,
                content: aDoc.data().content,
                created_at: aDoc.data().created_at?.toDate(),
            }
        });

        callback(messages);
    });
}


/**
 * retorna el id de la sala de chat privado entre ambos usuarios.
 * 
 * @param {*} id1 
 * @param {*} id2 
 * @returns {string} 
 */
function generatePrivateChatId(id1, id2) { 
    return [id1, id2].sort().join('_');
}
