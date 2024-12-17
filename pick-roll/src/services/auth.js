import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  getIdTokenResult,
} from "firebase/auth";
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  role: null,
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
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userRole = userSnap.exists() ? userSnap.data().role : "user";

    // Verificar rol admin en Custom Claims
    const isAdminClaim = await isAdminCustomClaim();

    setUserData({
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: isAdminClaim ? "admin" : userRole, // Prioriza el rol desde Custom Claims
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
 * Verifica si el usuario autenticado tiene el rol "admin" basado en Custom Claims.
 * @returns {Promise<boolean>}
 */
export async function isAdminCustomClaim() {
  if (!auth.currentUser) return false;

  try {
    const idTokenResult = await auth.currentUser.getIdTokenResult();
    return !!idTokenResult.claims.admin; // Devuelve true si el claim "admin" existe
  } catch (error) {
    console.error("Error al obtener Custom Claims:", error);
    return false;
  }
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

    await updateDoc(doc(db, "users", userCredentials.user.uid), {
      email,
      role: "user",
    });
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
    // Verifica si el usuario autenticado está disponible
    if (!auth.currentUser) {
      throw new Error("No hay un usuario autenticado.");
    }

    const uid = auth.currentUser.uid; // Obtén el UID actual del usuario

    // Actualiza el perfil de autenticación de Firebase
    const authPromise = updateProfile(auth.currentUser, { displayName });

    // Actualiza el documento en Firestore usando el UID como referencia
    const firestorePromise = updateDoc(doc(db, "users", uid), {
      displayName,
      bio,
      nbaFavorites,
      location,
    });

    // Espera a que ambas operaciones finalicen
    await Promise.all([authPromise, firestorePromise]);

    // Actualiza localmente los datos del usuario
    setUserData({
      displayName,
      bio,
      nbaFavorites,
      location,
    });

    console.log("Perfil actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error; // Lanza el error para manejarlo externamente
  }
}

/**
 * Actualiza la foto del usuario
 */
export async function updateUserPhoto(photo) {
  try {
    if (!auth.currentUser) throw new Error("No hay un usuario autenticado.");

    const fileName = `users/${
      auth.currentUser.uid
    }/avatar.${getExtensionFromFile(photo)}`;
    await uploadFile(fileName, photo);

    const photoURL = await getFileURL(fileName);
    await updateProfile(auth.currentUser, { photoURL });
    await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL });

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
    if (!auth.currentUser) throw new Error("No hay usuario autenticado.");
    await updatePassword(auth.currentUser, newPassword);
    console.log("Contraseña actualizada con éxito.");
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
}

/**
 * Observador de autenticación
 */
export function subscribeToAuth(callback) {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // Asegura que traes los datos actualizados de Firestore
        const userDataFromFirestore = userDocSnap.exists()
          ? userDocSnap.data()
          : {};

        const idTokenResult = await user.getIdTokenResult(true);
        const isAdmin = idTokenResult.claims.admin || false;

        // Notifica al callback con datos actualizados
        callback({
          uid: user.uid,
          email: user.email,
          displayName: userDataFromFirestore.displayName || user.displayName,
          bio: userDataFromFirestore.bio || "",
          nbaFavorites: userDataFromFirestore.nbaFavorites || "",
          location: userDataFromFirestore.location || "",
          photoURL: user.photoURL || "",
          isAdmin,
          fullyLoaded: true,
        });
      } catch (error) {
        console.error("Error al obtener datos actualizados:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return unsubscribe;
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
