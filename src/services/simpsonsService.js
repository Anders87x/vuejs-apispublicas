import api from "./api";

/*
|--------------------------------------------------------------------------
| Configuración de The Simpsons API
|--------------------------------------------------------------------------
| Los datos se obtienen desde la API principal y las imágenes se sirven
| mediante un CDN independiente.
|--------------------------------------------------------------------------
*/
const SIMPSONS_API_URL =
  "https://thesimpsonsapi.com/api";

const SIMPSONS_IMAGE_URL =
  "https://cdn.thesimpsonsapi.com/500";

/*
|--------------------------------------------------------------------------
| Normalizar número de página
|--------------------------------------------------------------------------
*/
const normalizePage = (page) => {
  const parsedPage = Number(page);

  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    return 1;
  }

  return parsedPage;
};

/*
|--------------------------------------------------------------------------
| Normalizar identificador
|--------------------------------------------------------------------------
| El detalle solamente acepta identificadores enteros positivos.
|--------------------------------------------------------------------------
*/
const normalizeCharacterId = (id) => {
  const normalizedId = String(id).trim();

  if (
    !/^\d+$/.test(normalizedId) ||
    Number(normalizedId) < 1
  ) {
    throw new Error(
      "El identificador del personaje no es válido.",
    );
  }

  return normalizedId;
};

/*
|--------------------------------------------------------------------------
| Obtener listado de personajes
|--------------------------------------------------------------------------
*/
export const getSimpsonsCharacters = async (
  page = 1,
) => {
  const normalizedPage =
    normalizePage(page);

  const response = await api.get(
    `${SIMPSONS_API_URL}/characters`,
    {
      params: {
        page: normalizedPage,
      },
    },
  );

  const data = response.data;

  /*
  |--------------------------------------------------------------------------
  | Validar estructura
  |--------------------------------------------------------------------------
  */
  if (
    !data ||
    !Array.isArray(data.results)
  ) {
    throw new Error(
      "The Simpsons API devolvió una respuesta inválida.",
    );
  }

  return {
    count: Number(data.count) || 0,
    pages: Number(data.pages) || 0,
    next: data.next ?? null,
    prev: data.prev ?? null,
    results: data.results,
  };
};

/*
|--------------------------------------------------------------------------
| Obtener personaje por identificador
|--------------------------------------------------------------------------
*/
export const getSimpsonsCharacterById =
  async (id) => {
    const normalizedId =
      normalizeCharacterId(id);

    const response = await api.get(
      `${SIMPSONS_API_URL}/characters/${normalizedId}`,
    );

    const data = response.data;

    /*
    |--------------------------------------------------------------------------
    | Validar respuesta individual
    |--------------------------------------------------------------------------
    */
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      !data.id
    ) {
      throw new Error(
        "The Simpsons API devolvió un personaje inválido.",
      );
    }

    return data;
  };

/*
|--------------------------------------------------------------------------
| Construir URL de imagen
|--------------------------------------------------------------------------
| Puede utilizarse con portrait_path, image_path y cualquier otra ruta
| relativa entregada por esta API.
|--------------------------------------------------------------------------
*/
export const getSimpsonsImageUrl = (
  imagePath,
) => {
  if (
    typeof imagePath !== "string" ||
    !imagePath.trim()
  ) {
    return null;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const normalizedPath =
    imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

  return `${SIMPSONS_IMAGE_URL}${normalizedPath}`;
};