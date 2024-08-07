import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, updatePassword } from "firebase/auth";
import { auth } from "./firebase";
import { collection, query, where, orderBy, onSnapshot, doc, Timestamp } from "firebase/firestore"; // Importa los métodos necesarios de Firestore
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profile";
import { getFileURL, uploadFile } from "./file-storage";
import { getExtensionFromFile } from "../../libraries/file";

const EMPTY_USER_DATA = {
    id: null,
    email: null,
    displayName: null,
    bio: null,
    nbaFavorites: null,
    location: null,
    photoURL: null,
    fullyLoaded: false,
}

// Variable para los datos del usuario
let userData = EMPTY_USER_DATA;

// Defino la variable para los observers.
let observers = [];

// Guardo en localStorage datos del usuario autenticado
if (localStorage.getItem('user') !== null) {
    userData = JSON.parse(localStorage.getItem('user'));
}

// Actualizo el estado del usuario dependiendo del estado en la autenticación.
onAuthStateChanged(auth, async user => {
    if (user) {
        setUserData({
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
        });

        // Ahora que verificamos cuál es el usuario que está autenticado, procedemos a obtener el perfil completo.
        const userProfile = await getUserProfileById(user.uid);
        setUserData({
            bio: userProfile.bio,
            nbaFavorites: userProfile.nbaFavorites,
            location: userProfile.location,
            fullyLoaded: true,
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
        console.log("Usuario creado. ID: ", userCredentials.user.uid);

        // Creamos el perfil del usuario.
        await createUserProfile(userCredentials.user.uid, {email});
    } catch (error) {
        console.error("[auth.js register] Error al crear una cuenta: ", error.code);
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
    })
    .catch(error => {
        console.error("[auth.js login] Error al autenticar:", error.code);
        throw error;
    });
}

/**
 * 
 * @param {{displayName: string|null, bio: string|null, nbaFavorites: string|null, location: string|null }}
 * @returns {Promise<void>}
 */
export async function updateUser({displayName, bio, nbaFavorites, location}) {
    try {
        // Pedimos actualizar los datos en Authentication.
        const authPromise = updateProfile(auth.currentUser, {displayName});

        // Ahora pedimos actualizar la data del perfil del usuario en Firestore.
        const firestorePromise = updateUserProfile(userData.id, {displayName, bio, nbaFavorites, location});

        // Espero a que ambas promesas se completen, con ayuda de la función Promise.all().
        await Promise.all([authPromise, firestorePromise]);

        // Actualizo y notifico los cambios de los datos del perfil.
        setUserData({
            displayName,
            bio,
            nbaFavorites,
            location,
        });
    } catch (error) {
        // TODO: Manejar el error.
        throw error;
    }
}

/**
 * 
 * @param {File} photo 
 */
export async function updateUserPhoto(photo) {
    try {
        const fileName = `users/${userData.id}/avatar.${getExtensionFromFile(photo)}`;

        await uploadFile(fileName, photo);

        const photoURL = await getFileURL(fileName);
        const authPromise = updateProfile(auth.currentUser, {photoURL});
        const storagePromise = updateUserProfile(userData.id, {photoURL});

        await Promise.all([authPromise, storagePromise]);

        setUserData({photoURL});
    } catch (error) {
        // TODO: Manejar el error.
        console.error("[auth.js updateUserPhoto] Error al actualizar la foto de perfil.");
        throw error;
    }
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
    notify(callback);

    return () => {
        observers = observers.filter(obs => obs !== callback);
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
    localStorage.setItem('user', JSON.stringify(userData));

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