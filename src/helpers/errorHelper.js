import axios from "axios";

/*
|--------------------------------------------------------------------------
| Mensajes predeterminados
|--------------------------------------------------------------------------
| Centralizar estos mensajes evita repetir textos diferentes en cada vista.
|--------------------------------------------------------------------------
*/
const DEFAULT_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Inténtalo nuevamente.";

const NETWORK_ERROR_MESSAGE =
  "No fue posible conectar con el servicio. Revisa tu conexión a internet.";

const TIMEOUT_ERROR_MESSAGE =
  "La solicitud tardó demasiado tiempo. Inténtalo nuevamente.";

/*
|--------------------------------------------------------------------------
| Mensajes por código HTTP
|--------------------------------------------------------------------------
| Cada código conocido se transforma en un mensaje comprensible para
| el usuario.
|--------------------------------------------------------------------------
*/
const statusMessages = {
  400: "La solicitud enviada no es válida.",
  401: "No tienes autorización para realizar esta solicitud.",
  403: "El acceso al recurso fue rechazado.",
  404: "El recurso solicitado no fue encontrado.",
  408: "La solicitud tardó demasiado tiempo.",
  429: "Se realizaron demasiadas solicitudes. Espera un momento.",
  500: "El servicio presentó un error interno.",
  502: "El servicio no está disponible temporalmente.",
  503: "El servicio se encuentra temporalmente fuera de servicio.",
  504: "El servicio tardó demasiado tiempo en responder.",
};

/*
|--------------------------------------------------------------------------
| Obtener mensaje enviado por una API
|--------------------------------------------------------------------------
| Algunas APIs incluyen mensajes propios dentro de response.data.
|--------------------------------------------------------------------------
*/
const getApiMessage = (data) => {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  if (
    typeof data.error === "string" &&
    data.error.trim()
  ) {
    return data.error;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Transformar un error
|--------------------------------------------------------------------------
| Recibe cualquier error y devuelve siempre un texto seguro para mostrar
| dentro de una alerta de Bootstrap o SweetAlert2.
|--------------------------------------------------------------------------
*/
export const getErrorMessage = (
  error,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) => {
  /*
  |--------------------------------------------------------------------------
  | Error cancelado
  |--------------------------------------------------------------------------
  | Una solicitud cancelada intencionalmente no representa un problema
  | de conexión.
  |--------------------------------------------------------------------------
  */
  if (
    error?.code === "ERR_CANCELED" ||
    axios.isCancel(error)
  ) {
    return "La solicitud fue cancelada.";
  }

  /*
  |--------------------------------------------------------------------------
  | Error que no pertenece a Axios
  |--------------------------------------------------------------------------
  */
  if (!axios.isAxiosError(error)) {
    if (
      typeof error?.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    return fallbackMessage;
  }

  /*
  |--------------------------------------------------------------------------
  | Timeout
  |--------------------------------------------------------------------------
  */
  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return TIMEOUT_ERROR_MESSAGE;
  }

  /*
  |--------------------------------------------------------------------------
  | Sin respuesta
  |--------------------------------------------------------------------------
  | Axios creó la solicitud, pero no recibió respuesta del servidor.
  |--------------------------------------------------------------------------
  */
  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  /*
  |--------------------------------------------------------------------------
  | Respuesta entregada por la API
  |--------------------------------------------------------------------------
  */
  const apiMessage = getApiMessage(
    error.response.data,
  );

  if (apiMessage) {
    return apiMessage;
  }

  /*
  |--------------------------------------------------------------------------
  | Mensaje según código HTTP
  |--------------------------------------------------------------------------
  */
  return (
    statusMessages[error.response.status] ??
    fallbackMessage
  );
};

export default getErrorMessage;