import api from "./api";

/*
|--------------------------------------------------------------------------
| Configuración de PokéAPI
|--------------------------------------------------------------------------
*/
const POKEMON_API_URL =
  "https://pokeapi.co/api/v2";

const POKEMON_SPRITES_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/*
|--------------------------------------------------------------------------
| Normalizar límite
|--------------------------------------------------------------------------
*/
const normalizeLimit = (limit) => {
  const parsedLimit = Number(limit);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1
  ) {
    return 20;
  }

  return parsedLimit;
};

/*
|--------------------------------------------------------------------------
| Normalizar desplazamiento
|--------------------------------------------------------------------------
*/
const normalizeOffset = (offset) => {
  const parsedOffset = Number(offset);

  if (
    !Number.isInteger(parsedOffset) ||
    parsedOffset < 0
  ) {
    return 0;
  }

  return parsedOffset;
};

/*
|--------------------------------------------------------------------------
| Normalizar identificador
|--------------------------------------------------------------------------
| PokéAPI permite consultar un Pokémon mediante ID o nombre.
|--------------------------------------------------------------------------
*/
const normalizePokemonIdentifier = (
  identifier,
) => {
  const normalizedIdentifier =
    String(identifier)
      .trim()
      .toLowerCase();

  if (!normalizedIdentifier) {
    throw new Error(
      "No se recibió el nombre del Pokémon.",
    );
  }

  if (
    !/^[a-z0-9-]+$/.test(
      normalizedIdentifier,
    )
  ) {
    throw new Error(
      "El nombre del Pokémon no es válido.",
    );
  }

  return normalizedIdentifier;
};

/*
|--------------------------------------------------------------------------
| Obtener identificador desde la URL
|--------------------------------------------------------------------------
*/
export const getPokemonIdFromUrl = (
  pokemonUrl,
) => {
  if (
    typeof pokemonUrl !== "string" ||
    !pokemonUrl.trim()
  ) {
    return null;
  }

  const match = pokemonUrl.match(
    /\/pokemon\/(\d+)\/?$/,
  );

  if (!match) {
    return null;
  }

  const pokemonId = Number(match[1]);

  if (
    !Number.isInteger(pokemonId) ||
    pokemonId < 1
  ) {
    return null;
  }

  return pokemonId;
};

/*
|--------------------------------------------------------------------------
| Construir imagen básica
|--------------------------------------------------------------------------
| Esta imagen se utiliza en el catálogo y como fallback en el detalle.
|--------------------------------------------------------------------------
*/
export const getPokemonImageUrl = (
  pokemonId,
) => {
  const normalizedId =
    Number(pokemonId);

  if (
    !Number.isInteger(normalizedId) ||
    normalizedId < 1
  ) {
    return null;
  }

  return `${POKEMON_SPRITES_URL}/${normalizedId}.png`;
};

/*
|--------------------------------------------------------------------------
| Obtener catálogo
|--------------------------------------------------------------------------
*/
export const getPokemonList = async ({
  limit = 151,
  offset = 0,
} = {}) => {
  const normalizedLimit =
    normalizeLimit(limit);

  const normalizedOffset =
    normalizeOffset(offset);

  const response = await api.get(
    `${POKEMON_API_URL}/pokemon`,
    {
      params: {
        limit: normalizedLimit,
        offset: normalizedOffset,
      },
    },
  );

  const data = response.data;

  if (
    !data ||
    !Array.isArray(data.results)
  ) {
    throw new Error(
      "PokéAPI devolvió una respuesta inválida.",
    );
  }

  const results = data.results.map(
    (pokemon, index) => {
      const pokemonId =
        getPokemonIdFromUrl(
          pokemon.url,
        ) ??
        normalizedOffset +
          index +
          1;

      return {
        id: pokemonId,
        name: pokemon.name,
        url: pokemon.url,
        imageUrl:
          getPokemonImageUrl(
            pokemonId,
          ),
      };
    },
  );

  return {
    count: Number(data.count) || 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results,
  };
};

/*
|--------------------------------------------------------------------------
| Obtener Pokémon por nombre o ID
|--------------------------------------------------------------------------
*/
export const getPokemonByName = async (
  identifier,
) => {
  const normalizedIdentifier =
    normalizePokemonIdentifier(
      identifier,
    );

  const response = await api.get(
    `${POKEMON_API_URL}/pokemon/${normalizedIdentifier}`,
  );

  const data = response.data;

  /*
  |--------------------------------------------------------------------------
  | Validar respuesta
  |--------------------------------------------------------------------------
  */
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    !data.id ||
    !data.name
  ) {
    throw new Error(
      "PokéAPI devolvió un Pokémon inválido.",
    );
  }

  return data;
};