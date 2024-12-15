<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import {
  createPublicacion,
  subscribeToPublicaciones,
  subscribeToComments,
  addComment,
  deletePublicacion,
  updatePublicacion,
  deleteComment,
  updateComment
} from '../services/publicaciones.js';
import { subscribeToAuth, isAdmin } from '../services/auth.js';

export default {
  name: 'Publicaciones',
  components: { MainH1, MainButton },
  data() {
    return {
      publicaciones: [], // Lista de publicaciones
      newPublicacion: { title: '', content: '' },
      selectedImage: null,
      user: null,
      isUserAdmin: false,
      loading: false,
      comments: {}, // Comentarios por publicación
      unsubscribeFromComments: {}, // Listeners de comentarios
      unsubscribeFromPublicaciones: null,
      newComment: {}, // Nuevo comentario
      expandedImageUrl: null,
      editingPublicacion: null, // ID de publicación en edición
      editForm: { title: '', content: '' }, // Formulario de edición de publicación
      editingComment: null, // ID del comentario en edición
      editCommentForm: { content: '' }, // Formulario de edición de comentario
    };
  },
  created() {
    // Listener de publicaciones
    this.unsubscribeFromPublicaciones = subscribeToPublicaciones((updatedPublicaciones) => {
      this.publicaciones = updatedPublicaciones;

      for (let publicacion of this.publicaciones) {
        if (!this.unsubscribeFromComments[publicacion.id]) {
          this.unsubscribeFromComments[publicacion.id] = subscribeToComments(publicacion.id, (updatedComments) => {
            this.comments = { ...this.comments, [publicacion.id]: updatedComments };
          });
        }
      }
    });

    // Verificación del rol del usuario
    this.unsubscribeFromAuth = subscribeToAuth(async (user) => {
      this.user = user;
      this.isUserAdmin = await isAdmin();
    });
  },
  beforeUnmount() {
    // Desuscribir listeners
    if (this.unsubscribeFromPublicaciones) this.unsubscribeFromPublicaciones();
    for (let unsubscribe of Object.values(this.unsubscribeFromComments)) unsubscribe();
    if (this.unsubscribeFromAuth) this.unsubscribeFromAuth();
  },
  methods: {
    handleImageSelection(event) {
      this.selectedImage = event.target.files[0];
    },
    async handleAddPublicacion() {
      if (!this.newPublicacion.title || !this.newPublicacion.content) {
        alert('Todos los campos son obligatorios');
        return;
      }
      if (!this.user || !this.user.email) {
        alert('Debe iniciar sesión para publicar');
        return;
      }

      this.loading = true;
      try {
        await createPublicacion(this.newPublicacion, this.user.email, this.selectedImage);
        this.newPublicacion = { title: '', content: '' };
        this.selectedImage = null;
      } catch (error) {
        console.error('Error al crear publicación:', error);
      } finally {
        this.loading = false;
      }
    },
    async handleAddComment(publicacionId) {
      if (!this.newComment[publicacionId] || !this.user?.email) {
        alert("El comentario no puede estar vacío y debe iniciar sesión.");
        return;
      }
      try {
        await addComment(publicacionId, { content: this.newComment[publicacionId] }, this.user.email);
        this.newComment[publicacionId] = ""; // Limpia el campo después de agregar el comentario
      } catch (error) {
        console.error("Error al agregar comentario:", error);
      }
    },
    async handleDeletePublicacion(postId) {
      if (confirm('¿Eliminar esta publicación?')) await deletePublicacion(postId);
    },
    startEditingPublicacion(publicacion) {
      this.editingPublicacion = publicacion.id;
      this.editForm = { title: publicacion.title, content: publicacion.content };
    },
    async handleEditPublicacion(postId) {
      await updatePublicacion(postId, this.editForm);
      this.editingPublicacion = null;
    },
    async handleDeleteComment(publicacionId, commentId) {
      if (confirm('¿Eliminar este comentario?')) await deleteComment(publicacionId, commentId);
    },
    startEditingComment(comment) {
      this.editingComment = comment.id;
      this.editCommentForm.content = comment.content;
    },
    async handleEditComment(publicacionId, commentId) {
      if (!this.editCommentForm.content.trim()) {
        alert('El comentario no puede estar vacío.');
        return;
      }

      await updateComment(publicacionId, commentId, { content: this.editCommentForm.content });
      this.editingComment = null; // Finalizar edición
      this.editCommentForm.content = ''; // Limpiar el formulario
    },
    expandImage(imageUrl) {
      this.expandedImageUrl = imageUrl;
    },
    closeModal() {
      this.expandedImageUrl = null;
    },
  },
};
</script>

