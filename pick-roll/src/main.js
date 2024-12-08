import "./main.css"; // Importo los estilos globales
import App from "./App.vue"; // Importo el componente principal de la app
import { createApp } from "vue"; // Importo la función para crear la aplicación
import router from "./router/router"; // Importo el enrutador
import Toast from "vue-toastification"; // Importo el plugin de Toastification
import "vue-toastification/dist/index.css"; // Importo los estilos de Toastification

// Configuración de opciones para Toastification
const toastOptions = {
  position: "top-right", // Posición de las notificaciones
  timeout: 3000, // Tiempo de duración
  closeOnClick: true, // Cerrar al hacer clic
  pauseOnHover: true, // Pausar al pasar el cursor
  draggable: true, // Permitir arrastrar la notificación
  draggablePercent: 0.6, // Porcentaje de arrastre
  showCloseButtonOnHover: false, // Mostrar botón de cerrar al pasar el cursor
  hideProgressBar: false, // Mostrar barra de progreso
  closeButton: "button", // Botón de cerrar
  icon: true, // Mostrar icono
  rtl: false, // Dirección de texto
};

const app = createApp(App);

// Uso el router y el plugin de Toastification
app.use(router);
app.use(Toast, toastOptions);

app.mount("#app"); // Monto la aplicación en el contenedor de la página
