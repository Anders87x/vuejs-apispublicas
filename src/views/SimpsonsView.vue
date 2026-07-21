<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from "vue";

import { RouterLink } from "vue-router";

import AppPagination from "../components/AppPagination.vue";
import EmptyResults from "../components/EmptyResults.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import SearchInput from "../components/SearchInput.vue";

import { getErrorMessage } from "../helpers/errorHelper";

import {
  getSimpsonsCharacters,
  getSimpsonsImageUrl,
} from "../services/simpsonsService";

/*
|--------------------------------------------------------------------------
| Estado principal
|--------------------------------------------------------------------------
*/
const characters = ref([]);
const searchTerm = ref("");
const currentPage = ref(1);
const isLoading = ref(false);
const errorMessage = ref("");
const failedImageIds = ref([]);

/*
|--------------------------------------------------------------------------
| Información de paginación
|--------------------------------------------------------------------------
*/
const pagination = reactive({
  count: 0,
  pages: 0,
  next: null,
  prev: null,
});

/*
|--------------------------------------------------------------------------
| Personajes filtrados
|--------------------------------------------------------------------------
| La API no proporciona una búsqueda documentada para este listado.
|
| Por ese motivo, la búsqueda se realiza únicamente sobre los personajes
| que pertenecen a la página actual.
|--------------------------------------------------------------------------
*/
const filteredCharacters = computed(() => {
  const normalizedSearch =
    searchTerm.value
      .trim()
      .toLocaleLowerCase();

  if (!normalizedSearch) {
    return characters.value;
  }

  return characters.value.filter(
    (character) => {
      const characterName =
        character.name
          ?.toLocaleLowerCase() ?? "";

      return characterName.includes(
        normalizedSearch,
      );
    },
  );
});

