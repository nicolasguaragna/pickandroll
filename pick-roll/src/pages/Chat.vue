<script>
import Loader from '../components/Loader.vue';
import MainH1 from '../components/MainH1.vue';
import { subscribeToAuth } from '../services/auth';
import { saveMessage, subscribeToChatMessages } from '../services/chat';
import { auth } from '../services/firebase';

export default {
    name: 'Chat',
    components: {MainH1, Loader},
    data() {
        return {
            newMessage: {
                content: '',
            },
            sendingMessage: false, //aplicar para otro formulario despues
            
            messages: [],
            messagesLoaded: false,
            unsubscribeFromChat: () => {},

            authUser: {
                id: null,
                email: null,
            },
            unsubscribeFromAuth: () => {},
        }
    },
    methods: {
        sendMessage() {
            this.sendingMessage = true;

            saveMessage({
                user_id: this.authUser.id,
                email: this.authUser.email,
                content: this.newMessage.content,
            }).then(() => this.sendingMessage = false); 
            this.newMessage.content = "";
        },
        formatDate(date) {
            //console.log("El valor que recibimos es: ", date);
            //transformo el objeto date a un formato AAAA-MM-DD
            
            const hora = Intl.DateTimeFormat('es', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }).format(date).replace(',', '');
            
            return hora;
        }
    },
    mounted() {
        //me suscribo para que me notifiquen los cambios en los mensajes 
        this.unsubscribeFromChat = subscribeToChatMessages(newMessages => {
            this.messages = newMessages;
            this.messagesLoaded = true;
            this.messages.reverse();
        });
        //guardo la funcion para cancelar la suscripcion.
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => this.authUser = newUserData);
        //console.log("recibimos la funcion para cancelar la suscripcion.", this.unsubscribeFromAuth);
    },
    unmounted() {
        //cancelo todas las suscripciones
        this.unsubscribeFromChat();
        this.unsubscribeFromAuth();
    }
}

</script>

<template>  
    <section>
      <MainH1>Chat Global</MainH1>
      <div class="flex gap-4 justify-between">
        <section class="w-6/12">
          <h2 class="sr-only">Lista de mensajes</h2>
          <div class="border rounded p-4 min-h-[300px] max-h-[600px] overflow-y-auto shadow-md bg-white">
            <ul v-if="messagesLoaded">
              <li v-for="message in messages" :key="message.id" class="mb-4">
                <p>
                  <b>
                    <router-link 
                      :to="`/usuario/${message.user_id}`"
                      class="text-customOrange underline"
                    >{{ message.email }}</router-link>
                    dijo:
                  </b>
                </p>
                <p>{{ message.content }}</p>
                <p v-if="message.created_at != null">{{ formatDate(message.created_at) }}</p>
                <p v-else>Enviando...</p>
              </li>
            </ul>
            <Loader v-else />
          </div>
        </section>
        <section class="w-4/12 mx-auto">
          <h2 class="text-xl mb-4">Enviar mensaje</h2>
          <form @submit.prevent="sendMessage">
            <div class="mb-3">
              <span class="block mb-2 font-bold">Email</span>
              <span>{{ authUser.email }}</span>
            </div>
            <div class="mb-3">
              <label for="message" class="block mb-2 font-bold">Mensaje</label>
              <textarea 
                id="message"
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
                :disabled="sendingMessage"
                v-model="newMessage.content"
                rows="4"
              ></textarea>
            </div>
            <button 
              type="submit"
              class="transition-all w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold"
              :disabled="sendingMessage"
            >
              <template v-if="!sendingMessage">Enviar</template>
              <Loader v-else />
            </button>
          </form>
        </section>
      </div>
    </section>
  </template>
  