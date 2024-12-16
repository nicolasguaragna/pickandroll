<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import TextWithDefault from '../components/TextWithDefault.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { subscribeToAuth, changeUserPassword, isAdminCustomClaim } from '../services/auth'; // Importa la función
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from '../services/firebase';

export default {
    name: 'MyProfile',
    components: { MainH1, TextWithDefault, Loader, UserProfileData },
    data() {
        return {
            authUser: {
                id: null,
                email: null,
                displayName: null,
                bio: null,
                nbaFavorites: null,
                location: null,
                photoURL: null,
                fullyLoaded: false,
            },
            unsubscribeFromAuth: () => { },
            isAdmin: false, // Variable para almacenar si el usuario es admin
            showPasswordModal: false,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
        };
    },
    methods: {
        async handleChangePassword() {
            if (this.newPassword !== this.confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                const credential = EmailAuthProvider.credential(
                    this.authUser.email,
                    this.currentPassword
                );

                await reauthenticateWithCredential(auth.currentUser, credential);
                await changeUserPassword(this.newPassword);
                alert('Contraseña actualizada con éxito.');
                this.handleCancelChangePassword();
            } catch (error) {
                console.error('Error al cambiar la contraseña:', error);
                alert('Hubo un error al cambiar la contraseña. Verifique sus datos.');
            }
        },
        handleCancelChangePassword() {
            this.showPasswordModal = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
        },
        togglePasswordVisibility(type) {
            if (type === 'current') this.showCurrentPassword = !this.showCurrentPassword;
            if (type === 'new') this.showNewPassword = !this.showNewPassword;
            if (type === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
        },
    },
    async mounted() {
        // Cargar datos de autenticación
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => this.authUser = newUserData);

        // Verificar si el usuario tiene el rol de admin
        this.isAdmin = await isAdminCustomClaim();
        console.log(this.isAdmin ? "El usuario es admin." : "El usuario no es admin.");
    },
    unmounted() {
        this.unsubscribeFromAuth();
    },
};
</script>

<template>
    <template v-if="authUser.fullyLoaded">
        <div class="flex items-end gap-4">
            <MainH1>Mi Perfil</MainH1>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/editar">Editar</router-link>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/editar/foto">Editar mi Foto</router-link>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/mis-publicaciones">Mis
                Publicaciones</router-link>
            <button @click="showPasswordModal = true"
                class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                Cambiar Contraseña
            </button>
        </div>

        <!-- Mensaje exclusivo para administradores -->
        <div v-if="isAdmin" class="mt-4 p-2 bg-green-100 rounded border border-green-300">
            <p class="text-green-700 font-semibold">¡Eres administrador! 🎉 Tienes acceso a funciones avanzadas.</p>
        </div>

        <UserProfileData :user="authUser" />
    </template>
    <Loader v-else />

    <!-- Modal de Cambio de Contraseña -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 class="text-xl font-bold mb-4">Cambiar Contraseña</h2>
            <form @submit.prevent="handleChangePassword">
                <div class="mb-4 relative">
                    <label for="currentPassword" class="block mb-2 font-bold">Contraseña Actual</label>
                    <input :type="showCurrentPassword ? 'text' : 'password'" id="currentPassword"
                        v-model="currentPassword" class="w-full p-2 border border-gray-300 rounded mb-4" required />
                    <button type="button" @click="togglePasswordVisibility('current')"
                        class="absolute right-3 top-10 text-gray-500">
                        {{ showCurrentPassword ? '🏀' : '⬤' }}
                    </button>
                </div>

                <div class="mb-4 relative">
                    <label for="newPassword" class="block mb-2 font-bold">Nueva Contraseña</label>
                    <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword"
                        class="w-full p-2 border border-gray-300 rounded mb-4" required />
                    <button type="button" @click="togglePasswordVisibility('new')"
                        class="absolute right-3 top-10 text-gray-500">
                        {{ showNewPassword ? '🏀' : '⬤' }}
                    </button>
                </div>

                <div class="mb-4 relative">
                    <label for="confirmPassword" class="block mb-2 font-bold">Confirmar Nueva Contraseña</label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                        v-model="confirmPassword" class="w-full p-2 border border-gray-300 rounded mb-4" required />
                    <button type="button" @click="togglePasswordVisibility('confirm')"
                        class="absolute right-3 top-10 text-gray-500">
                        {{ showConfirmPassword ? '🏀' : '⬤' }}
                    </button>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="submit" class="bg-green-500 text-white font-bold py-2 px-4 rounded">Guardar</button>
                    <button @click="handleCancelChangePassword"
                        class="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.container {
    max-width: 800px;
}
</style>
