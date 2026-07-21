<script setup>
import {
  computed,
  onMounted,
  reactive,
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
  getYugiohCards,
} from "../services/yugiohService";

/*
|--------------------------------------------------------------------------
| Configuración
|--------------------------------------------------------------------------
*/
const ITEMS_PER_PAGE = 12;

/*
|--------------------------------------------------------------------------
| Opciones de tipo
|--------------------------------------------------------------------------
| El valor enviado debe coincidir con los tipos admitidos por la API.
|--------------------------------------------------------------------------
*/
const cardTypeOptions = [
  {
    value: "",
    label: "Todos los tipos",
  },
  {
    value: "Normal Monster",
    label: "Monstruo normal",
  },
  {
    value: "Effect Monster",
    label: "Monstruo de efecto",
  },
  {
    value: "Ritual Monster",
    label: "Monstruo ritual",
  },
  {
    value: "Fusion Monster",
    label: "Monstruo de fusión",
  },
  {
    value: "Synchro Monster",
    label: "Monstruo sincronía",
  },
  {
    value: "XYZ Monster",
    label: "Monstruo XYZ",
  },
  {
    value: "Link Monster",
    label: "Monstruo de enlace",
  },
  {
    value: "Pendulum Effect Monster",
    label: "Monstruo péndulo",
  },
  {
    value: "Spell Card",
    label: "Carta mágica",
  },
  {
    value: "Trap Card",
    label: "Carta de trampa",
  },
];

/*
|--------------------------------------------------------------------------
| Opciones de atributo
|--------------------------------------------------------------------------
*/
const attributeOptions = [
  {
    value: "",
    label: "Todos los atributos",
  },
  {
    value: "DARK",
    label: "Oscuridad",
  },
  {
    value: "DIVINE",
    label: "Divino",
  },
  {
    value: "EARTH",
    label: "Tierra",
  },
  {
    value: "FIRE",
    label: "Fuego",
  },
  {
    value: "LIGHT",
    label: "Luz",
  },
  {
    value: "WATER",
    label: "Agua",
  },
  {
    value: "WIND",
    label: "Viento",
  },
];

/*
|--------------------------------------------------------------------------
| Estado del formulario
|--------------------------------------------------------------------------
*/
const searchTerm = ref("");
const selectedType = ref("");
const selectedAttribute = ref("");

/*
|--------------------------------------------------------------------------
| Criterios aplicados
|--------------------------------------------------------------------------
| El usuario puede escribir o seleccionar valores sin ejecutar todavía una
| nueva consulta.
|--------------------------------------------------------------------------
*/
const criteria = reactive({
  search: "",
  type: "",
  attribute: "",
});

/*
|--------------------------------------------------------------------------
| Estado principal
|--------------------------------------------------------------------------
*/
const cards = ref([]);
const currentPage = ref(1);
const isLoading = ref(false);
const errorMessage = ref("");
const failedImageIds = ref([]);

/*
|--------------------------------------------------------------------------
| Caché
|--------------------------------------------------------------------------
| Cada combinación de página, búsqueda, tipo y atributo utiliza una clave
| independiente.
|--------------------------------------------------------------------------
*/
const pageCache = new Map();

/*
|--------------------------------------------------------------------------
| Paginación
|--------------------------------------------------------------------------
*/
const pagination = reactive({
  currentRows: 0,
  totalRows: 0,
  totalPages: 0,
  rowsRemaining: 0,
  pagesRemaining: 0,
  nextPage: null,
  nextPageOffset: null,
});

/*
|--------------------------------------------------------------------------
| Deshabilitar atributo
|--------------------------------------------------------------------------
| Las cartas mágicas y de trampa no utilizan atributos de monstruo.
|--------------------------------------------------------------------------
*/
const isAttributeDisabled = computed(() => {
  return [
    "Spell Card",
    "Trap Card",
  ].includes(selectedType.value);
});

/*
|--------------------------------------------------------------------------
| Comprobar criterios activos
|--------------------------------------------------------------------------
*/
const hasActiveCriteria = computed(() => {
  return Boolean(
    criteria.search ||
    criteria.type ||
    criteria.attribute,
  );
});

