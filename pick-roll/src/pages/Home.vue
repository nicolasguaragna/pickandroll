<script>
import MainH1 from '../components/MainH1.vue';

export default {
  name: 'Home',
  components: { MainH1 },
  data() {
    return {
      publicaciones: [], // Inicializo la lista de publicaciones
    };
  },
  methods: {
    // Función para formatear fechas
    formatDate(timestamp) {
      if (!timestamp) return 'Fecha no disponible';
      const date = new Date(timestamp.seconds * 1000); // Conversión para Firestore
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  mounted() {
    // Simulación de carga de publicaciones (remplazar con lógica real si se necesita)
    this.publicaciones = [
      { id: 1, title: "Primer Publicación", content: "Contenido de la primera publicación", timestamp: { seconds: Date.now() / 1000 } },
      { id: 2, title: "Segunda Publicación", content: "Contenido de la segunda publicación", timestamp: { seconds: Date.now() / 1000 } },
      { id: 3, title: "Tercera Publicación", content: "Contenido de la tercera publicación", timestamp: { seconds: Date.now() / 1000 } },
    ];
  },
};
</script>

<template>
  <div class="flex">
    <div class="w-8/12 p-4">
      <MainH1>Bienvenidos a Pick and Roll</MainH1>
      <p>
        Comunidad de la NBA desde Argentina y para Latinoamérica. Equipos, Noticias, Publicaciones y algo más.
        <br> Hablemos de básquet 🏀
      </p>

      <!-- Últimas Publicaciones -->
      <div class="p-4 mt-4">
        <h2 class="text-lg font-bold mb-2">Últimas Publicaciones de Usuarios</h2>
        <ul>
          <li v-for="publicacion in publicaciones" :key="publicacion.id"
            class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
            <div class="text-xl font-semibold mb-2">{{ publicacion.title }}</div>
            <div class="mb-2">{{ publicacion.content }}</div>
            <div class="text-sm text-gray-500">{{ formatDate(publicacion.timestamp) }}</div>
          </li>
        </ul>
        <router-link to="/publicaciones" class="text-customOrange underline">Ver más</router-link>
      </div>

      <!-- Próximos Eventos -->
      <div class="p-4 mt-4">
        <h2 class="text-lg font-bold mb-2">Próximos Eventos</h2>
        <ul>
          <li class="mb-2">
            <h3 class="font-semibold">Evento 1</h3>
            <p class="text-sm">Descripción del evento 1...</p>
          </li>
          <li class="mb-2">
            <h3 class="font-semibold">Evento 2</h3>
            <p class="text-sm">Descripción del evento 2...</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Últimas Noticias -->
    <div class="w-4/12 p-4">
      <div
        class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-customOrange transition duration-300 ease-in-out transform hover:-translate-y-1">
        <h2 class="text-lg font-bold mb-2">Últimas Noticias de la NBA</h2>
        <ul>
          <li class="mb-2">
            <h3 class="font-semibold">Título de la Noticia 1</h3>
            <p class="text-sm">Contenido de la noticia 1...</p>
          </li>
          <li class="mb-2">
            <h3 class="font-semibold">Título de la Noticia 2</h3>
            <p class="text-sm">Contenido de la noticia 2...</p>
          </li>
          <li class="mb-2">
            <h3 class="font-semibold">Título de la Noticia 3</h3>
            <p class="text-sm">Contenido de la noticia 3...</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
