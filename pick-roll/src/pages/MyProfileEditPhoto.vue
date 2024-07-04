<script>
import MainH1 from '../components/MainH1.vue';
import MainLabel from '../components/MainLabel.vue';
import MainButton from '../components/MainButton.vue';
import { updateUserPhoto } from '../services/auth';
import Loader from '../components/Loader.vue';

export default {
    name: 'MyProfileEditPhoto',
    components: {MainH1, MainLabel, MainButton, Loader},
    data() {
        return {
            photo: null,
            photoPreview: null,
            uploadingPhoto: false,
        }
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
            this.uploadingPhoto = true;
            try {
                await updateUserPhoto(this.photo);
            } catch (error) {
            
            }
            this.uploadingPhoto = false;
        }
    }
}
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
            <MainButton :loading="uploadingPhoto">Actualizar</MainButton>
        </div>
        <div class="w-1/2">
            <h2 class="mb-3">Previsualización de la Foto Seleccionada</h2>
            <img 
                v-if="photoPreview != null"
                :src="photoPreview"
                alt=""
            >
        </div>
    </form>
</template>