/*
|--------------------------------------------------------------------------
| Cargar personajes
|--------------------------------------------------------------------------
*/
const loadCharacters = async (
  page = 1,
) => {
  isLoading.value = true;
  errorMessage.value = "";
  failedImageIds.value = [];

  try {
    const response =
      await getSimpsonsCharacters(page);

    characters.value =
      response.results;

    currentPage.value = page;

    pagination.count =
      response.count;

    pagination.pages =
      response.pages;

    pagination.next =
      response.next;

    pagination.prev =
      response.prev;
  } catch (error) {
    characters.value = [];

    pagination.count = 0;
    pagination.pages = 0;
    pagination.next = null;
    pagination.prev = null;

    errorMessage.value =
      getErrorMessage(
        error,
        "No fue posible cargar los personajes.",
      );
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Cambiar de página
|--------------------------------------------------------------------------
| La búsqueda se limpia porque solamente se aplica sobre la página actual.
|--------------------------------------------------------------------------
*/
const changePage = async (page) => {
  if (
    isLoading.value ||
    page === currentPage.value
  ) {
    return;
  }

  searchTerm.value = "";

  await loadCharacters(page);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/*
|--------------------------------------------------------------------------
| Control de imágenes
|--------------------------------------------------------------------------
*/
const hasImageFailed = (
  characterId,
) => {
  return failedImageIds.value.includes(
    characterId,
  );
};

const handleImageError = (
  characterId,
) => {
  if (
    hasImageFailed(characterId)
  ) {
    return;
  }

  failedImageIds.value = [
    ...failedImageIds.value,
    characterId,
  ];
};

/*
|--------------------------------------------------------------------------
| Clase de estado
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
| Carga inicial
|--------------------------------------------------------------------------
*/
onMounted(() => {
  loadCharacters(1);
});
</script>

<template>
  <section class="page-section">
    <!--
    |--------------------------------------------------------------------------
    | Encabezado
    |--------------------------------------------------------------------------
    -->

    <header class="page-header">
      <p
        class="small fw-semibold text-uppercase text-primary mb-2"
      >
        The Simpsons API
      </p>

      <h1 class="page-title">
        Personajes de The Simpsons
      </h1>

      <p class="page-description">
        Explora los personajes, filtra los resultados de la página
        actual y consulta la información completa de cada uno.
      </p>
    </header>

    <!--
    |--------------------------------------------------------------------------
    | Buscador
    |--------------------------------------------------------------------------
    -->

    <div class="content-panel mb-4">
      <SearchInput
        v-model="searchTerm"
        input-id="simpsons-search"
        label="Buscar personaje en esta página"
        placeholder="Ejemplo: Homer Simpson"
        :disabled="isLoading"
      />

      <p class="small text-secondary mt-2 mb-0">
        <i
          class="bi bi-info-circle me-1"
          aria-hidden="true"
        ></i>

        La búsqueda se aplica únicamente sobre los 20 personajes
        cargados en la página actual.
      </p>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Resumen
    |--------------------------------------------------------------------------
    -->

    <div
      v-if="!isLoading && !errorMessage"
      class="content-panel mb-4"
    >
      <div
        class="d-flex flex-column flex-md-row justify-content-between gap-2"
      >
        <p class="mb-0">
          <span class="fw-semibold">
            {{ pagination.count }}
          </span>

          personajes disponibles
        </p>

        <p
          v-if="pagination.pages > 0"
          class="text-secondary mb-0"
        >
          Página
          <strong>{{ currentPage }}</strong>
          de
          <strong>{{ pagination.pages }}</strong>
        </p>
      </div>

      <p
        v-if="searchTerm.trim()"
        class="small text-secondary mt-2 mb-0"
      >
        Coincidencias encontradas en esta página:

        <strong>
          {{ filteredCharacters.length }}
        </strong>
      </p>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    -->

    <div
      v-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      <div
        class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
      >
        <div>
          <h2 class="h5 alert-heading">
            No fue posible cargar los personajes
          </h2>

          <p class="mb-0">
            {{ errorMessage }}
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline-danger"
          @click="loadCharacters(currentPage)"
        >
          <i
            class="bi bi-arrow-clockwise me-2"
            aria-hidden="true"
          ></i>

          Reintentar
        </button>
      </div>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Cargando
    |--------------------------------------------------------------------------
    -->

    <LoadingSpinner
      v-else-if="isLoading"
      message="Cargando personajes..."
    />

    <!--
    |--------------------------------------------------------------------------
    | Resultados
    |--------------------------------------------------------------------------
    -->

    <template v-else>
      <EmptyResults
        v-if="filteredCharacters.length === 0"
        title="No se encontraron personajes"
        description="Prueba con otro nombre o limpia la búsqueda."
        icon="bi-person-x"
      />

      <div
        v-else
        class="row g-4"
        aria-live="polite"
      >
        <div
          v-for="character in filteredCharacters"
          :key="character.id"
          class="col-12 col-sm-6 col-lg-4 col-xl-3"
        >
          <article class="resource-card">
            <!--
            |--------------------------------------------------------------------------
            | Imagen
            |--------------------------------------------------------------------------
            -->

            <div
              class="resource-card__image-container"
            >
              <img
                v-if="
                  character.portrait_path &&
                  !hasImageFailed(character.id)
                "
                class="resource-card__image"
                :src="
                  getSimpsonsImageUrl(
                    character.portrait_path,
                  )
                "
                :alt="
                  `Retrato de ${character.name}`
                "
                loading="lazy"
                @error="
                  handleImageError(character.id)
                "
              />

              <div
                v-else
                class="text-center text-secondary p-3"
              >
                <i
                  class="bi bi-person-bounding-box display-4"
                  aria-hidden="true"
                ></i>

                <p class="small mt-2 mb-0">
                  Imagen no disponible
                </p>
              </div>
            </div>

            <!--
            |--------------------------------------------------------------------------
            | Información
            |--------------------------------------------------------------------------
            -->

            <div class="resource-card__body">
              <div
                class="d-flex align-items-start justify-content-between gap-2 mb-2"
              >
                <h2
                  class="resource-card__title mb-0"
                >
                  {{ character.name }}
                </h2>

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
                class="small text-secondary mb-1"
              >
                Ocupación
              </p>

              <p class="mb-3 flex-grow-1 line-clamp-3">
                {{
                  character.occupation ||
                  "Ocupación desconocida"
                }}
              </p>

              <RouterLink
                :to="{
                  name: 'simpsons-detail',
                  params: {
                    id: character.id,
                  },
                }"
                class="btn btn-outline-primary w-100"
              >
                Ver detalle

                <i
                  class="bi bi-arrow-right ms-2"
                  aria-hidden="true"
                ></i>
              </RouterLink>
            </div>
          </article>
        </div>
      </div>

      <!--
      |--------------------------------------------------------------------------
      | Paginación
      |--------------------------------------------------------------------------
      | Se mantiene visible aunque la búsqueda no encuentre coincidencias,
      | permitiendo limpiar el filtro o continuar navegando.
      |--------------------------------------------------------------------------
      -->

      <AppPagination
        :current-page="currentPage"
        :total-pages="pagination.pages"
        :disabled="isLoading"
        @change="changePage"
      />
    </template>
  </section>
</template>