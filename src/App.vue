<script setup>
import { RouterView } from "vue-router";

import AppNavbar from "./components/AppNavbar.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <AppNavbar />

  <main class="app-main">
    <div class="app-container">
      <RouterView />
    </div>
  </main>

  <AppFooter />
</template>