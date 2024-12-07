<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import { getAllPublicaciones, createPublicacion, subscribeToComments, createComment } from '../services/publicaciones.js';
import { subscribeToAuth } from '../services/auth.js';
    
export default {
  name: 'Publicaciones',
  components: { MainH1, MainButton },
  data() {
    return {
      publicaciones: [],
      newPublicacion: {
        title: '',
        content: ''
      },
      user: null,
      loading: false,
      comments: {},
      unsubscribeFromComments: {}, // Guardamos las funciones para cancelar los listeners
      newComment: {}
    };
  },
  async created() {
    this.publicaciones = await getAllPublicaciones();
    for (let publicacion of this.publicaciones) {
      // Configuramos el listener para los comentarios
      this.unsubscribeFromComments[publicacion.id] = subscribeToComments(publicacion.id, (updatedComments) => {
        this.comments[publicacion.id] = updatedComments;
      });
    }
    subscribeToAuth(user => {
      this.user = user;
    });
  },
  beforeUnmount() {
    // Cancelamos los listeners cuando el componente se desmonta
    for (let unsubscribe of Object.values(this.unsubscribeFromComments)) {
      unsubscribe();
    }
  },
  methods: {
    async handleAddPublicacion() {
      if (!this.newPublicacion.title || !this.newPublicacion.content) {
        alert('Todos los campos son obligatorios');
        return;
      }
      if (!this.user) {
        alert('Debe iniciar sesión para publicar');
        return;
      }
      this.loading = true;
      await createPublicacion(this.newPublicacion, this.user.email);
      this.publicaciones = await getAllPublicaciones();

      // Agregar nuevos listeners para publicaciones recién creadas
      for (let publicacion of this.publicaciones) {
        if (!this.unsubscribeFromComments[publicacion.id]) {
          this.unsubscribeFromComments[publicacion.id] = subscribeToComments(publicacion.id, (updatedComments) => {
            this.comments[publicacion.id] = updatedComments;
          });
        }
      }
      this.newPublicacion.title = '';
      this.newPublicacion.content = '';
      this.loading = false;
    },
    async handleAddComment(publicacionId) {
      if (!this.newComment[publicacionId]) {
        alert('El comentario no puede estar vacío');
        return;
      }
      if (!this.user) {
        alert('Debe iniciar sesión para comentar');
        return;
      }
      await createComment(publicacionId, { content: this.newComment[publicacionId] }, this.user.email);
      this.newComment[publicacionId] = '';
    },
    formatDate(timestamp) {
      if (!timestamp) return 'Fecha no disponible';
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
  },
};
</script>

<template>
  <div class="container mx-auto p-4">
    <MainH1>Publicaciones</MainH1>

    <div class="mb-4">
      <form @submit.prevent="handleAddPublicacion" class="mb-4">
        <div class="mb-3">
          <label for="title" class="block mb-2 font-bold">Título</label>
          <input
            type="text"
            id="title"
            v-model="newPublicacion.title"
            class="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div class="mb-3">
          <label for="content" class="block mb-2 font-bold">Contenido</label>
          <textarea
            id="content"
            v-model="newPublicacion.content"
            class="w-full p-4 border border-gray-300 rounded resize-none"
            required
          ></textarea>
        </div>
        <MainButton :disabled="loading">{{ loading ? 'Cargando...' : 'Agregar Publicación' }}</MainButton>
      </form>
    </div>

    <div>
      <h2 class="text-2xl font-bold mb-4">Listado de Publicaciones</h2>
      <ul>
        <li
          v-for="publicacion in publicaciones"
          :key="publicacion.id"
          class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-customOrange transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <h3 class="text-xl font-bold">{{ publicacion.title }}</h3>
          <p>{{ publicacion.content }}</p>
          <p class="text-sm text-gray-600">
            Publicado por: {{ publicacion.userEmail }} a las {{ formatDate(publicacion.timestamp) }}
          </p>

          <div class="mt-4">
            <h4 class="font-bold mb-2">Comentarios</h4>
            <ul>
              <li v-for="comment in comments[publicacion.id]" :key="comment.id" class="mb-2">
                <p>{{ comment.content }}</p>
                <p class="text-sm text-gray-600">
                  Comentado por: {{ comment.userEmail }} a las {{ formatDate(comment.timestamp) }}
                </p>
        </li>
      </ul>
      <form @submit.prevent="handleAddComment(publicacion.id)" class="mt-2">
              <textarea
                v-model="newComment[publicacion.id]"
                class="w-full p-2 border border-gray-300 rounded resize-none"
                placeholder="Escribe un comentario..."
              ></textarea>
              <MainButton class="mt-2">Agregar Comentario</MainButton>
            </form>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}
</style>