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
  getSimpsonsCharacterById,
  getSimpsonsImageUrl,
} from "../services/simpsonsService";

/*
|--------------------------------------------------------------------------
| Parámetro dinámico
|--------------------------------------------------------------------------
| El router entrega el identificador mediante props porque la ruta tiene
| configurado props: true.
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
const character = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const hasCharacterImageFailed = ref(false);

/*
|--------------------------------------------------------------------------
| Frases disponibles
|--------------------------------------------------------------------------
*/
const phrases = computed(() => {
  if (!Array.isArray(character.value?.phrases)) {
    return [];
  }

  return character.value.phrases.filter(
    (phrase) => {
      return (
        typeof phrase === "string" &&
        phrase.trim()
      );
    },
  );
});

/*
|--------------------------------------------------------------------------
| Formatear fecha
|--------------------------------------------------------------------------
*/
const formatDate = (date) => {
  if (!date) {
    return "No disponible";
  }

  const parsedDate = new Date(
    `${date}T00:00:00`,
  );

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(parsedDate);
};

/*
|--------------------------------------------------------------------------
| Clase del estado
|--------------------------------------------------------------------------
*/
const getStatusClass = (status) => {
  const normalizedStatus =
    status?.trim().toLowerCase();

  if (normalizedStatus === "alive") {
    return "text-bg-success";
  }

  if (
    normalizedStatus === "deceased" ||
    normalizedStatus === "dead"
  ) {
    return "text-bg-secondary";
  }

  return "text-bg-light";
};

