import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Chat from "../pages/Chat.vue";
import Publicaciones from "../pages/Publicaciones.vue";
import Login from "../pages/Login.vue";
import MyProfile from "../pages/MyProfile.vue";
import MyProfileEdit from "../pages/MyProfileEdit.vue";
import MyProfileEditPhoto from "../pages/MyProfileEditPhoto.vue";
import UserProfile from "../pages/UserProfile.vue";
import Register from "../pages/Register.vue";
import PrivateChat from "../pages/PrivateChat.vue";
import MyPublications from "../pages/MyPublications.vue";
import { auth } from "../services/firebase"; // Firebase auth
import { getUserData } from "../services/auth";

const routes = [
  { path: "/", component: Home },
  { path: "/chat", component: Chat, meta: { requiresAuth: true } },
  {
    path: "/publicaciones",
    component: Publicaciones,
    meta: { requiresAuth: true },
  },
  { path: "/iniciar-sesion", component: Login },
  { path: "/registro", component: Register },
  { path: "/miperfil", component: MyProfile, meta: { requiresAuth: true } },
  {
    path: "/miperfil/editar",
    component: MyProfileEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/miperfil/editar/foto",
    component: MyProfileEditPhoto,
    meta: { requiresAuth: true },
  },
  {
    path: "/miperfil/mis-publicaciones",
    component: MyPublications,
    meta: { requiresAuth: true },
  },
  {
    path: "/usuario/:id",
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: "/usuario/:id/chat",
    component: PrivateChat,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Guard de navegación para proteger rutas
let authReady = false;
let authUser = null;

function waitForAuthState() {
  return new Promise((resolve) => {
    if (authReady) {
      resolve(authUser);
    } else {
      // Escuchar una sola vez el cambio de autenticación
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, (user) => {
          authUser = user ? { id: user.uid, email: user.email } : null;
          authReady = true;
          resolve(authUser);
        });
      });
    }
  });
}

// Guard que se ejecuta antes de cada navegación
router.beforeEach(async (to, from, next) => {
  const user = await waitForAuthState();

  if (to.meta.requiresAuth && !user) {
    return next({ path: "/iniciar-sesion" });
  }

  if ((to.path === "/iniciar-sesion" || to.path === "/registro") && user) {
    return next({ path: "/miperfil" });
  }

  next();
});

export default router;
