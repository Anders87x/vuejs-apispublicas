import api from "./api";

/*
|--------------------------------------------------------------------------
| Configuración de YGOPRODeck
|--------------------------------------------------------------------------
| cardinfo.php permite consultar, buscar y filtrar las cartas.
|--------------------------------------------------------------------------
*/
const YUGIOH_API_URL =
  "https://db.ygoprodeck.com/api/v7/cardinfo.php";

/*
|--------------------------------------------------------------------------
| Normalizar cantidad de registros
|--------------------------------------------------------------------------
*/
const normalizeNumberOfCards = (
  numberOfCards,
) => {
  const parsedNumber =
    Number(numberOfCards);

  if (
    !Number.isInteger(parsedNumber) ||
    parsedNumber < 1
  ) {
    return 12;
  }

  return parsedNumber;
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
| Normalizar texto
|--------------------------------------------------------------------------
*/
const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

/*
|--------------------------------------------------------------------------
| Normalizar identificador
|--------------------------------------------------------------------------
*/
const normalizeCardId = (id) => {
  const normalizedId =
    String(id).trim();

  if (
    !/^\d+$/.test(normalizedId) ||
    Number(normalizedId) < 1
  ) {
    throw new Error(
      "El identificador de la carta no es válido.",
    );
  }

  return normalizedId;
};

/*
|--------------------------------------------------------------------------
| Convertir valor numérico
|--------------------------------------------------------------------------
| Los campos inexistentes se convierten en null.
|
| Un valor igual a cero sigue siendo válido.
|--------------------------------------------------------------------------
*/
const toNullableNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
};

/*
|--------------------------------------------------------------------------
| Normalizar imágenes
|--------------------------------------------------------------------------
*/
const normalizeCardImages = (
  cardImages,
) => {
  if (!Array.isArray(cardImages)) {
    return [];
  }

  return cardImages
    .map((image) => {
      return {
        id:
          toNullableNumber(
            image?.id,
          ),

        imageUrl:
          image?.image_url ?? null,

        imageSmallUrl:
          image?.image_url_small ??
          image?.image_url ??
          null,

        imageCroppedUrl:
          image?.image_url_cropped ??
          null,
      };
    })
    .filter((image) => {
      return (
        image.imageUrl ||
        image.imageSmallUrl
      );
    });
};

/*
|--------------------------------------------------------------------------
| Normalizar sets
|--------------------------------------------------------------------------
*/
const normalizeCardSets = (
  cardSets,
) => {
  if (!Array.isArray(cardSets)) {
    return [];
  }

  return cardSets.map((cardSet) => {
    return {
      name:
        cardSet?.set_name ??
        "Set desconocido",

      code:
        cardSet?.set_code ??
        null,

      rarity:
        cardSet?.set_rarity ??
        null,

      rarityCode:
        cardSet?.set_rarity_code ??
        null,

      price:
        cardSet?.set_price ??
        null,
    };
  });
};

/*
|--------------------------------------------------------------------------
| Normalizar precios
|--------------------------------------------------------------------------
*/
const normalizeCardPrices = (
  cardPrices,
) => {
  if (
    !Array.isArray(cardPrices) ||
    cardPrices.length === 0
  ) {
    return null;
  }

  const prices = cardPrices[0];

  return {
    cardmarket:
      prices?.cardmarket_price ??
      null,

    tcgplayer:
      prices?.tcgplayer_price ??
      null,

    ebay:
      prices?.ebay_price ??
      null,

    amazon:
      prices?.amazon_price ??
      null,

    coolstuffinc:
      prices?.coolstuffinc_price ??
      null,
  };
};

/*
|--------------------------------------------------------------------------
| Normalizar una carta
|--------------------------------------------------------------------------
| Esta función se comparte entre el listado y la vista de detalle.
|--------------------------------------------------------------------------
*/
const normalizeCard = (card) => {
  const cardImages =
    normalizeCardImages(
      card?.card_images,
    );

  const primaryImage =
    cardImages[0] ?? null;

  return {
    id:
      toNullableNumber(card?.id),

    name:
      typeof card?.name === "string" &&
      card.name.trim()
        ? card.name
        : "Carta sin nombre",

    type:
      card?.humanReadableCardType ||
      card?.type ||
      "Tipo no disponible",

    originalType:
      card?.type ?? null,

    frameType:
      card?.frameType ?? null,

    description:
      typeof card?.desc === "string"
        ? card.desc
        : "",

    race:
      card?.race ?? null,

    attribute:
      card?.attribute ?? null,

    archetype:
      card?.archetype ?? null,

    atk:
      toNullableNumber(card?.atk),

    def:
      toNullableNumber(card?.def),

    level:
      toNullableNumber(card?.level),

    scale:
      toNullableNumber(card?.scale),

    linkValue:
      toNullableNumber(card?.linkval),

    linkMarkers:
      Array.isArray(card?.linkmarkers)
        ? card.linkmarkers
        : [],

    imageUrl:
      primaryImage?.imageUrl ??
      null,

    imageSmallUrl:
      primaryImage?.imageSmallUrl ??
      null,

    imageCroppedUrl:
      primaryImage?.imageCroppedUrl ??
      null,

    cardImages,

    cardSets:
      normalizeCardSets(
        card?.card_sets,
      ),

    cardPrices:
      normalizeCardPrices(
        card?.card_prices,
      ),

    banlistInfo:
      card?.banlist_info ?? null,

    miscInfo:
      Array.isArray(card?.misc_info)
        ? card.misc_info
        : [],
  };
};

