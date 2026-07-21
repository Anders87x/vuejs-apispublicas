<script setup>
import {
  computed,
  ref,
  watch,
} from "vue";

import { RouterLink } from "vue-router";

import LoadingSpinner from "../components/LoadingSpinner.vue";

import { getErrorMessage } from "../helpers/errorHelper";

import {
  getYugiohCardById,
} from "../services/yugiohService";

/*
|--------------------------------------------------------------------------
| Parámetro dinámico
|--------------------------------------------------------------------------
*/
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

/*
|--------------------------------------------------------------------------
| Estado
|--------------------------------------------------------------------------
*/
const card = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const hasImageFailed = ref(false);

/*
|--------------------------------------------------------------------------
| Imagen principal
|--------------------------------------------------------------------------
*/
const cardImageUrl = computed(() => {
  return (
    card.value?.imageUrl ??
    card.value?.imageSmallUrl ??
    null
  );
});

/*
|--------------------------------------------------------------------------
| Párrafos de descripción
|--------------------------------------------------------------------------
| Conservamos los saltos de línea sin agregar estilos especiales.
|--------------------------------------------------------------------------
*/
const descriptionParagraphs =
  computed(() => {
    if (!card.value?.description) {
      return [];
    }

    return card.value.description
      .split(/\n+/)
      .map((paragraph) => {
        return paragraph.trim();
      })
      .filter(Boolean);
  });

/*
|--------------------------------------------------------------------------
| Comprobar valores
|--------------------------------------------------------------------------
*/
const hasValue = (value) => {
  return (
    value !== null &&
    value !== undefined
  );
};

/*
|--------------------------------------------------------------------------
| Clase según tipo
|--------------------------------------------------------------------------
*/
const getCardTypeClass = (type) => {
  const normalizedType =
    type?.toLowerCase() ?? "";

  if (
    normalizedType.includes("spell")
  ) {
    return "text-bg-success";
  }

  if (
    normalizedType.includes("trap")
  ) {
    return "text-bg-danger";
  }

  if (
    normalizedType.includes("monster")
  ) {
    return "text-bg-primary";
  }

  return "text-bg-secondary";
};

