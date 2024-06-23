<script>
import Home from './pages/Home.vue';
import BackToTop from './components/BackToTop.vue';
import { logout, subscribeToAuth } from './services/auth';

export default {
    name: 'App',
    components: {Home, BackToTop},
    data() {
        return {
            authUser: {
                id: null,
                email: null,
            }
        };
    },
    methods: {
        handleLogout() {
            logout();
            this.$router.push({
                path: '/iniciar-sesion',
            });
        }
    },
    mounted() {
        subscribeToAuth(newUserData => this.authUser = newUserData);
    }
}

</script>

<template>
    <div class="font-sans grid grid-rows-layout h-full bg-cover bg-center bg-no-repeat">
        <nav class="flex justify-center items-center h-24 bg-customGray p-4 text-white">
            <div class="flex items-center">
                <img src="/logo-pick.webp" alt="Pick and Roll Logo" class="h-20 w-30 mr-2">
            </div>
            <ul class="flex gap-16">
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/chat">Chat Público</router-link></li>
                <li><router-link to="/publicaciones">Publicaciones</router-link></li>
                <template v-if="authUser.id === null">
                    <li><router-link to="/iniciar-sesion">Inicio de sesión</router-link></li>
                    <li><router-link to="/registro">Registro</router-link></li>
                </template>
                <template v-else>
                    <li><router-link to="/miperfil">Mi Perfil</router-link></li>
                    <li>
                        <form action="#" @submit.prevent="handleLogout">
                            <button type="submit">{{ authUser.email }} (Cerrar Sesión)</button>
                        </form>
                    </li>
                </template>
            </ul>
        </nav>
        <main class="container p-12 mx-auto">
            <router-view></router-view>
        </main>



        <footer class="flex flex-col justify-center items-center h-footer bg-gray-300 text-white p-4">
            <div>
                <img src="/logo-pick.webp" alt="Logo" class="h-28 mb-4">
            </div>
            <p class="text-sm">&copy; Fernando Nicolas Guaragna - Clientes Web Mobile 2024</p>
        </footer>

        <BackToTop />
    </div>  
</template>    