import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc} from "firebase/firestore";
import { db } from "./firebase";

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {string} message 
 * @returns {Promise<{id: string}>}
 */

export async function sendPrivateChatMessage(senderId, receiverId, message) {

    const chatId = generatePrivateChatId(senderId, receiverId);

    const chatRef = doc(db, `private-chat/${chatId}`);
    await setDoc(chatRef, {
        [senderId]: true,
        [receiverId]: true,  
    });

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
