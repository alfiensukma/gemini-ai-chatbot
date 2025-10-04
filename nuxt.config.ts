// https://nuxt.com/docs/api/configuration/nuxt-config
import { UserScope } from '@logto/nuxt'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@logto/nuxt',
    'shadcn-nuxt'
  ],
  logto: {
    pathnames: {
      signIn: '/logto/login',
      signOut: '/logto/logout',
      callback: '/auth/callback'
    },
    postCallbackRedirectUri: '/',
    postSignOutRedirectUri: '/login',
    scopes: [UserScope.Email],
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts'
  },
  runtimeConfig: {
    logto: {
      endpoint: process.env.NUXT_LOGTO_ENDPOINT,
      appId: process.env.NUXT_LOGTO_APP_ID,
      appSecret: process.env.NUXT_LOGTO_APP_SECRET,
      cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
    },
    sessionSecret: process.env.NUXT_SESSION_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    public: {
      logto: {
        endpoint: process.env.NUXT_LOGTO_ENDPOINT,
        appId: process.env.NUXT_LOGTO_APP_ID,
      }
    }
  },
  ssr: true,
  nitro: {
    preset: 'netlify'
  },
})
