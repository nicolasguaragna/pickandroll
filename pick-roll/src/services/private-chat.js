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
    await existsOrCreatePrivateChat(senderId, receiverId);

    const messageRef = collection(db, `private-chats/${chatId}/messages`);
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
async function existsOrCreatePrivateChat(senderId, receiverId) {
    //busco para ver si existe el documento para el chat privado
    //entre los 2 usuarios, sino existe lo creo.
    const chatId = generatePrivateChatId(senderId, receiverId);

    if(cachedChats[chatId]) return null;

    const chatRef = doc(db, `private-chats/${chatId}`);

    const chatDoc = await getDoc(chatRef);

    if(!chatDoc.exists()) {
        await setDoc(chatRef, {
            users: {    
                [senderId]: true,
                [receiverId]: true,
            }
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
        await existsOrCreatePrivateChat(senderId, receiverId);

        const chatId = generatePrivateChatId(senderId, receiverId);

        const messagesRef = collection(db, `private-chats/${chatId}/messages`);

        const q = query(messagesRef, orderBy('created_at'));

        return onSnapshot(q, snapshot => {
            try {
                const messages = snapshot.docs.map(aDoc => {
                    return {
                        id: aDoc.id,
                        sender_id: aDoc.data().sender_id,
                        content: aDoc.data().content,
                        // Como created_at se crea recién cuando se grabó efectivamente en el servidor el documento, la primera
                        // que se nos informa de un documento nuevo creado localmente, este valor está en null.
                        // Por eso, vamos a solo pedir que se haga el toDate() si el valor *no* es null con ayuda del
                        // "optional chaining".
                        // Es decir, lo que sigue al operador solo se ejecuta si el valor anterior no es null/undefined, como 
                        // acabamos de mencionar. De lo contrario, se retorna el null o undefined.
                        created_at: aDoc.data().created_at?.toDate(),
                    }
                });

                callback(messages);
            } catch (error) {
                console.error("[private-chat.js subscribeToPrivateChat callback] Error: ", error);
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
    return [id1, id2].sort().join('_');
}