/*
|--------------------------------------------------------------------------
| Detectar respuesta sin coincidencias
|--------------------------------------------------------------------------
| YGOPRODeck puede responder con estado 400 cuando una búsqueda válida no
| encuentra ninguna carta.
|
| En ese caso devolvemos una lista vacía en lugar de mostrar un error.
|--------------------------------------------------------------------------
*/
const isNoResultsError = (error) => {
  const apiMessage =
    error?.response?.data?.error;

  return (
    error?.response?.status === 400 &&
    typeof apiMessage === "string" &&
    /no card matching/i.test(
      apiMessage,
    )
  );
};

/*
|--------------------------------------------------------------------------
| Crear respuesta vacía
|--------------------------------------------------------------------------
*/
const createEmptyResponse = () => {
  return {
    cards: [],

    meta: {
      currentRows: 0,
      totalRows: 0,
      totalPages: 0,
      rowsRemaining: 0,
      pagesRemaining: 0,
      nextPage: null,
      nextPageOffset: null,
    },
  };
};

/*
|--------------------------------------------------------------------------
| Obtener listado, búsqueda y filtros
|--------------------------------------------------------------------------
*/
export const getYugiohCards = async ({
  numberOfCards = 12,
  offset = 0,
  format = "tcg",
  search = "",
  type = "",
  attribute = "",
} = {}) => {
  const normalizedNumberOfCards =
    normalizeNumberOfCards(
      numberOfCards,
    );

  const normalizedOffset =
    normalizeOffset(offset);

  const normalizedSearch =
    normalizeText(search);

  const normalizedType =
    normalizeText(type);

  const normalizedAttribute =
    normalizeText(attribute);

  /*
  |--------------------------------------------------------------------------
  | Parámetros iniciales
  |--------------------------------------------------------------------------
  */
  const params = {
    num: normalizedNumberOfCards,
    offset: normalizedOffset,
  };

  if (normalizeText(format)) {
    params.format =
      normalizeText(format);
  }

  /*
  |--------------------------------------------------------------------------
  | Búsqueda aproximada
  |--------------------------------------------------------------------------
  */
  if (normalizedSearch) {
    params.fname =
      normalizedSearch;
  }

  /*
  |--------------------------------------------------------------------------
  | Filtros opcionales
  |--------------------------------------------------------------------------
  */
  if (normalizedType) {
    params.type =
      normalizedType;
  }

  if (normalizedAttribute) {
    params.attribute =
      normalizedAttribute;
  }

  try {
    const response = await api.get(
      YUGIOH_API_URL,
      {
        params,
      },
    );

    const responseData =
      response.data;

    if (
      !responseData ||
      !Array.isArray(
        responseData.data,
      )
    ) {
      throw new Error(
        "YGOPRODeck devolvió una respuesta inválida.",
      );
    }

    const cards =
      responseData.data
        .map(normalizeCard)
        .filter((card) => card.id);

    const metadata =
      responseData.meta ?? {};

    const totalRows =
      toNullableNumber(
        metadata.total_rows,
      ) ?? cards.length;

    const totalPages =
      toNullableNumber(
        metadata.total_pages,
      ) ??
      (
        totalRows > 0
          ? Math.ceil(
              totalRows /
                normalizedNumberOfCards,
            )
          : 0
      );

    return {
      cards,

      meta: {
        currentRows:
          toNullableNumber(
            metadata.current_rows,
          ) ?? cards.length,

        totalRows,
        totalPages,

        rowsRemaining:
          toNullableNumber(
            metadata.rows_remaining,
          ) ?? 0,

        pagesRemaining:
          toNullableNumber(
            metadata.pages_remaining,
          ) ?? 0,

        nextPage:
          metadata.next_page ?? null,

        nextPageOffset:
          toNullableNumber(
            metadata.next_page_offset,
          ),
      },
    };
  } catch (error) {
    if (isNoResultsError(error)) {
      return createEmptyResponse();
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Obtener carta por ID
|--------------------------------------------------------------------------
*/
export const getYugiohCardById =
  async (id) => {
    const normalizedId =
      normalizeCardId(id);

    const response = await api.get(
      YUGIOH_API_URL,
      {
        params: {
          id: normalizedId,
        },
      },
    );

    const responseData =
      response.data;

    if (
      !responseData ||
      !Array.isArray(
        responseData.data,
      ) ||
      responseData.data.length === 0
    ) {
      throw new Error(
        "YGOPRODeck devolvió una carta inválida.",
      );
    }

    const card = normalizeCard(
      responseData.data[0],
    );

    if (!card.id) {
      throw new Error(
        "YGOPRODeck devolvió una carta inválida.",
      );
    }

    return card;
  };