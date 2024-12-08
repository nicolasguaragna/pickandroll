<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import TextWithDefault from '../components/TextWithDefault.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { subscribeToAuth } from '../services/auth';

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
            unsubscribeFromAuth: () => {},
        }
    },
    mounted() {
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => this.authUser = newUserData);
    },
    unmounted() {
        this.unsubscribeFromAuth();
    }
}
</script>

<template>
    <template v-if="authUser.fullyLoaded">
        <div class="flex items-end gap-4">
            <MainH1>Mi Perfil</MainH1>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/editar">Editar</router-link>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/editar/foto">Editar mi Foto</router-link>
            <router-link class="mb-4 text-blue-700 underline" to="/miperfil/mis-publicaciones">Mis Publicaciones</router-link>
        </div>

        <UserProfileData :user="authUser" />
    </template>
    <Loader v-else />
</template>