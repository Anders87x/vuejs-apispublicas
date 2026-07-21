<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "No se encontraron resultados",
  },

  description: {
    type: String,
    default:
      "Prueba con otro término de búsqueda.",
  },

  icon: {
    type: String,
    default: "bi-search",
  },
});
</script>

<template>
  <div
    class="empty-results"
    role="status"
  >
    <i
      class="bi empty-results__icon"
      :class="props.icon"
      aria-hidden="true"
    ></i>

    <h2 class="h4 empty-results__title">
      {{ props.title }}
    </h2>

    <p class="empty-results__description">
      {{ props.description }}
    </p>
  </div>
</template>