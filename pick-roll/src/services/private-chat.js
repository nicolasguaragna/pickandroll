import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
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

}

export function subscribeToPrivateChat (senderId, receiverId, callback) {
    
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
