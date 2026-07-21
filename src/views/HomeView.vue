<script setup>
import ProjectCard from "../components/ProjectCard.vue";

/*
|--------------------------------------------------------------------------
| Módulos del proyecto
|--------------------------------------------------------------------------
*/
const projects = [
  {
    id: "simpsons",
    moduleNumber: "01",
    title: "The Simpsons",
    description:
      "Consulta personajes de Springfield, navega entre páginas y descubre la información completa de cada personaje.",
    icon: "bi-people-fill",
    routeName: "simpsons",
    buttonText: "Explorar Springfield",
    theme: "simpsons",
    features: [
      "Paginación desde la API",
      "Búsqueda por personaje",
      "Vista de detalle",
    ],
  },
  {
    id: "pokemon",
    moduleNumber: "02",
    title: "Pokémon",
    description:
      "Explora los primeros 151 Pokémon mediante búsqueda global, paginación local y estadísticas detalladas.",
    icon: "bi-circle-half",
    routeName: "pokemon",
    buttonText: "Iniciar aventura",
    theme: "pokemon",
    features: [
      "Primera generación",
      "Paginación con Vue",
      "Estadísticas y habilidades",
    ],
  },
  {
    id: "yugioh",
    moduleNumber: "03",
    title: "Yu-Gi-Oh!",
    description:
      "Busca cartas del formato TCG, aplica filtros avanzados y consulta todos los atributos disponibles.",
    icon: "bi-suit-diamond-fill",
    routeName: "yugioh",
    buttonText: "Explorar cartas",
    theme: "yugioh",
    features: [
      "Búsqueda remota",
      "Filtros por tipo y atributo",
      "Paginación por offset",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| Redes sociales de AnderCode
|--------------------------------------------------------------------------
*/
const socialLinks = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/AnderCode",
    icon: "fa-brands fa-youtube",
    className: "social-link--youtube",
  },
  {
    name: "Facebook",
    url: "https://web.facebook.com/Ander.Codex",
    icon: "fa-brands fa-facebook-f",
    className: "social-link--facebook",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/ander_code/",
    icon: "fa-brands fa-instagram",
    className: "social-link--instagram",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@ander_code",
    icon: "fa-brands fa-tiktok",
    className: "social-link--tiktok",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/andercode/",
    icon: "fa-brands fa-linkedin-in",
    className: "social-link--linkedin",
  },
  {
    name: "GitHub",
    url: "https://github.com/Anders87x",
    icon: "fa-brands fa-github",
    className: "social-link--github",
  },
  {
    name: "WhatsApp",
    url: "https://chat.whatsapp.com/IwWtBWde9BZGJ0x3igzLpK",
    icon: "fa-brands fa-whatsapp",
    className: "social-link--whatsapp",
  },
  {
    name: "Telegram",
    url: "https://t.me/+E3h3wXRRtOk4NmZh",
    icon: "fa-brands fa-telegram",
    className: "social-link--telegram",
  },
  {
    name: "Discord",
    url: "https://discord.gg/ZMXdHd945x",
    icon: "fa-brands fa-discord",
    className: "social-link--discord",
  },
  {
    name: "Udemy",
    url: "https://www.udemy.com/user/anderson-bastidas/",
    icon: "fa-solid fa-graduation-cap",
    className: "social-link--udemy",
  },
];

/*
|--------------------------------------------------------------------------
| Tecnologías
|--------------------------------------------------------------------------
*/
const technologies = [
  {
    name: "Vue.js 3",
    icon: "fa-brands fa-vuejs",
  },
  {
    name: "JavaScript",
    icon: "fa-brands fa-js",
  },
  {
    name: "Bootstrap 5",
    icon: "fa-brands fa-bootstrap",
  },
  {
    name: "GitHub Pages",
    icon: "fa-brands fa-github",
  },
  {
    name: "Axios",
    icon: "fa-solid fa-cloud-arrow-down",
  },
  {
    name: "Vite",
    icon: "fa-solid fa-bolt",
  },
];

const courseUrl =
  "https://www.udemy.com/user/anderson-bastidas/";
</script>

<template>
  <div class="home-page">
    <!--
    |--------------------------------------------------------------------------
    | Fondo decorativo
    |--------------------------------------------------------------------------
    -->

    <div
      class="home-background"
      aria-hidden="true"
    >
      <span class="home-orb home-orb--one"></span>
      <span class="home-orb home-orb--two"></span>
      <span class="home-orb home-orb--three"></span>
      <span class="home-grid"></span>
    </div>

    <!--
    |--------------------------------------------------------------------------
    | Hero
    |--------------------------------------------------------------------------
    -->

    <section class="home-hero">
      <div class="home-hero__content">
        <div class="home-hero__copy">
          <div class="home-status">
            <span class="home-status__dot"></span>

            Proyecto completo y funcional
          </div>

          <p class="home-overline">
            AnderCode presenta
          </p>

          <h1 class="home-hero__title">
            Aprende

            <span class="home-hero__gradient">
              Vue.js
            </span>

            consumiendo APIs públicas reales
          </h1>

          <p class="home-hero__description">
            Construye una aplicación SPA profesional con Vue.js 3,
            Vue Router, Axios y Bootstrap mientras exploras datos
            reales de The Simpsons, Pokémon y Yu-Gi-Oh!.
          </p>

          <div class="home-hero__actions">
            <a
              :href="courseUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="home-button home-button--primary"
            >
              <i
                class="fa-solid fa-graduation-cap"
                aria-hidden="true"
              ></i>

              <span>Ver mis cursos</span>

              <i
                class="bi bi-arrow-up-right"
                aria-hidden="true"
              ></i>
            </a>

            <a
              href="#modulos"
              class="home-button home-button--secondary"
            >
              <i
                class="fa-solid fa-code"
                aria-hidden="true"
              ></i>

              Explorar proyecto
            </a>
          </div>

          <div class="home-hero__metrics">
            <div class="home-metric">
              <strong>3</strong>
              <span>APIs públicas</span>
            </div>

            <div class="home-metric">
              <strong>1</strong>
              <span>Aplicación SPA</span>
            </div>

            <div class="home-metric">
              <strong>0</strong>
              <span>Backend requerido</span>
            </div>
          </div>
        </div>

        <!-- Terminal visual -->

        <div class="home-hero__visual">
          <div class="code-window">
            <header class="code-window__header">
              <div class="code-window__controls">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span class="code-window__filename">
                AnderCode.vue
              </span>

              <i
                class="fa-brands fa-vuejs"
                aria-hidden="true"
              ></i>
            </header>

            <div class="code-window__body">
              <div class="code-line">
                <span class="code-line__number">01</span>

                <span>
                  <span class="code-purple">const</span>
                  <span class="code-blue"> developer</span>
                  <span class="code-white"> = </span>
                  <span class="code-green">"AnderCode"</span>
                </span>
              </div>

              <div class="code-line">
                <span class="code-line__number">02</span>

                <span>
                  <span class="code-purple">const</span>
                  <span class="code-blue"> framework</span>
                  <span class="code-white"> = </span>
                  <span class="code-green">"Vue.js 3"</span>
                </span>
              </div>

              <div class="code-line">
                <span class="code-line__number">03</span>

                <span>
                  <span class="code-purple">const</span>
                  <span class="code-blue"> apis</span>
                  <span class="code-white"> = [</span>
                </span>
              </div>

              <div class="code-line code-line--indent">
                <span class="code-line__number">04</span>

                <span class="code-green">
                  "The Simpsons",
                </span>
              </div>

              <div class="code-line code-line--indent">
                <span class="code-line__number">05</span>

                <span class="code-green">
                  "PokéAPI",
                </span>
              </div>

              <div class="code-line code-line--indent">
                <span class="code-line__number">06</span>

                <span class="code-green">
                  "YGOPRODeck"
                </span>
              </div>

              <div class="code-line">
                <span class="code-line__number">07</span>

                <span class="code-white">]</span>
              </div>

              <div class="code-line">
                <span class="code-line__number">08</span>

                <span>
                  <span class="code-purple">export default</span>

                  <span class="code-yellow">
                    buildSomethingAmazing
                  </span>

                  <span class="code-white">()</span>
                </span>
              </div>

              <div class="code-cursor-line">
                <span class="code-cursor"></span>
              </div>
            </div>

            <div class="code-window__badge code-window__badge--vue">
              <i class="fa-brands fa-vuejs"></i>
              Vue 3
            </div>

            <div class="code-window__badge code-window__badge--api">
              <i class="fa-solid fa-cloud"></i>
              APIs reales
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--
    |--------------------------------------------------------------------------
    | Redes sociales
    |--------------------------------------------------------------------------
    -->

    <section class="home-social-section">
      <div class="home-social-section__copy">
        <p>Sigue aprendiendo con</p>
        <strong>AnderCode</strong>
      </div>

      <div
        class="social-top-icons"
        aria-label="Redes sociales de AnderCode"
      >
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          :class="social.className"
          :aria-label="`Visitar ${social.name} de AnderCode`"
          :title="social.name"
        >
          <i
            :class="social.icon"
            aria-hidden="true"
          ></i>

          <span class="visually-hidden">
            {{ social.name }}
          </span>
        </a>
      </div>
    </section>

    <!--
    |--------------------------------------------------------------------------
    | Promoción del curso
    |--------------------------------------------------------------------------
    -->

    <section class="course-promo">
      <div class="course-promo__icon">
        <i
          class="fa-solid fa-rocket"
          aria-hidden="true"
        ></i>
      </div>

      <div class="course-promo__content">
        <p class="course-promo__eyebrow">
          Aprende construyendo
        </p>

        <h2>
          Vue.js + APIs Públicas
        </h2>

        <p>
          Desarrolla esta aplicación completa paso a paso,
          comprende su arquitectura y aprende a trabajar con
          servicios, componentes, rutas, búsquedas, paginación,
          estados y vistas de detalle.
        </p>

        <div class="course-promo__benefits">
          <span>
            <i class="bi bi-check-circle-fill"></i>
            Proyecto práctico
          </span>

          <span>
            <i class="bi bi-check-circle-fill"></i>
            Código organizado
          </span>

          <span>
            <i class="bi bi-check-circle-fill"></i>
            APIs reales
          </span>
        </div>
      </div>

      <a
        :href="courseUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="home-button home-button--primary"
      >
        <i class="fa-solid fa-play"></i>
        Comenzar a aprender
      </a>
    </section>

    <!--
    |--------------------------------------------------------------------------
    | Módulos
    |--------------------------------------------------------------------------
    -->

    <section
      id="modulos"
      class="home-modules"
    >
      <header class="home-section-header">
        <div>
          <p class="home-overline">
            Tres universos, una aplicación
          </p>

          <h2>
            Selecciona tu próxima aventura
          </h2>
        </div>

        <p>
          Cada módulo utiliza una estrategia distinta de búsqueda,
          paginación y consumo de datos.
        </p>
      </header>

      <div class="row g-4">
        <div
          v-for="(project, index) in projects"
          :key="project.id"
          class="col-12 col-lg-4"
          :style="{
            '--card-delay': `${index * 140}ms`,
          }"
        >
          <ProjectCard
            :title="project.title"
            :description="project.description"
            :icon="project.icon"
            :route-name="project.routeName"
            :button-text="project.buttonText"
            :theme="project.theme"
            :module-number="project.moduleNumber"
            :features="project.features"
          />
        </div>
      </div>
    </section>

    <!--
    |--------------------------------------------------------------------------
    | Instructor
    |--------------------------------------------------------------------------
    -->

    <section class="instructor-panel">
      <div class="instructor-panel__avatar">
        <span>AC</span>

        <div class="instructor-panel__status"></div>
      </div>

      <div class="instructor-panel__content">
        <p class="home-overline">
          Tu instructor
        </p>

        <h2>
          Anderson Bastidas
          <span>AnderCode</span>
        </h2>

        <p>
          Instructor y desarrollador enfocado en crear cursos
          prácticos de programación, aplicaciones reales y
          arquitecturas fáciles de comprender.
        </p>
      </div>

      <a
        href="https://www.udemy.com/user/anderson-bastidas/"
        target="_blank"
        rel="noopener noreferrer"
        class="home-button home-button--secondary"
      >
        <i class="fa-solid fa-graduation-cap"></i>
        Perfil de Udemy
      </a>
    </section>

    <!--
    |--------------------------------------------------------------------------
    | Tecnologías
    |--------------------------------------------------------------------------
    -->

    <section class="home-technologies">
      <header class="home-section-header">
        <div>
          <p class="home-overline">
            Stack tecnológico
          </p>

          <h2>
            Herramientas utilizadas
          </h2>
        </div>
      </header>

      <div class="technology-grid">
        <div
          v-for="technology in technologies"
          :key="technology.name"
          class="technology-item"
        >
          <i
            :class="technology.icon"
            aria-hidden="true"
          ></i>

          <span>{{ technology.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>