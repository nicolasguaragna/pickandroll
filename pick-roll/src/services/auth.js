import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, updatePassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore"; // Importa los métodos necesarios de Firestore
import { createUserProfile } from "./perfil-usuario";

const EMPTY_USER_DATA = {
    id: null,
    email: null,
};

// Variable para los datos del usuario
let userData = EMPTY_USER_DATA;

// Defino la variable para los observers.
let observers = [];

// Guardo en localStorage datos del usuario autenticado
if (localStorage.getItem('user') !== null) {
    try {
        userData = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error("Error parsing user data from localStorage", e);
    }
}

// Actualizo el estado del usuario dependiendo del estado en la autenticación.
onAuthStateChanged(auth, user => {
    if (user) {
        setUserData({
            id: user.uid,
            email: user.email,
        });
    } else {
        setUserData(EMPTY_USER_DATA);
    }
});

/**
 * Crea la cuenta de usuario y lo autentica.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<void>} 
 */
export async function register(email, password) {
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Usuario creado. ID:", userCredentials.user.uid);
    
        // Creamos perfil del usuario
        await createUserProfile(userCredentials.user.uid, { email });

    } catch (error) {
        console.error("[auth.js register] Error al crear una cuenta:", error.code);
        throw error;
    }
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<void>}
 */
export function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
    .then(userCredentials => {
        console.log("Usuario autenticado. ID:", userCredentials.user.uid);
        setUserData({
            id: userCredentials.user.uid,
            email: userCredentials.user.email,
        });
    })
    .catch(error => {
        console.error("[auth.js login] Error al autenticar:", error.code);
        throw error;
    });
}

/**
 * @returns {Promise<void>}
 */
export function logout() {
    localStorage.removeItem('user');
    return signOut(auth);
}

/**
 * Este callback se ejecuta cada vez que el estado cambie y cuando se suscribe.
 * Retorna una función para cancelar la suscripción
 * 
 * @param {() => {}} callback 
 * @returns {() => void}
 */
export function subscribeToAuth(callback){
    observers.push(callback);

    console.log("[auth.js subscribeToAuth] Observer suscrito. El stack actual es:", observers);

    notify(callback);

    // Retorno nueva función, al ejecutarse cancela la suscripción. 
    // Elimina del array de observers a este callback.
    return () => {
        observers = observers.filter(obs => obs !== callback);
        // console.log("[auth.js subscribeToAuth] Observer removido. El stack actual es:", observers);
    };
}

/**
 * Notifica a un observer de los datos actuales del usuario.
 * @param {() => {}} observer 
 */
function notify(observer) {
    observer({ ...userData });
}

/**
 * Notifica a todos los observers.
 */
function notifyAll() {
    observers.forEach(observer => notify(observer));
}

/**
 * Actualiza los datos del objeto userData y notifica a todos
 * los observers suscritos del cambio.
 * 
 * @param {{}} newData 
 */
function setUserData(newData) {
    userData = {
        ...userData,
        ...newData,
    };

    // Guardo en localStorage los nuevos datos
    try {
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
        console.error("Error storing user data to localStorage", e);
    }

    notifyAll();
}

/**
 * Obtener todas las publicaciones de un usuario en tiempo real.
 * @param {string} userEmail email del usuario
 * @returns {Promise} Promesa que resuelve a un array de publicaciones
 */
export function getUserPublicaciones(userEmail, callback) {
    const publicacionesQuery = query(collection(db, "publicaciones"), 
        where("userEmail", "==", userEmail),
        orderBy("timestamp", "desc")
    );
    return onSnapshot(publicacionesQuery, (snapshot) => {
        const publicaciones = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Convierte el Firestore Timestamp a Date
            if (data.timestamp instanceof Timestamp) {
                data.timestamp = data.timestamp.toDate();
            }
            publicaciones.push({ id: doc.id, ...data });
        });
        console.log("Número de publicaciones obtenidas:", publicaciones.length); // Agregar log para ver la cantidad de publicaciones
        if (publicaciones.length === 0) {
            console.log("No se encontraron publicaciones para el usuario con email:", userEmail);
        }
        callback(publicaciones);
    }, (error) => {
        console.error("Error al obtener publicaciones:", error);
    });
}

export function getUserData() {
    return userData;
}

export async function updateUserProfile(userId, newProfileData) {
    try {
        // Actualiza los datos del usuario en Firestore
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, newProfileData);

        // Si también deseas actualizar el perfil en Firebase Auth
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, newProfileData);
        }

        console.log("Perfil del usuario actualizado con éxito.");
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario:", error);
        throw error;
    }
}

export async function changeUserPassword(newPassword) {
    try {
        if (auth.currentUser) {
            await updatePassword(auth.currentUser, newPassword);
            console.log("Contraseña actualizada con éxito.");
        } else {
            throw new Error("No hay usuario autenticado.");
        }
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        throw error;
    }   
}