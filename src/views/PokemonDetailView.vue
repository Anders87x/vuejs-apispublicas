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
  getPokemonByName,
  getPokemonImageUrl,
} from "../services/pokemonService";

/*
|--------------------------------------------------------------------------
| Parámetro dinámico
|--------------------------------------------------------------------------
*/
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

/*
|--------------------------------------------------------------------------
| Estado
|--------------------------------------------------------------------------
*/
const pokemon = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const hasImageFailed = ref(false);

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
| Imagen principal
|--------------------------------------------------------------------------
| Prioridad:
|
| 1. Official artwork.
| 2. Sprite frontal.
| 3. Imagen básica construida mediante el ID.
|--------------------------------------------------------------------------
*/
const pokemonImageUrl = computed(() => {
  if (!pokemon.value) {
    return null;
  }

  return (
    pokemon.value.sprites?.other?.[
      "official-artwork"
    ]?.front_default ??
    pokemon.value.sprites
      ?.front_default ??
    getPokemonImageUrl(
      pokemon.value.id,
    )
  );
});

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/
const pokemonTypes = computed(() => {
  if (
    !Array.isArray(
      pokemon.value?.types,
    )
  ) {
    return [];
  }

  return [...pokemon.value.types]
    .sort(
      (firstType, secondType) =>
        firstType.slot -
        secondType.slot,
    )
    .map((typeItem) => {
      return typeItem.type?.name;
    })
    .filter(Boolean);
});

/*
|--------------------------------------------------------------------------
| Habilidades
|--------------------------------------------------------------------------
*/
const pokemonAbilities = computed(() => {
  if (
    !Array.isArray(
      pokemon.value?.abilities,
    )
  ) {
    return [];
  }

  return [...pokemon.value.abilities]
    .sort(
      (
        firstAbility,
        secondAbility,
      ) =>
        firstAbility.slot -
        secondAbility.slot,
    )
    .map((abilityItem) => {
      return {
        name:
          abilityItem.ability?.name,
        isHidden:
          Boolean(
            abilityItem.is_hidden,
          ),
        slot: abilityItem.slot,
      };
    })
    .filter(
      (abilityItem) =>
        abilityItem.name,
    );
});

/*
|--------------------------------------------------------------------------
| Estadísticas
|--------------------------------------------------------------------------
*/
const pokemonStats = computed(() => {
  if (
    !Array.isArray(
      pokemon.value?.stats,
    )
  ) {
    return [];
  }

  return pokemon.value.stats.map(
    (statItem) => {
      return {
        name:
          statItem.stat?.name,
        value:
          Number(
            statItem.base_stat,
          ) || 0,
        effort:
          Number(
            statItem.effort,
          ) || 0,
      };
    },
  );
});

/*
|--------------------------------------------------------------------------
| Traducir nombres de estadísticas
|--------------------------------------------------------------------------
*/
const statNames = {
  hp: "Puntos de salud",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack":
    "Ataque especial",
  "special-defense":
    "Defensa especial",
  speed: "Velocidad",
};

const formatStatName = (name) => {
  return (
    statNames[name] ??
    formatPokemonName(name)
  );
};

/*
|--------------------------------------------------------------------------
| Formatear medidas
|--------------------------------------------------------------------------
| PokéAPI devuelve la altura en decímetros y el peso en hectogramos.
|--------------------------------------------------------------------------
*/
const formatHeight = (height) => {
  const numericHeight =
    Number(height);

  if (
    !Number.isFinite(
      numericHeight,
    )
  ) {
    return "No disponible";
  }

  const heightInMeters =
    numericHeight / 10;

  return `${heightInMeters.toLocaleString(
    "es-PE",
    {
      maximumFractionDigits: 1,
    },
  )} m`;
};

const formatWeight = (weight) => {
  const numericWeight =
    Number(weight);

  if (
    !Number.isFinite(
      numericWeight,
    )
  ) {
    return "No disponible";
  }

  const weightInKilograms =
    numericWeight / 10;

  return `${weightInKilograms.toLocaleString(
    "es-PE",
    {
      maximumFractionDigits: 1,
    },
  )} kg`;
};

/*
|--------------------------------------------------------------------------
| Clase Bootstrap según el tipo
|--------------------------------------------------------------------------
*/
const typeClasses = {
  normal: "text-bg-secondary",
  fire: "text-bg-danger",
  water: "text-bg-primary",
  electric: "text-bg-warning",
  grass: "text-bg-success",
  ice: "text-bg-info",
  fighting: "text-bg-danger",
  poison: "text-bg-dark",
  ground: "text-bg-warning",
  flying: "text-bg-info",
  psychic: "text-bg-danger",
  bug: "text-bg-success",
  rock: "text-bg-secondary",
  ghost: "text-bg-dark",
  dragon: "text-bg-primary",
  dark: "text-bg-dark",
  steel: "text-bg-secondary",
  fairy: "text-bg-danger",
};

const getTypeClass = (type) => {
  return (
    typeClasses[type] ??
    "text-bg-secondary"
  );
};

/*
|--------------------------------------------------------------------------
| Ancho visual de estadística
|--------------------------------------------------------------------------
| Se utiliza 255 como valor máximo de referencia visual.
|--------------------------------------------------------------------------
*/
const getStatWidth = (value) => {
  const numericValue =
    Number(value) || 0;

  const percentage =
    Math.min(
      Math.max(
        (numericValue / 255) *
          100,
        0,
      ),
      100,
    );

  return `${percentage}%`;
};

