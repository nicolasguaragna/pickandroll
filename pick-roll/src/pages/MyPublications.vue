<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import { getUserPublications, updatePublicacion } from '../services/publicaciones.js';
import { subscribeToAuth } from '../services/auth.js';

export default {
  name: 'MyPublications',
  components: { MainH1, MainButton },
  data() {
    return {
      user: null,
      publicaciones: [],
      loading: true,
      editingPublicacion: null, // Almacena la publicación que estás editando
      editingTitle: '', // Título temporal para la edición
      editingContent: '', // Contenido temporal para la edición
    };
  },
  async created() {
    subscribeToAuth(async (currentUser) => {
      console.log("Usuario autenticado detectado:", currentUser);

      if (currentUser) {
        this.user = { ...currentUser }; // Asegura que el usuario se asigna
        console.log("UID del usuario autenticado:", this.user.id);

        this.publicaciones = await getUserPublications(this.user.email);
      } else {
        console.error("No se encontró un usuario autenticado.");
      }

      this.loading = false;
    });
  },
  methods: {
    handleEdit(publicacion) {
      // Prepara una publicación para ser editada
      this.editingPublicacion = publicacion;
      this.editingTitle = publicacion.title;
      this.editingContent = publicacion.content;
    },
    async handleSaveEdit() {
      // Valida que los campos no estén vacíos
      if (!this.editingTitle || !this.editingContent) {
        alert('El título y el contenido no pueden estar vacíos');
        return;
      }

      console.log("Datos que se envían a Firestore:", {
        title: this.editingTitle,
        content: this.editingContent,
        user_id: this.user?.id, // Aquí se usa "id" en lugar de "uid"
      });

      // Verifica que haya un usuario autenticado con un ID válido
      if (!this.user || !this.user.id) {
        console.error("Error: No se pudo identificar al usuario.");
        alert("No se pudo identificar al usuario. Intenta iniciar sesión nuevamente.");
        return;
      }

      try {
        // Actualiza la publicación en Firestore
        await updatePublicacion(this.editingPublicacion.id, {
          title: this.editingTitle,
          content: this.editingContent,
          user_id: this.user.id, // Aquí también
        });
        alert('Publicación actualizada con éxito');

        // Actualiza la lista local de publicaciones
        this.publicaciones = this.publicaciones.map((pub) =>
          pub.id === this.editingPublicacion.id
            ? { ...pub, title: this.editingTitle, content: this.editingContent }
            : pub
        );
        this.editingPublicacion = null;  // Limpia el estado de edición
      } catch (error) {
        console.error('Error al actualizar la publicación:', error);
        alert('Error al actualizar la publicación. Intenta de nuevo.');
      }
    },
    handleCancelEdit() {
      this.editingPublicacion = null;
    },
  },
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <MainH1>Mis Publicaciones</MainH1>
      <button @click="$router.push('/miperfil')"
        class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded text-xs">
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
      <li v-for="publicacion in publicaciones" :key="publicacion.id"
        class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
        <h3 class="text-xl font-bold">{{ publicacion.title }}</h3>
        <p>{{ publicacion.content }}</p>
        <p class="text-sm text-gray-600">
          Publicado el: {{ new Date(publicacion.timestamp.seconds * 1000).toLocaleString() }}
        </p>
        <div class="flex justify-end gap-2 mt-2">
          <button @click="handleEdit(publicacion)"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold text-l py-1 px-3 rounded">
            Editar
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal de edición -->
    <div v-if="editingPublicacion" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <h2 class="text-xl font-bold mb-4">Editar Publicación</h2>
        <label for="edit-title" class="block font-bold mb-2">Título</label>
        <input id="edit-title" v-model="editingTitle" class="w-full p-2 border border-gray-300 rounded mb-4" />
        <label for="edit-content" class="block font-bold mb-2">Contenido</label>
        <textarea id="edit-content" v-model="editingContent"
          class="w-full p-2 border border-gray-300 rounded mb-4"></textarea>
        <div class="flex justify-end gap-2">
          <button @click="handleSaveEdit"
            class="bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-1 px-2 rounded">
            Guardar
          </button>
          <button @click="handleCancelEdit"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs py-1 px-2 rounded">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}

button {
  font-size: 0.75rem;
}
</style>
