<script>
import Loader from './Loader.vue';
import TextWithDefault from './TextWithDefault.vue';

export default {
    name: 'UserProfileData',
    components: { Loader, TextWithDefault },
    props: {
        user: {
            type: Object,
            required: true,
        }
    }
}
</script>

<template>
    <!-- <p class="mb-4">{{ user.bio || 'Una breve biografía del usuario...' }}</p -->
        <!-- v-if="user.fullyLoaded" -->
    <p 
        class="mb-4"
    >
        <TextWithDefault :value="user.bio" default-value="Una breve biografía del usuario..." />
    </p>
    <!-- <Loader v-else /> -->

    <dl>
        <dt class="font-bold">Email</dt>
        <dd class="mb-3">{{ user.email }}</dd>
        <dt class="font-bold">Nombre de Usuario</dt>
        <dd class="mb-3">
            <!-- <template v-if="user.displayName">{{ user.displayName }}</template>
            <i v-else>Sin especificar</i> -->
            <TextWithDefault :value="user.displayName" />
        </dd>
        <dt class="font-bold">Favoritos de la NBA</dt>
        <dd class="mb-3">
            <TextWithDefault :value="user.nbaFavorites" />
        </dd>
        <dt class="font-bold">Ubicación</dt>
        <dd class="mb-3">
            <TextWithDefault :value="user.location" />
        </dd>
    </dl>
</template>