import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

/*
|--------------------------------------------------------------------------
| Bootstrap
|--------------------------------------------------------------------------
| Primero importamos los estilos generales de Bootstrap.
|
| Después importamos el archivo bundle de JavaScript, necesario para
| componentes interactivos como navbar colapsable, modales, dropdowns,
| tooltips y otros elementos que utilizaremos posteriormente.
|--------------------------------------------------------------------------
*/
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/*
|--------------------------------------------------------------------------
| Bootstrap Icons
|--------------------------------------------------------------------------
| Permite utilizar iconos mediante clases como:
|
| bi bi-house
| bi bi-search
| bi bi-arrow-left
|--------------------------------------------------------------------------
*/
import "bootstrap-icons/font/bootstrap-icons.css";


/*
|--------------------------------------------------------------------------
| Font Awesome
|--------------------------------------------------------------------------
| Proporciona los iconos de marcas y redes sociales utilizados en HomeView.
|--------------------------------------------------------------------------
*/
import "@fortawesome/fontawesome-free/css/all.min.css";

/*
|--------------------------------------------------------------------------
| Estilos propios
|--------------------------------------------------------------------------
| main.css se importa después de Bootstrap para permitir que nuestros
| estilos globales puedan complementar o sobrescribir reglas básicas.
|--------------------------------------------------------------------------
*/
import "./assets/main.css";

/*
|--------------------------------------------------------------------------
| Creación de la aplicación
|--------------------------------------------------------------------------
| Se crea la aplicación, se registra Vue Router y finalmente se monta
| dentro del elemento #app de index.html.
|--------------------------------------------------------------------------
*/
const app = createApp(App);

app.use(router);

app.mount("#app");