/*
|--------------------------------------------------------------------------
| Cargar carta
|--------------------------------------------------------------------------
*/
const loadCard = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  card.value = null;
  hasImageFailed.value = false;

  try {
    card.value =
      await getYugiohCardById(
        props.id,
      );
  } catch (error) {
    if (
      error?.response?.status === 404
    ) {
      errorMessage.value =
        "La carta solicitada no fue encontrada.";
    } else {
      errorMessage.value =
        getErrorMessage(
          error,
          "No fue posible cargar la carta.",
        );
    }
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Observar identificador
|--------------------------------------------------------------------------
*/
watch(
  () => props.id,
  () => {
    loadCard();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <section class="page-section">
    <!-- Regresar -->

    <div class="mb-4">
      <RouterLink
        :to="{ name: 'yugioh' }"
        class="btn btn-outline-secondary"
      >
        <i
          class="bi bi-arrow-left me-2"
          aria-hidden="true"
        ></i>

        Volver a cartas
      </RouterLink>
    </div>

    <!-- Cargando -->

    <LoadingSpinner
      v-if="isLoading"
      message="Cargando carta..."
    />

    <!-- Error -->

    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      <h1 class="h4 alert-heading">
        Carta no disponible
      </h1>

      <p>
        {{ errorMessage }}
      </p>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-danger"
          @click="loadCard"
        >
          <i
            class="bi bi-arrow-clockwise me-2"
            aria-hidden="true"
          ></i>

          Reintentar
        </button>

        <RouterLink
          :to="{ name: 'yugioh' }"
          class="btn btn-outline-danger"
        >
          Volver al listado
        </RouterLink>
      </div>
    </div>

    <!-- Detalle -->

    <template v-else-if="card">
      <div class="detail-panel">
        <div class="row g-4 align-items-start">
          <!-- Imagen -->

          <div class="col-12 col-md-5 col-lg-4">
            <div class="detail-image-container">
              <img
                v-if="
                  cardImageUrl &&
                  !hasImageFailed
                "
                class="detail-image"
                :src="cardImageUrl"
                :alt="`Carta ${card.name}`"
                referrerpolicy="no-referrer"
                @error="
                  hasImageFailed = true
                "
              />

              <div
                v-else
                class="text-center text-secondary p-4"
              >
                <i
                  class="bi bi-card-image display-3"
                  aria-hidden="true"
                ></i>

                <p class="mt-3 mb-0">
                  Imagen no disponible
                </p>
              </div>
            </div>
          </div>

          <!-- Información principal -->

          <div class="col-12 col-md-7 col-lg-8">
            <p
              class="small fw-semibold text-uppercase text-primary mb-2"
            >
              Carta #{{ card.id }}
            </p>

            <h1 class="page-title">
              {{ card.name }}
            </h1>

            <div class="d-flex flex-wrap gap-2 mb-4">
              <span
                class="badge fs-6"
                :class="
                  getCardTypeClass(
                    card.originalType,
                  )
                "
              >
                {{ card.type }}
              </span>

              <span
                v-if="card.attribute"
                class="badge text-bg-dark fs-6"
              >
                {{ card.attribute }}
              </span>

              <span
                v-if="card.race"
                class="badge text-bg-secondary fs-6"
              >
                {{ card.race }}
              </span>
            </div>

            <div class="row g-3">
              <div
                v-if="card.archetype"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Arquetipo
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.archetype }}
                  </p>
                </div>
              </div>

              <div
                v-if="hasValue(card.level)"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Nivel o rango
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.level }}
                  </p>
                </div>
              </div>

              <div
                v-if="hasValue(card.atk)"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Ataque
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.atk }}
                  </p>
                </div>
              </div>

              <div
                v-if="hasValue(card.def)"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Defensa
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.def }}
                  </p>
                </div>
              </div>

              <div
                v-if="hasValue(card.linkValue)"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Valor de enlace
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.linkValue }}
                  </p>
                </div>
              </div>

              <div
                v-if="hasValue(card.scale)"
                class="col-12 col-sm-6"
              >
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Escala péndulo
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ card.scale }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Descripción -->

      <div class="content-panel mt-4">
        <h2 class="h4 mb-3">
          Descripción de la carta
        </h2>

        <div
          v-if="descriptionParagraphs.length > 0"
        >
          <p
            v-for="(
              paragraph,
              index
            ) in descriptionParagraphs"
            :key="`${card.id}-description-${index}`"
            class="text-break-safe"
            :class="{
              'mb-0':
                index ===
                descriptionParagraphs.length - 1,
            }"
          >
            {{ paragraph }}
          </p>
        </div>

        <p
          v-else
          class="text-secondary mb-0"
        >
          No existe una descripción disponible.
        </p>
      </div>

      <!-- Marcadores de enlace -->

      <div
        v-if="card.linkMarkers.length > 0"
        class="content-panel mt-4"
      >
        <h2 class="h4 mb-3">
          Marcadores de enlace
        </h2>

        <div class="d-flex flex-wrap gap-2">
          <span
            v-for="marker in card.linkMarkers"
            :key="marker"
            class="badge text-bg-primary fs-6"
          >
            {{ marker }}
          </span>
        </div>
      </div>

      <!-- Sets -->

      <div
        v-if="card.cardSets.length > 0"
        class="content-panel mt-4"
      >
        <h2 class="h4 mb-3">
          Sets disponibles
        </h2>

        <div class="list-group">
          <div
            v-for="(
              cardSet,
              index
            ) in card.cardSets.slice(0, 10)"
            :key="
              `${cardSet.code || index}-${index}`
            "
            class="list-group-item"
          >
            <div
              class="d-flex flex-column flex-md-row justify-content-between gap-2"
            >
              <div>
                <p class="fw-semibold mb-1">
                  {{ cardSet.name }}
                </p>

                <p
                  v-if="cardSet.code"
                  class="small text-secondary mb-0"
                >
                  Código:
                  {{ cardSet.code }}
                </p>
              </div>

              <div class="text-md-end">
                <p
                  v-if="cardSet.rarity"
                  class="small mb-1"
                >
                  {{ cardSet.rarity }}
                </p>

                <p
                  v-if="cardSet.price"
                  class="small text-secondary mb-0"
                >
                  Precio registrado:
                  ${{ cardSet.price }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          v-if="card.cardSets.length > 10"
          class="small text-secondary mt-3 mb-0"
        >
          Se muestran los primeros 10 sets de
          {{ card.cardSets.length }} disponibles.
        </p>
      </div>
    </template>
  </section>
</template>