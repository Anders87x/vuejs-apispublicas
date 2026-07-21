<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from "vue";

import { RouterLink } from "vue-router";

import AppPagination from "../components/AppPagination.vue";
import EmptyResults from "../components/EmptyResults.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import SearchInput from "../components/SearchInput.vue";

import { getErrorMessage } from "../helpers/errorHelper";

import {
  getPokemonList,
} from "../services/pokemonService";

/*
|--------------------------------------------------------------------------
| Configuración del catálogo
|--------------------------------------------------------------------------
*/
const FIRST_GENERATION_LIMIT = 151;
const ITEMS_PER_PAGE = 12;

/*
|--------------------------------------------------------------------------
| Estado principal
|--------------------------------------------------------------------------
*/
const pokemonCatalog = ref([]);
const searchTerm = ref("");
const currentPage = ref(1);
const isLoading = ref(false);
const errorMessage = ref("");
const failedImageIds = ref([]);

/*
|--------------------------------------------------------------------------
| Formatear nombre
|--------------------------------------------------------------------------
*/
const formatPokemonName = (name) => {
  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return "Pokémon desconocido";
  }

  return name
    .split("-")
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
};

/*
|--------------------------------------------------------------------------
| Catálogo filtrado
|--------------------------------------------------------------------------
| La búsqueda se realiza sobre los 151 Pokémon cargados en memoria.
|--------------------------------------------------------------------------
*/
const filteredPokemon = computed(() => {
  const normalizedSearch =
    searchTerm.value
      .trim()
      .toLocaleLowerCase();

  if (!normalizedSearch) {
    return pokemonCatalog.value;
  }

  return pokemonCatalog.value.filter(
    (pokemon) => {
      const formattedName =
        formatPokemonName(
          pokemon.name,
        ).toLocaleLowerCase();

      return (
        pokemon.name.includes(
          normalizedSearch,
        ) ||
        formattedName.includes(
          normalizedSearch,
        ) ||
        String(pokemon.id).includes(
          normalizedSearch,
        )
      );
    },
  );
});

/*
|--------------------------------------------------------------------------
| Totales
|--------------------------------------------------------------------------
*/
const totalPokemon = computed(() => {
  return pokemonCatalog.value.length;
});

const totalFilteredPokemon =
  computed(() => {
    return filteredPokemon.value.length;
  });

const totalPages = computed(() => {
  if (
    totalFilteredPokemon.value === 0
  ) {
    return 0;
  }

  return Math.ceil(
    totalFilteredPokemon.value /
      ITEMS_PER_PAGE,
  );
});

/*
|--------------------------------------------------------------------------
| Pokémon visibles
|--------------------------------------------------------------------------
| La paginación se aplica después de filtrar el catálogo completo.
|--------------------------------------------------------------------------
*/
const visiblePokemon = computed(() => {
  const startIndex =
    (currentPage.value - 1) *
    ITEMS_PER_PAGE;

  const endIndex =
    startIndex +
    ITEMS_PER_PAGE;

  return filteredPokemon.value.slice(
    startIndex,
    endIndex,
  );
});

/*
|--------------------------------------------------------------------------
| Rango mostrado
|--------------------------------------------------------------------------
*/
const firstVisibleItem = computed(() => {
  if (
    totalFilteredPokemon.value === 0
  ) {
    return 0;
  }

  return (
    (currentPage.value - 1) *
      ITEMS_PER_PAGE +
    1
  );
});

const lastVisibleItem = computed(() => {
  return Math.min(
    currentPage.value *
      ITEMS_PER_PAGE,
    totalFilteredPokemon.value,
  );
});

