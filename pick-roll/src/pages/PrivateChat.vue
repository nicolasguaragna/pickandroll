<script>
import Loader from '../components/Loader.vue';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { getUserProfileById } from '../services/user-profile';
import { subscribeToAuth } from '../services/auth';
import { sendPrivateChatMessage, subscribeToPrivateChat } from '../services/private-chat';

export default {
    name: 'PrivateChat',
    components: { MainH1, Loader, MainButton },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            userLoaded: false,

            // Para grabar mensajes
            authUser: null,
            unsubscribeFromAuth: () => { },

            // Datos del mensaje
            newMessage: {
                content: '',
            },
            sendingMessage: false,

            // Lista de mensajes        
            messages: [],
            messagesLoaded: false,
            unsubscribeFromChat: () => { },
        }
    },
    methods: {
        sendMessage() {
            if (!this.authUser?.uid || !this.user?.id) {
                console.error("IDs de usuario no disponibles.");
                return;
            }

            sendPrivateChatMessage(this.authUser.uid, this.user.id, this.newMessage.content)
                .catch(error => console.error("Error al enviar el mensaje:", error));
            this.newMessage.content = "";
        },
        formatDate(date) {
            const hora = Intl.DateTimeFormat('es', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }).format(date).replace(',', '');
            return hora;
        }
    },
    async mounted() {
        // Suscribo al usuario autenticado
        this.unsubscribeFromAuth = subscribeToAuth(async (newUserData) => {
            if (newUserData) {
                this.authUser = newUserData;

                // Verifica que los IDs sean válidos
                const receiverId = this.$route.params.id;
                if (!this.authUser.uid || !receiverId) {
                    console.error("IDs inválidos detectados. No se puede suscribir al chat.");
                    return;
                }

                // Cargar datos del usuario receptor
                try {
                    this.user = await getUserProfileById(receiverId);
                    this.userLoaded = true;
                } catch (error) {
                    console.error("Error al cargar el perfil del usuario receptor:", error);
                    return;
                }

                // Suscribirme al chat
                this.messagesLoaded = false;
                try {
                    this.unsubscribeFromChat = await subscribeToPrivateChat(
                        this.authUser.uid,
                        receiverId,
                        (newMessages) => {
                            this.messagesLoaded = true;
                            this.messages = newMessages;
                        }
                    );
                } catch (error) {
                    console.error("Error al suscribirse al chat:", error);
                }
            } else {
                console.error("Usuario no autenticado. Redirigiendo...");
                this.$router.push("/iniciar-sesion");
            }
        });
    },
    unmounted() {
        // Cancelo todas las suscripciones
        this.unsubscribeFromChat();
        this.unsubscribeFromAuth();
    }
}
</script>

<template>
    <Loader v-if="!userLoaded" />
    <template v-else>
        <MainH1>Chat con {{ user.email }}</MainH1>

        <section class="mb-4">
            <h2 class="sr-only">Lista de mensajes</h2>

            <div class="border rounded p-4 min-h-[300px]">
                <ul v-if="messagesLoaded" class="flex flex-col items-start">
                    <li v-for="message in messages" :key="message.id" class="mb-4 rounded" :class="{
                        'bg-orange-200': message.sender_id === authUser.uid,
                        'self-end': message.sender_id === authUser.uid,
                        'bg-gray-200': message.sender_id !== authUser.uid,
                    }">
                        <p>{{ message.content }}</p>
                        <p v-if="message.created_at != null">{{ formatDate(message.created_at) }}</p>
                        <p v-else>Enviando...</p>
                    </li>
                </ul>
                <Loader v-else />
            </div>
        </section>
        <section>
            <h2 class="sr-only">Enviar un Mensaje</h2>
            <form action="#" class="flex gap-4" @submit.prevent="sendMessage">
                <textarea id="message" class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                    aria-label="Mensaje" v-model="newMessage.content"></textarea>
                <MainButton>Enviar</MainButton>
            </form>
        </section>
    </template>
</template>
