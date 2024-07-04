<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import UserProfileData from '../components/UserProfileData.vue';
import { getUserProfileById } from '../services/user-profile';


export default {
    name: 'UserProfile',
    components: {MainH1, Loader, UserProfileData},
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

        <UserProfileData :user="user" />
        <hr class="mb-4"/>

        <router-link :to="`/usuario/${user.id}/chat`" class="text-green-400 underline">Chatear con {{ user.email }}</router-link>
    </template>
</template>