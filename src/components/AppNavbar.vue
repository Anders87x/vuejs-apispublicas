<script setup>
import {
  RouterLink,
  useRoute,
} from "vue-router";

const route = useRoute();

/*
|--------------------------------------------------------------------------
| Verificación de sección activa
|--------------------------------------------------------------------------
| Permite mantener activo el enlace principal de un módulo cuando el
| usuario se encuentra en una ruta de detalle.
|--------------------------------------------------------------------------
*/
const isSectionActive = (path) => {
  return (
    route.path === path ||
    route.path.startsWith(`${path}/`)
  );
};
</script>

<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-dark"
    aria-label="Navegación principal"
  >
    <div class="container">
      <RouterLink
        :to="{ name: 'home' }"
        class="navbar-brand fw-bold"
      >
        <i class="bi bi-code-slash me-2"></i>

        Vue API Universe
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#appNavbar"
        aria-controls="appNavbar"
        aria-expanded="false"
        aria-label="Mostrar navegación"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        id="appNavbar"
        class="collapse navbar-collapse"
      >
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink
              :to="{ name: 'home' }"
              class="nav-link"
              :class="{
                active: route.path === '/',
              }"
            >
              <i class="bi bi-house-door me-1"></i>
              Inicio
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              :to="{ name: 'simpsons' }"
              class="nav-link"
              :class="{
                active: isSectionActive('/simpsons'),
              }"
            >
              <i class="bi bi-people me-1"></i>
              Simpsons
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              :to="{ name: 'pokemon' }"
              class="nav-link"
              :class="{
                active: isSectionActive('/pokemon'),
              }"
            >
              <i class="bi bi-circle me-1"></i>
              Pokémon
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink
              :to="{ name: 'yugioh' }"
              class="nav-link"
              :class="{
                active: isSectionActive('/yugioh'),
              }"
            >
              <i class="bi bi-card-image me-1"></i>
              Yu-Gi-Oh!
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>