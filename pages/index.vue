<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 flex items-center justify-center">
    <div class="text-center">
      <div class="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br from-black to-neutral-700" aria-hidden="true">
        <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24" role="img">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
      <h2 class="text-2xl font-semibold text-neutral-900 mb-2">Chatbot AI</h2>
      <p class="text-neutral-600">Memeriksa sesi…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const redirected = ref(false)
const { user: dbUser, isLoading: isDbLoading, error: dbError, fetchUser } = useAuthenticatedUser()

const safeRedirect = (path: string) => {
  if (redirected.value) return
  redirected.value = true
  navigateTo(path)
}

onMounted(async () => {
  await fetchUser()
  
  if (dbUser.value) {
    safeRedirect('/dashboard')
  } else if (dbError.value) {
    safeRedirect('/login')
  } else {
    safeRedirect('/login')
  }
})

watch(dbUser, (newUser, oldUser) => {
  if (newUser && !oldUser && !redirected.value) {
    safeRedirect('/dashboard')
  }

  if (!newUser && oldUser && !redirected.value) {
    safeRedirect('/login')
  }
})
</script>
