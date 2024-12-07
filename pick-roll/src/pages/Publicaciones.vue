<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import { createPublicacion, subscribeToPublicaciones, subscribeToComments, createComment } from '../services/publicaciones.js';
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
      unsubscribeFromComments: {}, // Guardamos las funciones para cancelar los listeners de comentarios
      unsubscribeFromPublicaciones: null, // Función para cancelar el listener de publicaciones
      newComment: {}
    };
  },
  created() {
    console.log("Configurando listener en tiempo real para publicaciones...");
    this.unsubscribeFromPublicaciones = subscribeToPublicaciones((updatedPublicaciones) => {
      this.publicaciones = updatedPublicaciones;
      console.log("Publicaciones actualizadas en tiempo real:", this.publicaciones);

      // Configuramos listeners para comentarios de cada publicación
      for (let publicacion of this.publicaciones) {
        if (!this.unsubscribeFromComments[publicacion.id]) {
          this.unsubscribeFromComments[publicacion.id] = subscribeToComments(publicacion.id, (updatedComments) => {
            this.comments[publicacion.id] = updatedComments;
          });
        }
      }
    });

    // Configurar listener para el estado del usuario
    this.unsubscribeFromAuth = subscribeToAuth(user => {
      console.log("Usuario autenticado actualizado:", user);
      this.user = user;
    });
  },
  beforeUnmount() {
    // Cancelar el listener de publicaciones
    if (this.unsubscribeFromPublicaciones) {
      this.unsubscribeFromPublicaciones();
    }

    // Cancelar los listeners de comentarios
    for (let unsubscribe of Object.values(this.unsubscribeFromComments)) {
      unsubscribe();
    }

    // Cancelar el listener de autenticación
    if (this.unsubscribeFromAuth) {
      this.unsubscribeFromAuth();
    }
  },
  methods: {
    async handleAddPublicacion() {
      console.log("Intentando agregar publicación. Estado del usuario:", this.user);
      if (!this.newPublicacion.title || !this.newPublicacion.content) {
        alert('Todos los campos son obligatorios');
        return;
      }
      if (!this.user || !this.user.email) {
        alert('Debe iniciar sesión para publicar');
        return;
      }
      this.loading = true;
      await createPublicacion(this.newPublicacion, this.user.email);
      console.log("Publicación creada exitosamente.");
      this.newPublicacion.title = '';
      this.newPublicacion.content = '';
      this.loading = false;
    },
    async handleAddComment(publicacionId) {
      console.log(`Intentando agregar comentario para la publicación ${publicacionId}. Estado del usuario:`, this.user);
      if (!this.newComment[publicacionId]) {
        alert('El comentario no puede estar vacío');
        return;
      }
      if (!this.user || !this.user.email) {
        alert('Debe iniciar sesión para comentar');
        return;
      }
      await createComment(publicacionId, { content: this.newComment[publicacionId] }, this.user.email);
      console.log("Comentario agregado exitosamente.");
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
