import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
} from "firebase/auth";
import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  createUserProfile,
  getUserProfileById,
  updateUserProfile,
} from "./user-profile";
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
  role: null, // Añadimos el campo "role"
  fullyLoaded: false,
};

let userData = EMPTY_USER_DATA;
let observers = [];

// Cargar datos del usuario desde localStorage si existen
if (localStorage.getItem("user") !== null) {
  userData = JSON.parse(localStorage.getItem("user"));
}

/**
 * Escucha el estado de autenticación y carga el rol desde Firestore
 */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario autenticado detectado:", user);

    // Obtener rol desde Firestore
    const userRef = doc(db, "users", user.uid); // Corregido el uso de db
    const userSnap = await getDoc(userRef);
    const userRole = userSnap.exists() ? userSnap.data().role : "user";

    setUserData({
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: userRole,
      fullyLoaded: true,
    });
  } else {
    setUserData(EMPTY_USER_DATA);
  }
});

/**
 * Verifica si el usuario autenticado tiene el rol "admin".
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  if (!auth.currentUser) return false;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  return userSnap.exists() && userSnap.data().role === "admin";
}

/**
 * Función para registrar un nuevo usuario
 */
export async function register(email, password) {
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Usuario creado. ID:", userCredentials.user.uid);

    // Guarda el rol por defecto como "user"
    await createUserProfile(userCredentials.user.uid, { email, role: "user" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}

/**
 * Función para iniciar sesión
 */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => {
      console.log("Usuario autenticado. ID:", userCredentials.user.uid);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      throw error;
    });
}

/**
 * Función para cerrar sesión
 */
export function logout() {
  localStorage.removeItem("user");
  return signOut(auth);
}

/**
 * Función para actualizar perfil de usuario
 */
export async function updateUser({ displayName, bio, nbaFavorites, location }) {
  try {
    const authPromise = updateProfile(auth.currentUser, { displayName });
    const firestorePromise = updateUserProfile(userData.id, {
      displayName,
      bio,
      nbaFavorites,
      location,
    });
    await Promise.all([authPromise, firestorePromise]);

    setUserData({
      displayName,
      bio,
      nbaFavorites,
      location,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
}

/**
 * Actualiza la foto del usuario
 */
export async function updateUserPhoto(photo) {
  try {
    const fileName = `users/${userData.id}/avatar.${getExtensionFromFile(
      photo
    )}`;
    await uploadFile(fileName, photo);

    const photoURL = await getFileURL(fileName);
    const authPromise = updateProfile(auth.currentUser, { photoURL });
    const storagePromise = updateUserProfile(userData.id, { photoURL });

    await Promise.all([authPromise, storagePromise]);

    setUserData({ photoURL });
  } catch (error) {
    console.error("Error al actualizar la foto:", error);
    throw error;
  }
}

/**
 * Función para cambiar contraseña
 */
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

/**
 * Observador de autenticación
 */
export function subscribeToAuth(callback) {
  observers.push(callback);
  callback({ ...userData });
  return () => {
    observers = observers.filter((obs) => obs !== callback);
  };
}

/**
 * Notifica cambios en el usuario
 */
function notify(observer) {
  observer({ ...userData });
}

function notifyAll() {
  observers.forEach((observer) => notify(observer));
}

function setUserData(newData) {
  userData = { ...userData, ...newData };
  localStorage.setItem("user", JSON.stringify(userData));
  notifyAll();
}

/**
 * Retorna los datos actuales del usuario
 */
export function getUserData() {
  return userData;
}
