<script>
import MainH1 from '../components/MainH1.vue';
import MainButton from '../components/MainButton.vue';
import { register } from '../services/auth.js';
import Loader from '../components/Loader.vue';

export default {
    name: 'Register',
    components: {MainH1, MainButton, Loader},
    data() {
        return {
            user: {
                email: '',
                password: '',
            },
            loading: false,
        };
    },
    methods: {
        async handleSubmit() {
            this.loading = true;
            try {
                await register(this.user.email, this.user.password);
                this.$router.push({
                    path: '/miperfil',
                })
            } catch (error) {

            }
            this.loading = false;
        }
    }
}
</script>

<template>
  <div class="min-h-screen flex">
      <!-- Sección de Imagen -->
    <div class="hidden md:block w-1/2 bg-cover bg-center bg-no-repeat" style="background-image: url('/public/NBA-logo.png'); background-size: 70%;"></div>

  <!-- Sección de Formulario -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8">
        <section class="max-w-md w-full bg-white p-6 rounded shadow-md">
          <MainH1>Crear una cuenta</MainH1>

          <!-- Contenido de la columna derecha (Formulario) -->
          <form action="#" @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="email" class="block mb-2 font-bold">Email</label>
              <input
                type="email"
                id="email"
                class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                :disabled="loading"
                v-model="user.email"
              >
            </div>
            <div class="mb-3">
              <label for="password" class="block mb-2 font-bold">Contraseña</label>
              <input
                type="password"
                id="password"
                class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                :disabled="loading"
                v-model="user.password"
              >
            </div>
            <MainButton>Crear Cuenta</MainButton>
            <Loader v-if="loading" />
          </form>
        </section>
      </div>
    </div>
  </template>
  