/*
|--------------------------------------------------------------------------
| Cargar Pokémon
|--------------------------------------------------------------------------
*/
const loadPokemon = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  pokemon.value = null;
  hasImageFailed.value = false;

  try {
    pokemon.value =
      await getPokemonByName(
        props.name,
      );
  } catch (error) {
    if (
      error?.response?.status === 404
    ) {
      errorMessage.value =
        "El Pokémon solicitado no fue encontrado.";
    } else {
      errorMessage.value =
        getErrorMessage(
          error,
          "No fue posible cargar el Pokémon.",
        );
    }
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Observar el nombre de la ruta
|--------------------------------------------------------------------------
*/
watch(
  () => props.name,
  () => {
    loadPokemon();
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
    | Regresar
    |--------------------------------------------------------------------------
    -->

    <div class="mb-4">
      <RouterLink
        :to="{ name: 'pokemon' }"
        class="btn btn-outline-secondary"
      >
        <i
          class="bi bi-arrow-left me-2"
          aria-hidden="true"
        ></i>

        Volver a Pokémon
      </RouterLink>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Cargando
    |--------------------------------------------------------------------------
    -->

    <LoadingSpinner
      v-if="isLoading"
      message="Cargando Pokémon..."
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
        Pokémon no disponible
      </h1>

      <p>
        {{ errorMessage }}
      </p>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-danger"
          @click="loadPokemon"
        >
          <i
            class="bi bi-arrow-clockwise me-2"
            aria-hidden="true"
          ></i>

          Reintentar
        </button>

        <RouterLink
          :to="{ name: 'pokemon' }"
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

    <template v-else-if="pokemon">
      <div class="detail-panel">
        <div class="row g-4 align-items-center">
          <!--
          |--------------------------------------------------------------------------
          | Imagen
          |--------------------------------------------------------------------------
          -->

          <div class="col-12 col-md-5">
            <div class="detail-image-container">
              <img
                v-if="
                  pokemonImageUrl &&
                  !hasImageFailed
                "
                class="detail-image"
                :src="pokemonImageUrl"
                :alt="
                  `Ilustración oficial de ${formatPokemonName(
                    pokemon.name,
                  )}`
                "
                @error="
                  hasImageFailed = true
                "
              />

              <div
                v-else
                class="text-center text-secondary p-4"
              >
                <i
                  class="bi bi-image display-3"
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
          | Información principal
          |--------------------------------------------------------------------------
          -->

          <div class="col-12 col-md-7">
            <p
              class="small fw-semibold text-uppercase text-primary mb-2"
            >
              Pokémon #{{ pokemon.id }}
            </p>

            <h1 class="page-title">
              {{
                formatPokemonName(
                  pokemon.name,
                )
              }}
            </h1>

            <div
              v-if="pokemonTypes.length > 0"
              class="d-flex flex-wrap gap-2 mb-4"
            >
              <span
                v-for="type in pokemonTypes"
                :key="type"
                class="badge fs-6"
                :class="
                  getTypeClass(type)
                "
              >
                {{
                  formatPokemonName(
                    type,
                  )
                }}
              </span>
            </div>

            <div class="row g-3">
              <div class="col-12 col-sm-4">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Altura
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      formatHeight(
                        pokemon.height,
                      )
                    }}
                  </p>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Peso
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      formatWeight(
                        pokemon.weight,
                      )
                    }}
                  </p>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="border rounded p-3 h-100">
                  <p
                    class="small text-secondary mb-1"
                  >
                    Experiencia base
                  </p>

                  <p class="fw-semibold mb-0">
                    {{
                      pokemon.base_experience ??
                      "No disponible"
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
      | Habilidades
      |--------------------------------------------------------------------------
      -->

      <div class="content-panel mt-4">
        <h2 class="h4 mb-3">
          Habilidades
        </h2>

        <div
          v-if="pokemonAbilities.length > 0"
          class="row g-3"
        >
          <div
            v-for="ability in pokemonAbilities"
            :key="
              `${ability.slot}-${ability.name}`
            "
            class="col-12 col-md-6"
          >
            <div
              class="border rounded p-3 h-100"
            >
              <div
                class="d-flex align-items-center justify-content-between gap-2"
              >
                <p class="fw-semibold mb-0">
                  {{
                    formatPokemonName(
                      ability.name,
                    )
                  }}
                </p>

                <span
                  v-if="ability.isHidden"
                  class="badge text-bg-dark"
                >
                  Oculta
                </span>
              </div>
            </div>
          </div>
        </div>

        <p
          v-else
          class="text-secondary mb-0"
        >
          No existen habilidades disponibles.
        </p>
      </div>

      <!--
      |--------------------------------------------------------------------------
      | Estadísticas
      |--------------------------------------------------------------------------
      -->

      <div class="content-panel mt-4">
        <h2 class="h4 mb-4">
          Estadísticas base
        </h2>

        <div
          v-if="pokemonStats.length > 0"
          class="d-flex flex-column gap-4"
        >
          <div
            v-for="stat in pokemonStats"
            :key="stat.name"
          >
            <div
              class="d-flex justify-content-between gap-3 mb-2"
            >
              <span class="fw-semibold">
                {{
                  formatStatName(
                    stat.name,
                  )
                }}
              </span>

              <span class="text-secondary">
                {{ stat.value }}
              </span>
            </div>

            <div
              class="progress"
              role="progressbar"
              :aria-label="
                formatStatName(stat.name)
              "
              :aria-valuenow="stat.value"
              aria-valuemin="0"
              aria-valuemax="255"
            >
              <div
                class="progress-bar"
                :style="{
                  width:
                    getStatWidth(
                      stat.value,
                    ),
                }"
              ></div>
            </div>
          </div>
        </div>

        <p
          v-else
          class="text-secondary mb-0"
        >
          No existen estadísticas disponibles.
        </p>
      </div>
    </template>
  </section>
</template>