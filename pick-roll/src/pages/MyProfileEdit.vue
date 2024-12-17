<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
// import MainInput from '../components/MainInput.vue';
import MainButton from '../components/MainButton.vue';
import { subscribeToAuth, updateUser } from '../services/auth';

export default {
    name: 'MyProfileEdit',
    components: { MainH1, MainLabel, MainButton },
    data() {
        return {
            // Nos trae los datos ya definidos del usuario autenticado
            authUser: {
                id: '',
                email: '',
                displayName: '',
                bio: '',
                nbaFavorites: '',
                location: '',
                photoURL: null,
            },
            unsubscribeFromAuth: () => { },

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
            console.log("Datos que se envían a Firestore:", this.profileData); // Verifica los datos
            try {
                await updateUser({
                    displayName: this.profileData.displayName,
                    bio: this.profileData.bio,
                    nbaFavorites: this.profileData.nbaFavorites,
                    location: this.profileData.location,
                });
                // Redirigir al perfil después de actualizar
                this.$router.push('/miperfil');
            } catch (error) {
                console.error('[MyProfileEdit handleSubmit] Error al editar el perfil: ', error);
                alert('Hubo un error al actualizar los datos. Por favor, inténtalo de nuevo.');
            } finally {
                this.editingProfile = false;
            }
        }
    },
    mounted() {
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => {
            this.authUser = newUserData;

            // Seteo los valores iniciales del formulario de edición
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

    <form action="#" @submit.prevent="handleSubmit">
        <div class="mb-3">
            <MainLabel for="bio">Biografía</MainLabel>
            <textarea id="bio" class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile" v-model="profileData.bio"></textarea>
        </div>
        <div class="mb-3">
            <MainLabel for="displayName">Nombre de Usuario</MainLabel>
            <input type="text" id="displayName" class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile" v-model="profileData.displayName">
        </div>
        <div class="mb-3">
            <MainLabel for="nbaFavorites">Favoritos de la NBA</MainLabel>
            <input type="text" id="nbaFavorites" class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile" v-model="profileData.nbaFavorites">
        </div>
        <div class="mb-3">
            <MainLabel for="location">Ubicación</MainLabel>
            <input type="text" id="nbaFavorites" class="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                :disabled="editingProfile" v-model="profileData.location">
        </div>
        <MainButton :disabled="editingProfile">Actualizar mis datos</MainButton>
    </form>
</template>