<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { updateUserPhoto } from '../services/auth';
import Loader from '../components/Loader.vue';
import { useToast } from 'vue-toastification'; // Importar el sistema de notificaciones

export default {
    name: 'MyProfileEditPhoto',
    components: { MainH1, MainLabel, MainButton, Loader },
    data() {
        return {
            photo: null,
            photoPreview: null,
            uploadingPhoto: false,
        };
    },
    methods: {
        handleFileSelection(event) {
            this.photo = event.target.files[0];

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                this.photoPreview = reader.result;
            });
            reader.readAsDataURL(this.photo);
        },
        async handleFileUpload() {
            const toast = useToast(); // Instancia del sistema de notificaciones

            if (!this.photo) {
                toast.error('Por favor, selecciona una foto antes de subirla.');
                return;
            }

            this.uploadingPhoto = true; // Activar estado de carga
            try {
                await updateUserPhoto(this.photo);
                toast.success('Foto actualizada exitosamente.');
                this.$router.push('/miperfil'); // Redirigir al perfil
            } catch (error) {
                console.error('[MyProfileEditPhoto handleFileUpload] Error al subir la foto:', error);
                toast.error('Hubo un error al subir la foto. Inténtalo de nuevo.');
            } finally {
                this.uploadingPhoto = false; // Desactivar estado de carga
            }
        },
    },
};
</script>

<template>
    <MainH1>Editar mi Foto de Perfil</MainH1>

    <form 
        action="#"
        class="flex gap-4"
        @submit.prevent="handleFileUpload"
    >
        <div class="w-1/2">
            <div class="mb-3">
                <MainLabel for="photo">Foto</MainLabel>
                <input
                    type="file"
                    id="photo"
                    class="w-full p-2 border border-gray-300 rounded read-only:bg-gray-100"
                    :read-only="uploadingPhoto"
                    @change="handleFileSelection"
                >
            </div>
            <MainButton :disabled="uploadingPhoto">
                {{ uploadingPhoto ? 'Subiendo...' : 'Actualizar' }}
            </MainButton>
        </div>
        <div class="w-1/2">
            <h2 class="mb-3">Previsualización de la Foto Seleccionada</h2>
            <img 
                v-if="photoPreview != null"
                :src="photoPreview"
                alt="Previsualización"
                class="w-full max-h-64 object-contain border border-gray-300 rounded"
            >
        </div>
    </form>

    <div v-if="uploadingPhoto" class="mt-4">
        <Loader /> <!-- Componente para mostrar el indicador de carga -->
        <p class="text-gray-500">Subiendo foto, por favor espera...</p>
    </div>
</template>

<style scoped>
img {
    max-width: 100%;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 8px;
}
</style>