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
  <div class="container mx-auto p-4">
    <MainH1>Publicaciones</MainH1>

    <!-- Formulario para agregar publicaciones -->
    <form @submit.prevent="handleAddPublicacion" class="mb-4">
      <div>
        <label>Título</label>
        <input v-model="newPublicacion.title" required class="input" />
      </div>
      <div>
        <label>Contenido</label>
        <textarea v-model="newPublicacion.content" required class="input"></textarea>
      </div>
      <div>
        <label>Imagen</label>
        <input type="file" @change="handleImageSelection" />
      </div>
      <MainButton>Agregar Publicación</MainButton>
    </form>

    <!-- Listado de Publicaciones -->
    <ul>
      <li v-for="publicacion in publicaciones" :key="publicacion.id" class="card">
        <h3>{{ publicacion.title }}</h3>
        <p>{{ publicacion.content }}</p>
        <p>Publicado por {{ publicacion.userEmail }}</p>
        <img v-if="publicacion.imageUrl" :src="publicacion.imageUrl" @click="expandImage(publicacion.imageUrl)" />

        <!-- Editar publicación -->
        <div v-if="editingPublicacion === publicacion.id">
          <input v-model="editForm.title" placeholder="Editar título" class="input" />
          <textarea v-model="editForm.content" placeholder="Editar contenido" class="input"></textarea>
          <MainButton @click="handleEditPublicacion(publicacion.id)">Guardar</MainButton>
          <MainButton @click="editingPublicacion = null">Cancelar</MainButton>
        </div>
        <div v-else v-if="isUserAdmin">
          <MainButton @click="startEditingPublicacion(publicacion)">Editar publicación</MainButton>
          <MainButton @click="handleDeletePublicacion(publicacion.id)">Eliminar publicación</MainButton>
        </div>

        <!-- Mostrar y editar comentarios -->
        <div>
          <h4>Comentarios</h4>
          <ul>
            <li v-for="comment in comments[publicacion.id]" :key="comment.id">
              <div v-if="editingComment === comment.id">
                <textarea v-model="editCommentForm.content" placeholder="Editar comentario" class="input"></textarea>
                <MainButton @click="handleEditComment(publicacion.id, comment.id)">Guardar</MainButton>
                <MainButton @click="editingComment = null">Cancelar</MainButton>
              </div>
              <div v-else>
                <p>{{ comment.content }} - {{ comment.userEmail }}</p>
                <div v-if="isUserAdmin">
                  <MainButton @click="startEditingComment(comment)">Editar comentario</MainButton>
                  <MainButton @click="handleDeleteComment(publicacion.id, comment.id)">Eliminar comentario</MainButton>
                </div>
              </div>
            </li>
          </ul>
          <form @submit.prevent="handleAddComment(publicacion.id)">
            <textarea v-model="newComment[publicacion.id]" placeholder="Escribe un comentario..."></textarea>
            <MainButton>Agregar comentario</MainButton>
          </form>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}

.input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid gray;
  border-radius: 4px;
}

.card {
  border: 1px solid gray;
  margin-bottom: 20px;
  padding: 20px;
}
</style>
