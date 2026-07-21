import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import SimpsonsView from "../views/SimpsonsView.vue";
import SimpsonsDetailView from "../views/SimpsonsDetailView.vue";
import PokemonView from "../views/PokemonView.vue";
import PokemonDetailView from "../views/PokemonDetailView.vue";
import YugiohView from "../views/YugiohView.vue";
import YugiohDetailView from "../views/YugiohDetailView.vue";
import NotFoundView from "../views/NotFoundView.vue";

/*
|--------------------------------------------------------------------------
| Rutas de la aplicación
|--------------------------------------------------------------------------
| Cada módulo cuenta con una ruta de listado y una ruta dinámica para
| mostrar posteriormente el detalle de un recurso.
|--------------------------------------------------------------------------
*/
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/simpsons",
    name: "simpsons",
    component: SimpsonsView,
  },
  {
    path: "/simpsons/:id",
    name: "simpsons-detail",
    component: SimpsonsDetailView,
    props: true,
  },
  {
    path: "/pokemon",
    name: "pokemon",
    component: PokemonView,
  },
  {
    path: "/pokemon/:name",
    name: "pokemon-detail",
    component: PokemonDetailView,
    props: true,
  },
  {
    path: "/yugioh",
    name: "yugioh",
    component: YugiohView,
  },
  {
    path: "/yugioh/:id",
    name: "yugioh-detail",
    component: YugiohDetailView,
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView,
  },
];

/*
|--------------------------------------------------------------------------
| Creación del router
|--------------------------------------------------------------------------
| createWebHashHistory permite que las rutas funcionen correctamente en
| GitHub Pages sin requerir configuración adicional del servidor.
|--------------------------------------------------------------------------
*/
const router = createRouter({
  history: createWebHashHistory(),
  routes,

  /*
  |--------------------------------------------------------------------------
  | Posición del scroll
  |--------------------------------------------------------------------------
  | Cada navegación comienza desde la parte superior de la página.
  |--------------------------------------------------------------------------
  */
  scrollBehavior() {
    return {
      top: 0,
    };
  },
});

export default router;
