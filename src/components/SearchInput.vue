<script setup>
/*
|--------------------------------------------------------------------------
| Propiedades
|--------------------------------------------------------------------------
| modelValue permite utilizar el componente mediante v-model.
|--------------------------------------------------------------------------
*/
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },

  label: {
    type: String,
    default: "Buscar",
  },

  placeholder: {
    type: String,
    default: "Escribe un término de búsqueda",
  },

  inputId: {
    type: String,
    default: "search-input",
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  showSearchButton: {
    type: Boolean,
    default: false,
  },
});

/*
|--------------------------------------------------------------------------
| Eventos
|--------------------------------------------------------------------------
| update:modelValue actualiza el v-model del componente padre.
|
| search permite ejecutar búsquedas remotas mediante un formulario.
|
| clear informa cuando el usuario limpia el campo.
|--------------------------------------------------------------------------
*/
const emit = defineEmits([
  "update:modelValue",
  "search",
  "clear",
]);

/*
|--------------------------------------------------------------------------
| Actualización del campo
|--------------------------------------------------------------------------
*/
const handleInput = (event) => {
  emit(
    "update:modelValue",
    event.target.value,
  );
};

/*
|--------------------------------------------------------------------------
| Enviar búsqueda
|--------------------------------------------------------------------------
*/
const handleSubmit = () => {
  emit("search", props.modelValue.trim());
};

/*
|--------------------------------------------------------------------------
| Limpiar búsqueda
|--------------------------------------------------------------------------
*/
const clearSearch = () => {
  emit("update:modelValue", "");
  emit("clear");
};
</script>

<template>
  <form
    class="search-container"
    role="search"
    @submit.prevent="handleSubmit"
  >
    <label
      :for="props.inputId"
      class="form-label fw-semibold"
    >
      {{ props.label }}
    </label>

    <div class="input-group">
      <span class="input-group-text">
        <i
          class="bi bi-search"
          aria-hidden="true"
        ></i>
      </span>

      <input
        :id="props.inputId"
        type="search"
        class="form-control"
        :value="props.modelValue"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        autocomplete="off"
        @input="handleInput"
      />

      <button
        v-if="props.modelValue"
        class="btn btn-outline-secondary"
        type="button"
        :disabled="props.disabled"
        aria-label="Limpiar búsqueda"
        @click="clearSearch"
      >
        <i
          class="bi bi-x-lg"
          aria-hidden="true"
        ></i>
      </button>

      <button
        v-if="props.showSearchButton"
        class="btn btn-primary"
        type="submit"
        :disabled="
          props.disabled ||
          !props.modelValue.trim()
        "
      >
        Buscar
      </button>
    </div>
  </form>
</template>