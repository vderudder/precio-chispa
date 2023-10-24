// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'PrecioChispa'
    }
  },
  devtools: { enabled: true },
  pages: true,
  modules: ['@nuxthq/ui']
})
