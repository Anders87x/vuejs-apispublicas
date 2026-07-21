<script setup>
/*
|--------------------------------------------------------------------------
| Año actual
|--------------------------------------------------------------------------
| Se calcula automáticamente para evitar actualizarlo manualmente.
|--------------------------------------------------------------------------
*/
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer border-top bg-white">
    <div
      class="container py-4 text-center text-secondary"
    >
      <p class="mb-1">
        Vue.js: Aplicación de APIs Públicas
      </p>

      <p class="small mb-0">
        © {{ currentYear }} AnderCode
      </p>
    </div>
  </footer>
</template>