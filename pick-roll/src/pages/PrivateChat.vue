<script>
import Loader from '../components/Loader.vue';
import MainButton from '../components/MainButton.vue';
import MainH1 from '../components/MainH1.vue';
import { getUserProfileById} from '../services/user-profile';
import { subscribeToAuth } from '../services/auth';
import { sendPrivateChatMessage, subscribeToPrivateChat} from '../services/private-chat';

export default {
    name: 'PrivateChat',
    components: {MainH1, Loader, MainButton},
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            userLoaded: false,
    
    //para grabar mensajes
            authUser: {
                id: null,
                email: null,
            },
            unsubscribeFromAuth: () => {},

    //datos del mensaje
            newMessage: {
                content: '',
            },
            sendingMessage: false, //aplicar para otro formulario despues
    
            //lista de mensajes        
            messages: [],
            messagesLoaded: false,
            unsubscribeFromChat: () => {},


        }        
    },
    methods: {
        sendMessage() {
            //this.sendingMessage = true;

            sendPrivateChatMessage(this.authUser.id, this.user.id, this.newMessage.content);
            
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
    async mounted() {
        this.unsubscribeFromAuth = subscribeToAuth(newUserData => this.authUser = newUserData);
        this.messagesLoaded = false;
        this.unsubscribeFromChat = subscribeToPrivateChat(
            this.authUser.id, 
            this.$route.params.id, 
            newMessages => {
                this.messagesLoaded = true;
                this.messages = newMessages;    
            }
        );

        this.userLoaded = false;
        //datos del perfil del usuario
        this.user = await getUserProfileById(this.$route.params.id);
        this.userLoaded = true;
    },
    unmounted() {
        //cancelo todas las suscripciones
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

                <div
                    class="border rounded p-4 min-h-[300px]"
                >
                <ul 
                    v-if="messagesLoaded"                   
                >
                    <li 
                        v-for="message in messages"
                        class="mb-4"
                    >
                        <p>
                            <b> 
                                {{ message.email }} 
                                dijo:
                            </b>
                        </p>
                        <p>{{ message.content }}</p>
                        <p>{{ formatDate(message.created_at) }}</p>
                    </li>
                </ul>
                <Loader
                    v-else
                />
                </div>
            </section>
            <section>
                <h2 class="sr-only">Enviar un Mensaje</h2>
                <form 
                    action="#"
                    class="flex gap-4"
                    @submit.prevent="sendMessage"
                >
                    <textarea 
                        id="message"
                        class="w-full p-2 border border-blue-950 rounded disabled:bg-amber-200"
                        aria-label="Mensaje"
                        v-model="newMessage.content"   
                    ></textarea>
                    <MainButton>Enviar</MainButton>
                </form>  
            </section>
    </template>
</template>