<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { getUserProfileById } from '../services/user-profile';
import { getUserPublications } from '../services/publicaciones';

export default {
    name: 'UserProfile',
    components: { MainH1, Loader, UserProfileData },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            publicaciones: [], // Almacena las publicaciones del usuario
            userLoaded: false,
            publicacionesLoaded: false,
        };
    },
    async mounted() {
        this.userLoaded = false;
        this.publicacionesLoaded = false;

        // Cargar datos del perfil del usuario
        this.user = await getUserProfileById(this.$route.params.id);
        this.userLoaded = true;

        // Cargar publicaciones del usuario
        if (this.user.email) {
            this.publicaciones = await getUserPublications(this.user.email);
        }
        this.publicacionesLoaded = true;
    },
};
</script>

<template>
    <Loader v-if="!userLoaded || !publicacionesLoaded" />
    <template v-else>
        <MainH1>Perfil de {{ user.email }}</MainH1>

        <UserProfileData :user="user" />
        <hr class="mb-4" />

        <h2 class="text-lg font-bold mt-6 mb-4">Publicaciones de {{ user.displayName || user.email }}</h2>
        <ul v-if="publicaciones.length > 0">
            <li v-for="publicacion in publicaciones" :key="publicacion.id"
                class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                <h3 class="text-xl font-bold">{{ publicacion.title }}</h3>
                <p>{{ publicacion.content }}</p>
                <p class="text-sm text-gray-600">
                    Publicado el: {{ new Date(publicacion.timestamp.seconds * 1000).toLocaleString() }}
                </p>
                <img v-if="publicacion.imageUrl" :src="publicacion.imageUrl" alt="Imagen de la publicación"
                    class="w-full h-auto rounded-lg mt-4" />
            </li>
        </ul>
        <p v-else class="text-center text-gray-600">Este usuario aún no tiene publicaciones.</p>

        <router-link :to="`/usuario/${user.id}/chat`" class="text-green-400 underline">
            Chatear con {{ user.email }}
        </router-link>
    </template>
</template>

<style scoped>
.container {
    max-width: 800px;
}
</style>
