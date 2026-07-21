import axios from "axios";

/*
|--------------------------------------------------------------------------
| Cliente HTTP principal
|--------------------------------------------------------------------------
| Esta instancia centraliza la configuración compartida por las tres APIs.
|
| No se define una baseURL porque The Simpsons API, PokéAPI y YGOPRODeck
| utilizan dominios diferentes.
|--------------------------------------------------------------------------
*/
const api = axios.create({
  timeout: 15000,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Interceptor de respuestas
|--------------------------------------------------------------------------
| Las respuestas correctas continúan normalmente.
|
| Los errores se rechazan para que cada servicio o vista pueda capturarlos
| mediante try/catch y transformarlos con errorHelper.js.
|--------------------------------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,

  (error) => {
    return Promise.reject(error);
  },
);

export default api;
