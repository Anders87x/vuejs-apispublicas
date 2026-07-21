<script setup>
/*
|--------------------------------------------------------------------------
| Propiedades
|--------------------------------------------------------------------------
| El mensaje puede personalizarse desde cada módulo.
|--------------------------------------------------------------------------
*/
const props = defineProps({
  message: {
    type: String,
    default: "Cargando información...",
  },
});
</script>

<template>
  <div
    class="loading-container"
    role="status"
    aria-live="polite"
  >
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        aria-hidden="true"
      ></div>

      <p class="text-secondary mt-3 mb-0">
        {{ props.message }}
      </p>
    </div>
  </div>
</template>