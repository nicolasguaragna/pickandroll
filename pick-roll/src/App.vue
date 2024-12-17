<script>
import Home from './pages/Home.vue';
import BackToTop from './components/BackToTop.vue';
import { logout, subscribeToAuth } from './services/auth';

export default {
    name: 'App',
    components: { Home, BackToTop },
    data() {
        return {
            authUser: null, // Inicializamos en null
            isLoading: true, // Estado de carga
        };
    },
    methods: {
        handleLogout() {
            logout();
            this.authUser = null;
            this.$router.push('/iniciar-sesion');
        }
    },
    mounted() {
        subscribeToAuth(newUserData => {
            this.authUser = newUserData || null; // Garantiza un estado seguro
            console.log("Usuario autenticado:", this.authUser);
            this.isLoading = false;
        });
    }
}
</script>

<template>
    <div class="font-sans grid grid-rows-layout h-full">
        <!-- Mostrar loader mientras se carga la autenticación -->
        <div v-if="isLoading" class="text-center p-8">
            <p>Cargando...</p>
        </div>

        <!-- Contenido de la aplicación -->
        <div v-else>
            <nav class="flex justify-center items-center h-24 bg-customGray p-4 text-white">
                <div class="flex items-center">
                    <img src="/logo-pick.webp" alt="Pick and Roll Logo" class="h-20 w-30 mr-2">
                </div>
                <ul class="flex gap-16">
                    <li><router-link to="/">Inicio</router-link></li>
                    <li><router-link to="/chat">Chat Público</router-link></li>
                    <li><router-link to="/publicaciones">Publicaciones</router-link></li>
                    <template v-if="authUser === null">
                        <li><router-link to="/iniciar-sesion">Inicio de sesión</router-link></li>
                        <li><router-link to="/registro">Registro</router-link></li>
                    </template>
                    <template v-else>
                        <li><router-link to="/miperfil">Mi Perfil</router-link></li>
                        <li>
                            <form @submit.prevent="handleLogout">
                                <button type="submit">{{ authUser.email }} (Cerrar Sesión)</button>
                            </form>
                        </li>
                    </template>
                </ul>
            </nav>
            <main class="container p-12 mx-auto">
                <router-view></router-view>
            </main>
            <footer class="flex flex-col justify-center items-center bg-gray-300 text-white p-4">
                <img src="/logo-pick.webp" alt="Logo" class="h-28 mb-4">
                <p class="text-sm">&copy; Fernando Nicolas Guaragna - Clientes Web Mobile 2024</p>
            </footer>
            <BackToTop />
        </div>
    </div>
</template>
