// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/ball.css'],

  app: {
    head: {
      title: 'EBilliard',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#000000' },
      ],
    },
  },

  ssr: false,

  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      autoSubfolderIndex: false,
    },
  },

  modules: ['@vite-pwa/nuxt'],
})
