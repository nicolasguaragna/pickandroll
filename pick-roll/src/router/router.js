import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Chat from "../pages/Chat.vue";
import Publicaciones from "../pages/Publicaciones.vue";
import Login from "../pages/Login.vue";
import MyProfile from "../pages/MyProfile.vue";
import MyProfileEdit from "../pages/MyProfileEdit.vue";
import UserProfile from "../pages/UserProfile.vue";
import Register from "../pages/Register.vue";
import PrivateChat from "../pages/PrivateChat.vue";
import { subscribeToAuth } from "../services/auth";

const routes = [
    {path: '/',                 component: Home, },
    {path: '/chat',             component: Chat,  meta: { requiresAuth: true } },
    {path: '/publicaciones',    component: Publicaciones, meta:{ requiresAuth: true } },
    {path: '/iniciar-sesion',   component: Login, },
    {path: '/registro',         component: Register, },
    {path: '/miperfil',         component: MyProfile, meta: { requiresAuth: true } },
    { path: '/miperfil/editar', component: MyProfileEdit, meta: { requiresAuth: true } },
    {path: '/usuario/:id',      component: UserProfile, meta: { requiresAuth: true } },
    {path: '/usuario/:id/chat', component: PrivateChat, meta: { requiresAuth: true } },
];

const router = createRouter({
    routes,
    history: createWebHashHistory(),
});

//configuracion de restriccion por estado de autenticacion.
let authUser = {
    id: null,
    email: null,
}

subscribeToAuth(newUserData => authUser = newUserData);

//se ejecuta antes de cada cambio de ruta.
router.beforeEach((to, from) => {
    //console.log('[router] Navegando a la ruta...', to.path);
    //para acceder al chat el usuario debe estar autenticado.
    if(authUser.id === null && to.meta.requiresAuth) {
        return {
            path: '/iniciar-sesion',
        };
    }
});

export default router;