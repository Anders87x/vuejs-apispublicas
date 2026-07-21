<script setup>
import { RouterLink } from "vue-router";

/*
|--------------------------------------------------------------------------
| Propiedades
|--------------------------------------------------------------------------
*/
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  icon: {
    type: String,
    required: true,
  },

  routeName: {
    type: String,
    required: true,
  },

  buttonText: {
    type: String,
    default: "Explorar módulo",
  },

  theme: {
    type: String,
    default: "default",
  },

  moduleNumber: {
    type: String,
    default: "01",
  },

  features: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <article
    class="project-card"
    :class="`project-card--${props.theme}`"
  >
    <div
      class="project-card__glow"
      aria-hidden="true"
    ></div>

    <div class="project-card__content">
      <header class="project-card__header">
        <div class="project-card__icon">
          <i
            class="bi"
            :class="props.icon"
            aria-hidden="true"
          ></i>
        </div>

        <span class="project-card__number">
          {{ props.moduleNumber }}
        </span>
      </header>

      <div class="project-card__body">
        <p class="project-card__eyebrow">
          Módulo interactivo
        </p>

        <h3 class="project-card__title">
          {{ props.title }}
        </h3>

        <p class="project-card__description">
          {{ props.description }}
        </p>

        <ul
          v-if="props.features.length"
          class="project-card__features"
        >
          <li
            v-for="feature in props.features"
            :key="feature"
          >
            <i
              class="bi bi-check-circle-fill"
              aria-hidden="true"
            ></i>

            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>

      <footer class="project-card__footer">
        <RouterLink
          :to="{ name: props.routeName }"
          class="project-card__button"
        >
          <span>{{ props.buttonText }}</span>

          <i
            class="bi bi-arrow-up-right"
            aria-hidden="true"
          ></i>
        </RouterLink>
      </footer>
    </div>
  </article>
</template>