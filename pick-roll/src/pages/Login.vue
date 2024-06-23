<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { login } from '../services/auth';

export default {
    name: 'Login',
    components: {MainH1, MainLabel, MainButton},
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
                await login(this.user.email, this.user.password);
                this.$router.push({
                    path: '/miperfil',
                });
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
        <MainH1>Iniciar Sesion</MainH1>
        
        <form 
            action="#"
            @submit.prevent="handleSubmit"
        >
            <div class="mb-3">
                <MainLabel for="email">Email</MainLabel>
                <input 
                    type="email" 
                    id="email"
                    class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                    :disabled="loading"
                    v-model="user.email"   
                    required
                    autofocus  
                >
            </div>
            <div class="mb-3">
                <MainLabel for="password">Contraseña</MainLabel>
                <input 
                    type="password" 
                    id="password"
                    class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                    :disabled="loading"
                    v-model="user.password"    
                    required 
                >
            </div>
            <MainButton>Ingresar</MainButton>
        </form>
    </section>
    </div>
</div>
</template> 