<template>
  <div class="w-3/4 mx-auto p-4">
    <MainH1>Publicaciones</MainH1>

    <!-- Formulario para agregar publicaciones -->
    <form @submit.prevent="handleAddPublicacion" class="mb-4 bg-gray-100 p-4 rounded shadow">
      <div>
        <label class="block text-gray-700 font-semibold">Título</label>
        <input v-model="newPublicacion.title" required class="input" />
      </div>
      <div>
        <label class="block text-gray-700 font-semibold">Contenido</label>
        <textarea v-model="newPublicacion.content" required class="input"></textarea>
      </div>
      <div>
        <label class="block text-gray-700 font-semibold">Imagen</label>
        <input type="file" @change="handleImageSelection" class="mt-2" />
      </div>
      <MainButton class="mt-2">Agregar Publicación</MainButton>
    </form>

    <!-- Listado de Publicaciones -->
    <ul>
      <li v-for="publicacion in publicaciones" :key="publicacion.id" class="card bg-white rounded shadow p-4 mb-6">
        <!-- Título y Contenido -->
        <h3 class="text-xl font-bold mb-2">{{ publicacion.title }}</h3>
        <p class="text-gray-700 mb-2">{{ publicacion.content }}</p>
        <p class="text-sm text-gray-500 mb-4">
          Publicado por {{ publicacion.userEmail }}
        </p>

        <div class="w-full h-60 mx-auto overflow-hidden rounded-lg border border-gray-300">
          <img v-if="publicacion.imageUrl" :src="publicacion.imageUrl" @click="expandImage(publicacion.imageUrl)"
            class="w-full h-full object-cover cursor-pointer" alt="Publicación" />
        </div>

        <!-- Botones para Admin -->
        <div v-if="isUserAdmin" class="flex space-x-2 mb-4">
          <MainButton class="text-sm py-1 px-3" @click="startEditingPublicacion(publicacion)">
            Editar publicación
          </MainButton>
          <MainButton class="text-sm py-1 px-3 bg-red-500 hover:bg-red-600 text-white"
            @click="handleDeletePublicacion(publicacion.id)">
            Eliminar publicación
          </MainButton>
        </div>

        <!-- Editar publicación -->
        <div v-if="editingPublicacion === publicacion.id" class="space-y-2">
          <input v-model="editForm.title" placeholder="Editar título" class="input" />
          <textarea v-model="editForm.content" placeholder="Editar contenido" class="input"></textarea>
          <div class="flex space-x-2">
            <MainButton class="text-sm py-1 px-3" @click="handleEditPublicacion(publicacion.id)">
              Guardar
            </MainButton>
            <MainButton class="text-sm py-1 px-3 bg-gray-300 hover:bg-gray-400" @click="editingPublicacion = null">
              Cancelar
            </MainButton>
          </div>
        </div>

        <!-- Mostrar Comentarios -->
        <div>
          <h4 class="font-semibold mt-4 mb-2">Comentarios</h4>
          <ul class="space-y-4">
            <li v-for="comment in comments[publicacion.id]" :key="comment.id" class="border-b py-2 text-gray-700">
              <div v-if="editingComment === comment.id">
                <textarea v-model="editCommentForm.content" placeholder="Editar comentario" class="input"></textarea>
                <div class="flex space-x-2 mt-2">
                  <MainButton class="text-sm py-1 px-3" @click="handleEditComment(publicacion.id, comment.id)">
                    Guardar
                  </MainButton>
                  <MainButton class="text-sm py-1 px-3 bg-gray-300 hover:bg-gray-400" @click="editingComment = null">
                    Cancelar
                  </MainButton>
                </div>
              </div>
              <div v-else>
                <p>{{ comment.content }} - {{ comment.userEmail }}</p>
                <div v-if="isUserAdmin" class="flex space-x-2 mt-2">
                  <MainButton class="text-sm py-1 px-3" @click="startEditingComment(comment)">
                    Editar comentario
                  </MainButton>
                  <MainButton class="text-sm py-1 px-3 bg-red-500 hover:bg-red-600 text-white"
                    @click="handleDeleteComment(publicacion.id, comment.id)">
                    Eliminar comentario
                  </MainButton>
                </div>
              </div>
            </li>
          </ul>
          <!-- Formulario para agregar comentario -->
          <form @submit.prevent="handleAddComment(publicacion.id)" class="mt-2">
            <textarea v-model="newComment[publicacion.id]" placeholder="Escribe un comentario..."
              class="w-full border p-2 rounded"></textarea>
            <MainButton class="text-sm py-1 px-4 mt-2">Agregar comentario</MainButton>
          </form>
        </div>
      </li>
    </ul>

    <!-- Modal para expandir la imagen -->
    <div v-if="expandedImageUrl" @click="closeModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <img :src="expandedImageUrl" class="max-w-3xl max-h-screen rounded shadow-lg" />
    </div>
  </div>
</template>

<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  margin-top: 4px;
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

img {
  transition: transform 0.2s ease;
}

img:hover {
  transform: scale(1.02);
}
</style>