/*
|--------------------------------------------------------------------------
| Rango visible
|--------------------------------------------------------------------------
*/
const firstVisibleItem = computed(() => {
  if (
    pagination.totalRows === 0 ||
    cards.value.length === 0
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
  if (
    pagination.totalRows === 0 ||
    cards.value.length === 0
  ) {
    return 0;
  }

  return Math.min(
    firstVisibleItem.value +
      cards.value.length -
      1,
    pagination.totalRows,
  );
});

/*
|--------------------------------------------------------------------------
| Observar tipo seleccionado
|--------------------------------------------------------------------------
| Si se selecciona una carta mágica o de trampa, se limpia el atributo.
|--------------------------------------------------------------------------
*/
watch(
  selectedType,
  () => {
    if (isAttributeDisabled.value) {
      selectedAttribute.value = "";
    }
  },
);

/*
|--------------------------------------------------------------------------
| Crear clave de caché
|--------------------------------------------------------------------------
*/
const createCacheKey = (page) => {
  return JSON.stringify({
    page,
    search: criteria.search,
    type: criteria.type,
    attribute: criteria.attribute,
  });
};

/*
|--------------------------------------------------------------------------
| Aplicar respuesta
|--------------------------------------------------------------------------
*/
const applyResponse = (
  page,
  response,
) => {
  cards.value = response.cards;
  currentPage.value = page;

  pagination.currentRows =
    response.meta.currentRows;

  pagination.totalRows =
    response.meta.totalRows;

  pagination.totalPages =
    response.meta.totalPages;

  pagination.rowsRemaining =
    response.meta.rowsRemaining;

  pagination.pagesRemaining =
    response.meta.pagesRemaining;

  pagination.nextPage =
    response.meta.nextPage;

  pagination.nextPageOffset =
    response.meta.nextPageOffset;

  failedImageIds.value = [];
};

/*
|--------------------------------------------------------------------------
| Limpiar resultados
|--------------------------------------------------------------------------
*/
const clearPagination = () => {
  pagination.currentRows = 0;
  pagination.totalRows = 0;
  pagination.totalPages = 0;
  pagination.rowsRemaining = 0;
  pagination.pagesRemaining = 0;
  pagination.nextPage = null;
  pagination.nextPageOffset = null;
};

/*
|--------------------------------------------------------------------------
| Cargar cartas
|--------------------------------------------------------------------------
*/
const loadCards = async (
  page = 1,
  {
    force = false,
  } = {},
) => {
  if (isLoading.value) {
    return;
  }

  const normalizedPage =
    Number(page);

  if (
    !Number.isInteger(
      normalizedPage,
    ) ||
    normalizedPage < 1
  ) {
    return;
  }

  const cacheKey =
    createCacheKey(
      normalizedPage,
    );

  /*
  |--------------------------------------------------------------------------
  | Recuperar desde caché
  |--------------------------------------------------------------------------
  */
  if (
    !force &&
    pageCache.has(cacheKey)
  ) {
    errorMessage.value = "";

    applyResponse(
      normalizedPage,
      pageCache.get(cacheKey),
    );

    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  currentPage.value =
    normalizedPage;

  const offset =
    (normalizedPage - 1) *
    ITEMS_PER_PAGE;

  try {
    const response =
      await getYugiohCards({
        numberOfCards:
          ITEMS_PER_PAGE,

        offset,

        format: "tcg",

        search:
          criteria.search,

        type:
          criteria.type,

        attribute:
          criteria.attribute,
      });

    pageCache.set(
      cacheKey,
      response,
    );

    applyResponse(
      normalizedPage,
      response,
    );
  } catch (error) {
    cards.value = [];
    clearPagination();

    errorMessage.value =
      getErrorMessage(
        error,
        "No fue posible consultar las cartas.",
      );
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Aplicar búsqueda y filtros
|--------------------------------------------------------------------------
| El offset se reinicia porque toda nueva consulta comienza en la página 1.
|--------------------------------------------------------------------------
*/
const applyCriteria = async () => {
  criteria.search =
    searchTerm.value.trim();

  criteria.type =
    selectedType.value;

  criteria.attribute =
    isAttributeDisabled.value
      ? ""
      : selectedAttribute.value;

  currentPage.value = 1;

  await loadCards(1);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/*
|--------------------------------------------------------------------------
| Limpiar solamente el nombre
|--------------------------------------------------------------------------
| SearchInput actualiza primero el v-model y luego emite clear.
|--------------------------------------------------------------------------
*/
const clearNameSearch = async () => {
  searchTerm.value = "";
  criteria.search = "";

  currentPage.value = 1;

  await loadCards(1);
};

/*
|--------------------------------------------------------------------------
| Restablecer todos los criterios
|--------------------------------------------------------------------------
*/
const resetCriteria = async () => {
  searchTerm.value = "";
  selectedType.value = "";
  selectedAttribute.value = "";

  criteria.search = "";
  criteria.type = "";
  criteria.attribute = "";

  currentPage.value = 1;

  await loadCards(1);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/*
|--------------------------------------------------------------------------
| Cambiar página
|--------------------------------------------------------------------------
*/
const changePage = async (page) => {
  if (
    isLoading.value ||
    page === currentPage.value ||
    page < 1 ||
    page > pagination.totalPages
  ) {
    return;
  }

  await loadCards(page);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/*
|--------------------------------------------------------------------------
| Reintentar consulta
|--------------------------------------------------------------------------
*/
const retryCurrentPage = () => {
  const cacheKey =
    createCacheKey(
      currentPage.value,
    );

  pageCache.delete(cacheKey);

  loadCards(
    currentPage.value,
    {
      force: true,
    },
  );
};

/*
|--------------------------------------------------------------------------
| Imágenes
|--------------------------------------------------------------------------
*/
const hasImageFailed = (
  cardId,
) => {
  return failedImageIds.value.includes(
    cardId,
  );
};

const handleImageError = (
  cardId,
) => {
  if (hasImageFailed(cardId)) {
    return;
  }

  failedImageIds.value = [
    ...failedImageIds.value,
    cardId,
  ];
};

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
| Carga inicial
|--------------------------------------------------------------------------
*/
onMounted(() => {
  loadCards(1);
});
</script>

<template>
  <section class="page-section">
    <!-- Encabezado -->

    <header class="page-header">
      <p
        class="small fw-semibold text-uppercase text-primary mb-2"
      >
        YGOPRODeck API v7
      </p>

      <h1 class="page-title">
        Cartas de Yu-Gi-Oh!
      </h1>

      <p class="page-description">
        Busca cartas por nombre, aplica filtros y consulta
        la información completa de cada carta.
      </p>
    </header>

    <!-- Búsqueda y filtros -->

    <div class="content-panel mb-4">
      <SearchInput
        v-model="searchTerm"
        input-id="yugioh-search"
        label="Buscar carta por nombre"
        placeholder="Ejemplo: Dark Magician"
        show-search-button
        :disabled="isLoading"
        @search="applyCriteria"
        @clear="clearNameSearch"
      />

      <div class="row g-3 mt-2">
        <div class="col-12 col-md-6">
          <label
            for="yugioh-type"
            class="form-label fw-semibold"
          >
            Tipo de carta
          </label>

          <select
            id="yugioh-type"
            v-model="selectedType"
            class="form-select"
            :disabled="isLoading"
          >
            <option
              v-for="option in cardTypeOptions"
              :key="
                option.value ||
                'all-types'
              "
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-6">
          <label
            for="yugioh-attribute"
            class="form-label fw-semibold"
          >
            Atributo
          </label>

          <select
            id="yugioh-attribute"
            v-model="selectedAttribute"
            class="form-select"
            :disabled="
              isLoading ||
              isAttributeDisabled
            "
          >
            <option
              v-for="option in attributeOptions"
              :key="
                option.value ||
                'all-attributes'
              "
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <p
            v-if="isAttributeDisabled"
            class="small text-secondary mt-1 mb-0"
          >
            Las cartas mágicas y de trampa no utilizan
            atributos de monstruo.
          </p>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          class="btn btn-primary"
          :disabled="isLoading"
          @click="applyCriteria"
        >
          <i
            class="bi bi-funnel me-2"
            aria-hidden="true"
          ></i>

          Aplicar búsqueda y filtros
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="
            isLoading ||
            (
              !searchTerm &&
              !selectedType &&
              !selectedAttribute &&
              !hasActiveCriteria
            )
          "
          @click="resetCriteria"
        >
          <i
            class="bi bi-arrow-counterclockwise me-2"
            aria-hidden="true"
          ></i>

          Restablecer
        </button>
      </div>

      <div
        v-if="hasActiveCriteria"
        class="d-flex flex-wrap gap-2 mt-3"
      >
        <span
          v-if="criteria.search"
          class="badge text-bg-primary"
        >
          Nombre: {{ criteria.search }}
        </span>

        <span
          v-if="criteria.type"
          class="badge text-bg-secondary"
        >
          Tipo: {{ criteria.type }}
        </span>

        <span
          v-if="criteria.attribute"
          class="badge text-bg-dark"
        >
          Atributo:
          {{ criteria.attribute }}
        </span>
      </div>
    </div>

    <!-- Resumen -->

    <div
      v-if="
        !isLoading &&
        !errorMessage &&
        pagination.totalRows > 0
      "
      class="content-panel mb-4"
    >
      <div
        class="d-flex flex-column flex-md-row justify-content-between gap-2"
      >
        <p class="mb-0">
          <strong>
            {{ pagination.totalRows }}
          </strong>

          cartas encontradas
        </p>

        <p class="text-secondary mb-0">
          Página

          <strong>
            {{ currentPage }}
          </strong>

          de

          <strong>
            {{ pagination.totalPages }}
          </strong>
        </p>
      </div>

      <p class="small text-secondary mt-2 mb-0">
        Mostrando las cartas

        <strong>
          {{ firstVisibleItem }}
        </strong>

        a

        <strong>
          {{ lastVisibleItem }}
        </strong>
      </p>
    </div>

    <!-- Error -->

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
            No fue posible consultar las cartas
          </h2>

          <p class="mb-0">
            {{ errorMessage }}
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline-danger"
          @click="retryCurrentPage"
        >
          <i
            class="bi bi-arrow-clockwise me-2"
            aria-hidden="true"
          ></i>

          Reintentar
        </button>
      </div>
    </div>

    <!-- Cargando -->

    <LoadingSpinner
      v-else-if="isLoading"
      message="Consultando cartas de Yu-Gi-Oh!..."
    />

    <!-- Resultados vacíos -->

    <EmptyResults
      v-else-if="cards.length === 0"
      title="No se encontraron cartas"
      description="Prueba con otro nombre o cambia los filtros seleccionados."
      icon="bi-card-image"
    />

    <!-- Listado -->

    <template v-else>
      <div
        class="row g-4"
        aria-live="polite"
      >
        <div
          v-for="card in cards"
          :key="card.id"
          class="col-12 col-sm-6 col-lg-4 col-xl-3"
        >
          <article class="resource-card">
            <div
              class="resource-card__image-container"
            >
              <img
                v-if="
                  card.imageSmallUrl &&
                  !hasImageFailed(card.id)
                "
                class="resource-card__image"
                :src="card.imageSmallUrl"
                :alt="`Carta ${card.name}`"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="
                  handleImageError(card.id)
                "
              />

              <div
                v-else
                class="text-center text-secondary p-3"
              >
                <i
                  class="bi bi-card-image display-4"
                  aria-hidden="true"
                ></i>

                <p class="small mt-2 mb-0">
                  Imagen no disponible
                </p>
              </div>
            </div>

            <div class="resource-card__body">
              <p
                class="small fw-semibold text-uppercase text-primary mb-2"
              >
                Carta #{{ card.id }}
              </p>

              <h2 class="resource-card__title">
                {{ card.name }}
              </h2>

              <div class="mb-3">
                <span
                  class="badge"
                  :class="
                    getCardTypeClass(
                      card.originalType,
                    )
                  "
                >
                  {{ card.type }}
                </span>
              </div>

              <p
                v-if="card.race"
                class="small text-secondary mb-2"
              >
                Tipo o raza:

                <strong class="text-body">
                  {{ card.race }}
                </strong>
              </p>

              <p
                v-if="card.attribute"
                class="small text-secondary mb-2"
              >
                Atributo:

                <strong class="text-body">
                  {{ card.attribute }}
                </strong>
              </p>

              <p
                v-if="card.archetype"
                class="small text-secondary mb-3"
              >
                Arquetipo:

                <strong class="text-body">
                  {{ card.archetype }}
                </strong>
              </p>

              <p
                v-if="card.description"
                class="text-secondary small line-clamp-3 flex-grow-1"
              >
                {{ card.description }}
              </p>

              <div
                v-if="
                  hasValue(card.atk) ||
                  hasValue(card.def) ||
                  hasValue(card.level)
                "
                class="row g-2 mt-2"
              >
                <div
                  v-if="hasValue(card.atk)"
                  class="col"
                >
                  <div
                    class="border rounded text-center p-2"
                  >
                    <p
                      class="small text-secondary mb-1"
                    >
                      ATK
                    </p>

                    <p class="fw-semibold mb-0">
                      {{ card.atk }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="hasValue(card.def)"
                  class="col"
                >
                  <div
                    class="border rounded text-center p-2"
                  >
                    <p
                      class="small text-secondary mb-1"
                    >
                      DEF
                    </p>

                    <p class="fw-semibold mb-0">
                      {{ card.def }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="hasValue(card.level)"
                  class="col"
                >
                  <div
                    class="border rounded text-center p-2"
                  >
                    <p
                      class="small text-secondary mb-1"
                    >
                      Nivel
                    </p>

                    <p class="fw-semibold mb-0">
                      {{ card.level }}
                    </p>
                  </div>
                </div>
              </div>

              <RouterLink
                :to="{
                  name: 'yugioh-detail',
                  params: {
                    id: card.id,
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

      <AppPagination
        :current-page="currentPage"
        :total-pages="
          pagination.totalPages
        "
        :disabled="isLoading"
        @change="changePage"
      />
    </template>
  </section>
</template>