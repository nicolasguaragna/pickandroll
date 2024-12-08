<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import { getUserPublications } from '../services/publicaciones.js';
import { subscribeToAuth } from '../services/auth.js';

export default {
  name: 'MyPublications',
  components: { MainH1, MainButton },
  data() {
    return {
      user: null,
      publicaciones: [],
      loading: true,
    };
  },
  async created() {
    subscribeToAuth(async (currentUser) => {
      if (currentUser) {
        this.user = currentUser;
        this.publicaciones = await getUserPublications(this.user.email);
      }
      this.loading = false;
    });
  },
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <MainH1>Mis Publicaciones</MainH1>
      <button 
        @click="$router.push('/miperfil')"
        class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded text-xs"
      >
        Volver al Perfil
      </button>
    </div>

    <div v-if="loading" class="text-center">
      <p>Cargando publicaciones...</p>
    </div>

    <div v-else-if="publicaciones.length === 0" class="text-center">
      <p>No tienes publicaciones.</p>
    </div>

    <ul v-else>
      <li
        v-for="publicacion in publicaciones"
        :key="publicacion.id"
        class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
      >
        <h3 class="text-xl font-bold">{{ publicacion.title }}</h3>
        <p>{{ publicacion.content }}</p>
        <p class="text-sm text-gray-600">
          Publicado el: {{ new Date(publicacion.timestamp.seconds * 1000).toLocaleString() }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}

button {
  float: right;
  font-size: 0.75rem; /* Texto más pequeño */
}
</style>
