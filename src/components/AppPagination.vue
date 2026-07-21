<script setup>
import { computed } from "vue";

/*
|--------------------------------------------------------------------------
| Propiedades
|--------------------------------------------------------------------------
*/
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },

  totalPages: {
    type: Number,
    required: true,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  visiblePages: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits([
  "change",
]);

/*
|--------------------------------------------------------------------------
| Estado de navegación
|--------------------------------------------------------------------------
*/
const isFirstPage = computed(() => {
  return props.currentPage <= 1;
});

const isLastPage = computed(() => {
  return (
    props.currentPage >= props.totalPages
  );
});

/*
|--------------------------------------------------------------------------
| Crear rango de páginas
|--------------------------------------------------------------------------
*/
const createPageRange = (start, end) => {
  return Array.from(
    {
      length: end - start + 1,
    },
    (_, index) => start + index,
  );
};

/*
|--------------------------------------------------------------------------
| Elementos visibles
|--------------------------------------------------------------------------
| Cuando existen muchas páginas se muestran la primera, la última,
| páginas cercanas a la actual y separadores.
|--------------------------------------------------------------------------
*/
const pageItems = computed(() => {
  const totalPages = Math.max(
    props.totalPages,
    0,
  );

  if (totalPages === 0) {
    return [];
  }

  if (
    totalPages <=
    props.visiblePages + 2
  ) {
    return createPageRange(
      1,
      totalPages,
    ).map((page) => ({
      type: "page",
      value: page,
      key: `page-${page}`,
    }));
  }

  const sidePages = Math.floor(
    props.visiblePages / 2,
  );

  let startPage = Math.max(
    2,
    props.currentPage - sidePages,
  );

  let endPage = Math.min(
    totalPages - 1,
    startPage +
      props.visiblePages -
      1,
  );

  startPage = Math.max(
    2,
    endPage -
      props.visiblePages +
      1,
  );

  const items = [
    {
      type: "page",
      value: 1,
      key: "page-1",
    },
  ];

  if (startPage > 2) {
    items.push({
      type: "ellipsis",
      value: null,
      key: "ellipsis-start",
    });
  }

  createPageRange(
    startPage,
    endPage,
  ).forEach((page) => {
    items.push({
      type: "page",
      value: page,
      key: `page-${page}`,
    });
  });

  if (endPage < totalPages - 1) {
    items.push({
      type: "ellipsis",
      value: null,
      key: "ellipsis-end",
    });
  }

  items.push({
    type: "page",
    value: totalPages,
    key: `page-${totalPages}`,
  });

  return items;
});

/*
|--------------------------------------------------------------------------
| Cambiar página
|--------------------------------------------------------------------------
| Se valida que la página exista y que no sea igual a la página actual.
|--------------------------------------------------------------------------
*/
const changePage = (page) => {
  if (props.disabled) {
    return;
  }

  if (
    page < 1 ||
    page > props.totalPages
  ) {
    return;
  }

  if (page === props.currentPage) {
    return;
  }

  emit("change", page);
};
</script>

<template>
  <nav
    v-if="props.totalPages > 1"
    class="pagination-container"
    aria-label="Paginación de resultados"
  >
    <ul class="pagination">
      <li
        class="page-item"
        :class="{
          disabled:
            props.disabled ||
            isFirstPage,
        }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="
            props.disabled ||
            isFirstPage
          "
          aria-label="Página anterior"
          @click="
            changePage(
              props.currentPage - 1,
            )
          "
        >
          <i
            class="bi bi-chevron-left"
            aria-hidden="true"
          ></i>

          <span class="d-none d-sm-inline ms-1">
            Anterior
          </span>
        </button>
      </li>

      <li
        v-for="item in pageItems"
        :key="item.key"
        class="page-item"
        :class="{
          active:
            item.type === 'page' &&
            item.value ===
              props.currentPage,
          disabled:
            props.disabled ||
            item.type === 'ellipsis',
        }"
      >
        <span
          v-if="item.type === 'ellipsis'"
          class="page-link"
          aria-hidden="true"
        >
          …
        </span>

        <button
          v-else
          class="page-link"
          type="button"
          :disabled="
            props.disabled ||
            item.value ===
              props.currentPage
          "
          :aria-label="
            `Ir a la página ${item.value}`
          "
          :aria-current="
            item.value ===
            props.currentPage
              ? 'page'
              : undefined
          "
          @click="
            changePage(item.value)
          "
        >
          {{ item.value }}
        </button>
      </li>

      <li
        class="page-item"
        :class="{
          disabled:
            props.disabled ||
            isLastPage,
        }"
      >
        <button
          class="page-link"
          type="button"
          :disabled="
            props.disabled ||
            isLastPage
          "
          aria-label="Página siguiente"
          @click="
            changePage(
              props.currentPage + 1,
            )
          "
        >
          <span class="d-none d-sm-inline me-1">
            Siguiente
          </span>

          <i
            class="bi bi-chevron-right"
            aria-hidden="true"
          ></i>
        </button>
      </li>
    </ul>
  </nav>
</template>