/*
|--------------------------------------------------------------------------
| Cargar catálogo
|--------------------------------------------------------------------------
*/
const loadPokemonCatalog = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  pokemonCatalog.value = [];
  searchTerm.value = "";
  currentPage.value = 1;
  failedImageIds.value = [];

  try {
    const response =
      await getPokemonList({
        limit:
          FIRST_GENERATION_LIMIT,
        offset: 0,
      });

    pokemonCatalog.value =
      response.results;
  } catch (error) {
    pokemonCatalog.value = [];

    errorMessage.value =
      getErrorMessage(
        error,
        "No fue posible cargar el catálogo de Pokémon.",
      );
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Cambiar página
|--------------------------------------------------------------------------
*/
const changePage = (page) => {
  if (
    isLoading.value ||
    page === currentPage.value ||
    page < 1 ||
    page > totalPages.value
  ) {
    return;
  }

  currentPage.value = page;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/*
|--------------------------------------------------------------------------
| Reiniciar paginación al buscar
|--------------------------------------------------------------------------
*/
watch(
  searchTerm,
  () => {
    currentPage.value = 1;
  },
);

/*
|--------------------------------------------------------------------------
| Control de imágenes
|--------------------------------------------------------------------------
*/
const hasImageFailed = (
  pokemonId,
) => {
  return failedImageIds.value.includes(
    pokemonId,
  );
};

const handleImageError = (
  pokemonId,
) => {
  if (
    hasImageFailed(pokemonId)
  ) {
    return;
  }

  failedImageIds.value = [
    ...failedImageIds.value,
    pokemonId,
  ];
};

/*
|--------------------------------------------------------------------------
| Carga inicial
|--------------------------------------------------------------------------
*/
onMounted(() => {
  loadPokemonCatalog();
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
        PokéAPI
      </p>

      <h1 class="page-title">
        Primera generación de Pokémon
      </h1>

      <p class="page-description">
        Explora los primeros 151 Pokémon, busca por nombre
        o número y consulta la información detallada.
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
        input-id="pokemon-search"
        label="Buscar en la primera generación"
        placeholder="Ejemplo: Pikachu o 25"
        :disabled="isLoading"
      />

      <p class="small text-secondary mt-2 mb-0">
        <i
          class="bi bi-info-circle me-1"
          aria-hidden="true"
        ></i>

        La búsqueda se aplica sobre los 151 Pokémon cargados
        y no realiza solicitudes adicionales.
      </p>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Resumen
    |--------------------------------------------------------------------------
    -->

    <div
      v-if="
        !isLoading &&
        !errorMessage &&
        totalPokemon > 0
      "
      class="content-panel mb-4"
    >
      <div
        class="d-flex flex-column flex-md-row justify-content-between gap-2"
      >
        <p class="mb-0">
          <template
            v-if="searchTerm.trim()"
          >
            <strong>
              {{ totalFilteredPokemon }}
            </strong>

            coincidencias de

            <strong>
              {{ totalPokemon }}
            </strong>
          </template>

          <template v-else>
            <strong>
              {{ totalPokemon }}
            </strong>

            Pokémon de la primera generación
          </template>
        </p>

        <p
          v-if="
            totalFilteredPokemon > 0
          "
          class="text-secondary mb-0"
        >
          Mostrando

          <strong>
            {{ firstVisibleItem }}
          </strong>

          al

          <strong>
            {{ lastVisibleItem }}
          </strong>
        </p>
      </div>
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
            No fue posible cargar los Pokémon
          </h2>

          <p class="mb-0">
            {{ errorMessage }}
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline-danger"
          @click="loadPokemonCatalog"
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
      message="Cargando los primeros 151 Pokémon..."
    />

    <!--
    |--------------------------------------------------------------------------
    | Resultados vacíos
    |--------------------------------------------------------------------------
    -->

    <EmptyResults
      v-else-if="
        totalFilteredPokemon === 0
      "
      title="No se encontraron Pokémon"
      description="Prueba con otro nombre, número o limpia la búsqueda."
      icon="bi-search"
    />

    <!--
    |--------------------------------------------------------------------------
    | Catálogo
    |--------------------------------------------------------------------------
    -->

    <template v-else>
      <div
        class="row g-4"
        aria-live="polite"
      >
        <div
          v-for="pokemon in visiblePokemon"
          :key="pokemon.id"
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
                  pokemon.imageUrl &&
                  !hasImageFailed(pokemon.id)
                "
                class="resource-card__image"
                :src="pokemon.imageUrl"
                :alt="
                  `Imagen de ${formatPokemonName(
                    pokemon.name,
                  )}`
                "
                loading="lazy"
                @error="
                  handleImageError(
                    pokemon.id,
                  )
                "
              />

              <div
                v-else
                class="text-center text-secondary p-3"
              >
                <i
                  class="bi bi-image display-4"
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
              <p
                class="small fw-semibold text-uppercase text-primary mb-2"
              >
                Pokémon #{{ pokemon.id }}
              </p>

              <h2
                class="resource-card__title flex-grow-1"
              >
                {{
                  formatPokemonName(
                    pokemon.name,
                  )
                }}
              </h2>

              <RouterLink
                :to="{
                  name: 'pokemon-detail',
                  params: {
                    name: pokemon.name,
                  },
                }"
                class="btn btn-outline-primary w-100 mt-3"
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
      -->

      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :disabled="isLoading"
        @change="changePage"
      />
    </template>
  </section>
</template>