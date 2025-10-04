<template>
  <ClientOnly>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div class="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card class="w-full max-w-md relative bg-white/70 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader class="text-center">
            <div class="mx-auto w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <CardTitle class="text-3xl font-bold text-gray-900">Chatbot AI</CardTitle>
            <p class="text-sm text-gray-600 mt-2">Masuk ke Chatbot menggunakan Logto Authentication</p>
          </CardHeader>
          <CardContent>
              <Button class="w-full mb-4" :disabled="isLoading" @click="goLogto">
                <svg v-if="isLoading" class="animate-spin -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>{{ isLoading ? 'Memproses...' : 'Masuk dengan Logto' }}</span>
              </Button>
            <div v-if="error" class="rounded-md bg-destructive/10 p-3 border border-destructive/20">
              <div class="flex items-center gap-3">
                <svg class="h-4 w-4 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-destructive">Terjadi Kesalahan</p>
                  <p class="text-xs text-destructive/80">{{ error }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const isLoading = ref(false)
const error = ref('')
let user: any = null
try {
  user = useLogtoUser()
} catch (e) {
  console.error('Error getting Logto user')
}

if (user) {
  watch(() => user?.value, (newUser) => {
    if (newUser) {
      navigateTo('/dashboard')
    }
  }, { immediate: true })
}

onMounted(() => {
  if (user?.value) {
    navigateTo('/dashboard')
  }
})

const goLogto = async () => {
  if (isLoading.value) {
    return
  }
  
  try {
    isLoading.value = true
    error.value = ''
    
    if (process.client) {
      setTimeout(() => {
        window.location.href = '/logto/login'
      }, 100)
    }
  } catch (e: any) {
    isLoading.value = false
    error.value = e?.message || 'Gagal memulai login'
    console.error('Login error')
  }
}
</script>