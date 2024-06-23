<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import { getUserProfileById } from '../services/perfil-usuario';

export default {
    name: 'PerfilUsuario',
    components: {MainH1, Loader},
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            userLoaded: false,
        }
    },
    async mounted() {
        this.userLoaded = false;
        //datos del perfil del usuario
        this.user = await getUserProfileById(this.$route.params.id);
        this.userLoaded = true;
    }
}
</script>

<template>
    <Loader v-if="!userLoaded" /> 
    <template v-else>
        <MainH1>Perfil de {{ user.email }}</MainH1>

        <hr class="mb-4"/>

        <router-link :too="`/usuario/${user.id}/chat`" class="text-green-400 underline"></router-link>
    </template>
</template>