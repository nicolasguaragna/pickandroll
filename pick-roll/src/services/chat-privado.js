import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function sendPrivateChatMessage(senderId, receiverId, message) {
    
    const chatId = generateChatPrivadoId(senderId, receiverId);

    const chatRef = doc(db, `chat-privado/${chatId}`);
    await setDoc(chatRef, {
        [senderId]: true,
        [receiverId]: true,  
    });

    const messageRef = collection(db, `chat-privado/${chatId}/messages`);
    const newDoc

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

function generateChatPrivadoId(id1, id2) { 
    return [id1, id2].sort().join('_');
}
