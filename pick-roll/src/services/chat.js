// va ser el archivo donde estan las funciones donde esta el chat publico
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * 
 * @param {{email: string, content: string}} data 
 * @returns {Promise<null>}
 */

export function saveMessage(data) {
    //referencia a la coleccion del chat donde grabamos el mensaje.
    const refChat = collection(db, 'chat');

    return addDoc(refChat, {
        ...data,
        //el servidor de firestore genera la fecha
        created_at: serverTimestamp(),
    })
        .then(doc => {

        });
}

/**
 * ejecuta el callback, cada vez que los msjs cambien.
 * 
 * @param {(messages: {email: string, content: string}[]) => null} callback 
 * @returns {Unsubscribe}
 */
export function subscribeToChatMessages(callback){
    const refChat = collection(db, 'chat');

    //ordenamos los mensajes por fecha de creacion
    const q = query(refChat, orderBy('created_at'));

    //seteamos una subscripcion para recibir nuevos mensajes
    return onSnapshot(q, snapshot => {
        //console.log("Snapshot: ", snapshot);
        console.log("Snapshot documentos:", snapshot.docs);

        const messages = snapshot.docs.map(doc => {
            return {
                user_id: doc.data().user_id,
                email: doc.data().email,
                content: doc.data().content,
                created_at: doc.data().created_at.toDate(),
        }
    });
    //llamamos al callback pra que lo renderize. 
    callback(messages);
});
}