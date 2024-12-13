<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import TextWithDefault from '../components/TextWithDefault.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { subscribeToAuth, changeUserPassword } from '../services/auth'; // Importa las funciones necesarias
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"; // Métodos para reautenticar
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
            showPasswordModal: false, // Modal para cambiar contraseña
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            showCurrentPassword: false, // Controla la visibilidad de la contraseña actual
            showNewPassword: false, // Controla la visibilidad de la nueva contraseña
            showConfirmPassword: false, // Controla la visibilidad de la confirmación de contraseña
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

                // Reautenticar al usuario
                await reauthenticateWithCredential(auth.currentUser, credential);

                // Cambiar la contraseña
                await changeUserPassword(this.newPassword);
                alert('Contraseña actualizada con éxito.');
                this.showPasswordModal = false;

                // Limpiar campos
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
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
            if (type === 'current') {
                this.showCurrentPassword = !this.showCurrentPassword;
            } else if (type === 'new') {
                this.showNewPassword = !this.showNewPassword;
            } else if (type === 'confirm') {
                this.showConfirmPassword = !this.showConfirmPassword;
            }
        },
    },
    mounted() {
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => this.authUser = newUserData);
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