/*
|--------------------------------------------------------------------------
| Cargar personaje
|--------------------------------------------------------------------------
*/
const loadCharacter = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  character.value = null;
  hasCharacterImageFailed.value = false;

  try {
    character.value =
      await getSimpsonsCharacterById(
        props.id,
      );
  } catch (error) {
    errorMessage.value =
      getErrorMessage(
        error,
        "No fue posible cargar el personaje.",
      );
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Observar el parámetro
|--------------------------------------------------------------------------
| immediate ejecuta la consulta al entrar en la vista.
|
| Si el identificador cambia mientras el componente continúa montado,
| vuelve a cargar el personaje correspondiente.
|--------------------------------------------------------------------------
*/
watch(
  () => props.id,
  () => {
    loadCharacter();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <section class="page-section">
    <!--
    |--------------------------------------------------------------------------
    | Navegación de regreso
    |--------------------------------------------------------------------------
    -->

    <div class="mb-4">
      <RouterLink
        :to="{ name: 'simpsons' }"
        class="btn btn-outline-secondary"
      >
        <i
          class="bi bi-arrow-left me-2"
          aria-hidden="true"
        ></i>

        Volver a personajes
      </RouterLink>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Cargando
    |--------------------------------------------------------------------------
    -->

    <LoadingSpinner
      v-if="isLoading"
      message="Cargando personaje..."
    />

    <!--
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    -->

    <div
      v-else-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      <h1 class="h4 alert-heading">
        Personaje no disponible
      </h1>

      <p>
        {{ errorMessage }}
      </p>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-danger"
          @click="loadCharacter"
        >
          <i
            class="bi bi-arrow-clockwise me-2"
            aria-hidden="true"
          ></i>

          Reintentar
        </button>

        <RouterLink
          :to="{ name: 'simpsons' }"
          class="btn btn-outline-danger"
        >
          Volver al listado
        </RouterLink>
      </div>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Detalle
    |--------------------------------------------------------------------------
    -->

    <template v-else-if="character">
      <div class="detail-panel">
        <div class="row g-4 align-items-start">
          <!--
          |--------------------------------------------------------------------------
          | Imagen del personaje
          |--------------------------------------------------------------------------
          -->

          <div class="col-12 col-md-5 col-lg-4">
            <div class="detail-image-container">
              <img
                v-if="
                  character.portrait_path &&
                  !hasCharacterImageFailed
                "
                class="detail-image"
                :src="
                  getSimpsonsImageUrl(
                    character.portrait_path,
                  )
                "
                :alt="
                  `Retrato de ${character.name}`
                "
                @error="
                  hasCharacterImageFailed = true
                "
              />

              <div
                v-else
                class="text-center text-secondary p-4"
              >
                <i
                  class="bi bi-person-bounding-box display-3"
                  aria-hidden="true"
                ></i>

                <p class="mt-3 mb-0">
                  Imagen no disponible
                </p>
              </div>
            </div>
          </div>

          <!--
          |--------------------------------------------------------------------------
          | Datos principales
          |--------------------------------------------------------------------------
          -->

          <div class="col-12 col-md-7 col-lg-8">
            <p
              class="small fw-semibold text-uppercase text-primary mb-2"
            >
              Personaje #{{ character.id }}
            </p>

            <div
              class="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-2 mb-3"
            >
              <h1 class="page-title mb-0">
                {{ character.name }}
              </h1>

              <span
                v-if="character.status"
                class="badge"
                :class="
                  getStatusClass(
                    character.status,
                  )
                "
              >
                {{ character.status }}
              </span>
            </div>

            <p
              v-if="character.description"
              class="text-secondary lh-lg"
            >
              {{ character.description }}
            </p>

            <div class="row g-3 mt-1">
              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Ocupación
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      character.occupation ||
                      "No disponible"
                    }}
                  </p>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Edad
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      character.age ??
                      "No disponible"
                    }}
                  </p>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Género
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      character.gender ||
                      "No disponible"
                    }}
                  </p>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Fecha de nacimiento
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      formatDate(
                        character.birthdate,
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--
      |--------------------------------------------------------------------------
      | Frases
      |--------------------------------------------------------------------------
      -->

      <div class="content-panel mt-4">
        <h2 class="h4 mb-3">
          Frases del personaje
        </h2>

        <ul
          v-if="phrases.length > 0"
          class="list-group"
        >
          <li
            v-for="(phrase, index) in phrases"
            :key="`${character.id}-phrase-${index}`"
            class="list-group-item"
          >
            <i
              class="bi bi-chat-quote me-2 text-primary"
              aria-hidden="true"
            ></i>

            {{ phrase }}
          </li>
        </ul>

        <p
          v-else
          class="text-secondary mb-0"
        >
          Este personaje no tiene frases registradas.
        </p>
      </div>

      <!--
      |--------------------------------------------------------------------------
      | Primera aparición en episodio
      |--------------------------------------------------------------------------
      -->

      <div
        v-if="character.first_appearance_ep"
        class="content-panel mt-4"
      >
        <h2 class="h4 mb-3">
          Primera aparición en un episodio
        </h2>

        <div class="row g-4 align-items-center">
          <div
            v-if="
              character.first_appearance_ep.image_path
            "
            class="col-12 col-md-4"
          >
            <div
              class="resource-card__image-container rounded"
            >
              <img
                class="resource-card__image"
                :src="
                  getSimpsonsImageUrl(
                    character.first_appearance_ep
                      .image_path,
                  )
                "
                :alt="
                  `Imagen de ${character.first_appearance_ep.name}`
                "
                loading="lazy"
              />
            </div>
          </div>

          <div
            :class="
              character.first_appearance_ep
                .image_path
                ? 'col-12 col-md-8'
                : 'col-12'
            "
          >
            <h3 class="h5">
              {{
                character.first_appearance_ep
                  .name
              }}
            </h3>

            <p class="text-secondary mb-2">
              Temporada
              {{
                character.first_appearance_ep
                  .season
              }},
              episodio
              {{
                character.first_appearance_ep
                  .episode_number
              }}
            </p>

            <p class="mb-2">
              {{
                character.first_appearance_ep
                  .synopsis ||
                character.first_appearance_ep
                  .description ||
                "Sin descripción disponible."
              }}
            </p>

            <p class="small text-secondary mb-0">
              Fecha de emisión:

              {{
                formatDate(
                  character.first_appearance_ep
                    .airdate,
                )
              }}
            </p>
          </div>
        </div>
      </div>

      <!--
      |--------------------------------------------------------------------------
      | Primera aparición en cortometraje
      |--------------------------------------------------------------------------
      -->

      <div
        v-if="character.first_appearance_sh"
        class="content-panel mt-4"
      >
        <h2 class="h4 mb-3">
          Primera aparición en un cortometraje
        </h2>

        <div class="row g-4 align-items-center">
          <div
            v-if="
              character.first_appearance_sh.image_path
            "
            class="col-12 col-md-4"
          >
            <div
              class="resource-card__image-container rounded"
            >
              <img
                class="resource-card__image"
                :src="
                  getSimpsonsImageUrl(
                    character.first_appearance_sh
                      .image_path,
                  )
                "
                :alt="
                  `Imagen de ${character.first_appearance_sh.name}`
                "
                loading="lazy"
              />
            </div>
          </div>

          <div
            :class="
              character.first_appearance_sh
                .image_path
                ? 'col-12 col-md-8'
                : 'col-12'
            "
          >
            <h3 class="h5">
              {{
                character.first_appearance_sh
                  .name
              }}
            </h3>

            <p class="text-secondary mb-2">
              Temporada
              {{
                character.first_appearance_sh
                  .season
              }},
              cortometraje
              {{
                character.first_appearance_sh
                  .episode_number
              }}
            </p>

            <p class="mb-2">
              {{
                character.first_appearance_sh
                  .synopsis ||
                character.first_appearance_sh
                  .description ||
                "Sin descripción disponible."
              }}
            </p>

            <p class="small text-secondary mb-0">
              Fecha de emisión:

              {{
                formatDate(
                  character.first_appearance_sh
                    .airdate,
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>