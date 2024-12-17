<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import { subscribeToAuth } from '../services/auth';
import { saveMessage, subscribeToChatMessages } from '../services/chat';

export default {
  name: 'Chat',
  components: { MainH1, Loader },
  data() {
    return {
      newMessage: {
        content: '',
      },
      sendingMessage: false,

      messages: [],
      messagesLoaded: false,
      unsubscribeFromChat: () => { },

      authUser: {
        id: null,
        email: null,
      },
      unsubscribeFromAuth: () => { },
    };
  },
  methods: {
    sendMessage() {
      if (!this.authUser.id || !this.authUser.email) {
        console.error("Error: Usuario no autenticado. No se puede enviar el mensaje.");
        return;
      }

      if (!this.newMessage.content.trim()) {
        console.warn("Advertencia: El mensaje está vacío.");
        return;
      }

      this.sendingMessage = true;

      saveMessage({
        user_id: this.authUser.id,       // UID del usuario autenticado
        email: this.authUser.email,      // Email del usuario autenticado
        content: this.newMessage.content.trim(), // Contenido del mensaje
      })
        .then(() => {
          this.newMessage.content = ""; // Limpia el campo del mensaje
        })
        .catch((error) => {
          console.error("Error al guardar el mensaje:", error);
        })
        .finally(() => {
          this.sendingMessage = false;
        });
    },
    formatDate(date) {
      return Intl.DateTimeFormat('es', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
        .format(date)
        .replace(',', '');
    },
  },
  mounted() {
    // Me suscribo a los cambios de autenticación
    this.unsubscribeFromAuth = subscribeToAuth((newUserData) => {
      console.log("Datos de autenticación recibidos:", newUserData);

      if (newUserData) {
        // Asegúrate de asignar las propiedades correctas
        this.authUser = {
          id: newUserData.uid || newUserData.id, // uid de Firebase
          email: newUserData.email,
        };
      } else {
        console.error("No hay usuario autenticado.");
        this.authUser = { id: null, email: null };
      }
    });

    // Me suscribo a los mensajes
    this.unsubscribeFromChat = subscribeToChatMessages((newMessages) => {
      this.messages = newMessages;
      this.messagesLoaded = true;
      this.messages.reverse();
    });
  },
  unmounted() {
    // Cancelar las suscripciones
    if (this.unsubscribeFromChat) this.unsubscribeFromChat();
    if (this.unsubscribeFromAuth) this.unsubscribeFromAuth();
  },
};
</script>

<template>
  <section>
    <MainH1>Chat Global</MainH1>
    <div class="flex gap-4 justify-between">
      <!-- Lista de mensajes -->
      <section class="w-6/12">
        <h2 class="sr-only">Lista de mensajes</h2>
        <div class="border rounded p-4 min-h-[300px] max-h-[600px] overflow-y-auto shadow-md bg-white">
          <ul v-if="messagesLoaded">
            <li v-for="message in messages" :key="message.id" class="mb-4">
              <p>
                <b>
                  <router-link :to="`/usuario/${message.user_id}`" class="text-customOrange underline">
                    {{ message.email }}
                  </router-link>
                  dijo:
                </b>
              </p>
              <p>{{ message.content }}</p>
              <p v-if="message.created_at">{{ formatDate(message.created_at) }}</p>
              <p v-else>Enviando...</p>
            </li>
          </ul>
          <Loader v-else />
        </div>
      </section>

      <!-- Formulario para enviar mensajes -->
      <section class="w-4/12 mx-auto">
        <h2 class="text-xl mb-4">Enviar mensaje</h2>
        <form @submit.prevent="sendMessage">
          <div class="mb-3">
            <span class="block mb-2 font-bold">Email</span>
            <span>{{ authUser.email || 'No autenticado' }}</span>
          </div>
          <div class="mb-3">
            <label for="message" class="block mb-2 font-bold">Mensaje</label>
            <textarea id="message"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
              v-model="newMessage.content" rows="4"></textarea>
          </div>
          <button type="submit"
            class="transition-all w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold">
            <template v-if="!sendingMessage">Enviar</template>
            <Loader v-else />
          </button>
        </form>
      </section>
    </div>
  </section>
</template>
