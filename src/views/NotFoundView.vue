<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="page-section">
    <div class="content-panel text-center py-5">
      <i
        class="bi bi-exclamation-triangle display-1 text-warning"
        aria-hidden="true"
      ></i>

      <p
        class="small fw-semibold text-uppercase text-secondary mt-3 mb-2"
      >
        Error 404
      </p>

      <h1 class="h2">
        Página no encontrada
      </h1>

      <p class="text-secondary mb-4">
        La dirección ingresada no existe dentro de esta aplicación.
      </p>

      <RouterLink
        :to="{ name: 'home' }"
        class="btn btn-primary"
      >
        <i class="bi bi-house-door me-2"></i>
        Volver al inicio
      </RouterLink>
    </div>
  </section>
</template>