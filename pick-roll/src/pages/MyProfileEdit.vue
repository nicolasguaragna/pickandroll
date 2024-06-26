<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
// import MainInput from '../components/MainInput.vue';
import MainButton from '../components/MainButton.vue';
import { subscribeToAuth } from '../services/auth';

export default {
    name: 'MyProfileEdit',
    components: { MainH1, MainLabel, MainButton },
    data() {
        return {
            authUser: {
                id: '',
                email: '',
                displayName: '',
                bio: '',
                nbaFavorites: '',
                location: '',
                photoURL: null,
            },
            unsubscribeFromAuth: () => {},

            profileData: {
                displayName: '',
                bio: '',
                nbaFavorites: '',
                location: '',
                // photoURL: null,
            },
            editingProfile: false,
        }
    },
    methods: {
        async handleSubmit() {
            this.editingProfile = true;
            try {
                await updateUser({
                    displayName: this.profileData.displayName,
                    bio: this.profileData.bio,
                    nbaFavorites: this.profileData.nbaFavorites,
                    location: this.profileData.location,
                });
            } catch (error) {
                // TODO
                console.error('[MyProfileEdit handleSubmit] Error al editar el perfil: ', error);
            }
            this.editingProfile = false;
        }
    },
    mounted() {
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => {
            this.authUser = newUserData;

            // Aprovechamos para setear los valores iniciales del formulario de edición.
            this.profileData.displayName = this.authUser.displayName;
            this.profileData.nbaFavorites = this.authUser.nbaFavorites;
            this.profileData.bio = this.authUser.bio;
            this.profileData.location = this.authUser.location;
        });
    },
    unmounted() {
        this.unsubscribeFromAuth();
    }
}
</script>

<template>
    <MainH1>Editar mi Perfil</MainH1>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
    >
        <div class="mb-3">
            <MainLabel for="bio">Biografía</MainLabel>
            <textarea
                id="bio"
                class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile"
                v-model="profileData.bio"
            ></textarea>
        </div>
        <div class="mb-3">
            <MainLabel for="displayName">Nombre de Usuario</MainLabel>
            <input
                type="text"
                id="displayName"
                class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile"
                v-model="profileData.displayName"
            >
        </div>
        <div class="mb-3">
            <MainLabel for="nbaFavorites">Favoritos de la NBA</MainLabel>
            <input
                type="text"
                id="nbaFavorites"
                class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile"
                v-model="profileData.nbaFavorites"
            >
        </div>
        <div class="mb-3">
            <MainLabel for="nbaFavorites">Ubicación</MainLabel>
            <input
                type="text"
                id="nbaFavorites"
                class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile"
                v-model="profileData.location"
            >
        </div>
        <MainButton :disabled="editingProfile">Actualizar mis datos</MainButton>
    </form>
</template>