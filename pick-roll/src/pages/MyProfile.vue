<script>
import MainH1 from '../components/MainH1.vue';
import { getUserPublicaciones, getUserData, updateUserProfile, changeUserPassword } from '../services/auth.js';
import { format } from 'date-fns';

export default {
  name: 'MiProfile',
  components: { MainH1 },
  data() {
    return {
      publicaciones: [],
      profile: {
        name: '',
        email: ''
      },
      newPassword: ''
    };
  },
  created() {
    const user = getUserData();
    if (user.email) {
      this.profile.email = user.email;
      this.loadUserPublicaciones(user.email);
      // Cargar el nombre del perfil del usuario desde Firestore u otro lugar si es necesario
    } else {
      console.error("Usuario no autenticado");
    }
  },
  methods: {
    async loadUserPublicaciones(userEmail) {
      try {
        getUserPublicaciones(userEmail, (publicaciones) => {
          this.publicaciones = publicaciones;
        });
      } catch (error) {
        console.error("Error al obtener publicaciones del usuario:", error);
      }
    },
    async updateProfile() {
      try {
        const user = getUserData();
        await updateUserProfile(user.id, { displayName: this.profile.name });
        alert('Perfil actualizado con éxito');
      } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        alert('Error al actualizar el perfil');
      }
    },
    async changePassword() {
      try {
        await changeUserPassword(this.newPassword);
        alert('Contraseña cambiada con éxito');
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        alert('Error al cambiar la contraseña');
      }
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <MainH1>Mi Perfil</MainH1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      <div>
        <h2 class="text-2xl font-semibold mb-4">Mis Publicaciones</h2>
        <ul>
          <li v-for="publicacion in publicaciones" :key="publicacion.id" class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-customOrange transition duration-300 ease-in-out transform hover:-translate-y-1">
            <div class="text-xl font-semibold mb-2">{{ publicacion.title }}</div>
            <div class="mb-2">{{ publicacion.content }}</div>
            <div class="text-sm text-gray-500">{{ formatDate(publicacion.timestamp) }}</div>
          </li>
        </ul>
      </div>
      <div>
        <h2 class="text-2xl font-semibold mb-4">Administrar Perfil</h2>
        <form @submit.prevent="updateProfile" class="mb-8">
          <div class="mb-4">
            <label for="name" class="block mb-2 font-bold">Nombre:</label>
            <input type="text" v-model="profile.name" id="name" class="border rounded px-4 py-2 w-full" required>
          </div>
          <div class="mb-4">
            <label for="email" class="block mb-2 font-bold">Correo Electrónico:</label>
            <input type="email" v-model="profile.email" id="email" class="border rounded px-4 py-2 w-full" required disabled>
          </div>
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Actualizar Perfil</button>
        </form>

        <form @submit.prevent="changePassword">
          <div class="mb-4">
            <label for="password" class="block mb-2 font-bold">Nueva Contraseña:</label>
            <input type="password" v-model="newPassword" id="password" class="border rounded px-4 py-2 w-full" required>
          </div>
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Cambiar Contraseña</button>
        </form>
      </div>
    </div>
  </div>
</template>
