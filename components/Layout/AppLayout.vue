<template>
  <div v-if="isCheckingAuth" class="flex items-center justify-center h-screen bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-sm text-gray-600">Memuat...</p>
    </div>
  </div>
  <div v-else class="flex h-screen bg-gray-50 overflow-hidden">
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 
      bg-white border-b border-gray-200 lg:border-none shadow-sm lg:shadow-none lg:bg-transparent 
      lg:justify-start lg:pl-[272px]">
      <div class="flex items-center space-x-3">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="lg:hidden">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <h1 class="text-lg font-semibold text-gray-900 lg:hidden">Chatbot AI</h1>
      </div>
      <div class="flex items-center">
        <ModelSelector />
      </div>
    </header>
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 h-screen">
      <div class="flex-1 overflow-y-auto">
        <SidebarContent />
      </div>
    </aside>
    <div class="flex-1 flex flex-col pt-16 h-screen lg:ml-0">
      <main class="flex-1 overflow-y-auto">
        <div class="h-full px-4 lg:px-6">
          <slot />
        </div>
      </main>
    </div>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toast'
import SidebarContent from './SidebarContent.vue'
import ModelSelector from '@/components/ModelSelector.vue'

const isCheckingAuth = ref(true)
const { user: dbUser, isLoading, fetchUser } = useAuthenticatedUser()

watch(dbUser, (newUser, oldUser) => {
  if (!newUser && oldUser) {
    navigateTo('/login', { replace: true })
  }
})

onMounted(async () => {
  await fetchUser()
  if (!dbUser.value) {
    console.log('[AppLayout] No authenticated user, redirecting to login')
    navigateTo('/login', { replace: true })
  } else {
    isCheckingAuth.value = false
  }
})
</script>