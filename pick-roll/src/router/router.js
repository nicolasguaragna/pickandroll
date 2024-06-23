import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Chat from "../pages/Chat.vue";
import Publicaciones from "../pages/Publicaciones.vue";
import Login from "../pages/Login.vue";
import MiPerfil from "../pages/MiPerfil.vue";
import PerfilUsuario from "../pages/PerfilUsuario.vue";
import Register from "../pages/Register.vue";
import PrivateChat from "../pages/PrivateChat.vue";
import { subscribeToAuth } from "../services/auth";

const routes = [
    {path: '/', component: Home, },
    {path: '/chat', component: Chat,  meta: { requiresAuth: true } },
    {path: '/publicaciones', component: Publicaciones, meta:{ requiresAuth: true } },
    {path: '/iniciar-sesion', component: Login, },
    {path: '/registro', component: Register, },
    {path: '/miperfil', component: MiPerfil, meta: { requiresAuth: true } },
    {path: '/usuario/:id', component: PerfilUsuario, meta: { requiresAuth: true } },
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