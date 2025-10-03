<template>
  <AppLayout>
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-600">Memuat dashboard...</p>
      </div>
    </div>
    <div v-else class="space-y-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Selamat datang di Chatbot AI!
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Mulai percakapan baru atau lanjutkan dari riwayat chat Anda.
              </p>
            </div>
            <NuxtLink to="/chat">
              <Button size="lg" class="ml-4">
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Chat Baru
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Chat</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ totalChats }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Chat Hari Ini</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ chatsToday }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Pesan</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ totalMessages }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Aktivitas Terbaru
          </h3>
          <div v-if="recentActivity.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada aktivitas</h3>
            <p class="mt-1 text-sm text-gray-500">Mulai chat baru untuk melihat aktivitas Anda di sini.</p>
            <div class="mt-6">
              <NuxtLink to="/chat">
                <Button>
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Mulai Chat Baru
                </Button>
              </NuxtLink>
            </div>
          </div>
          <div v-else class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, activityIdx) in recentActivity" :key="activity.id">
                <div class="relative pb-8">
                  <span 
                    v-if="activityIdx !== recentActivity.length - 1" 
                    class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                    aria-hidden="true"
                  />
                  <div class="relative flex items-start space-x-3">
                    <div class="relative">
                      <div class="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div>
                        <div class="text-sm flex items-center justify-between">
                          <span class="font-medium text-gray-900">{{ activity.action }}</span>
                          <NuxtLink 
                            :to="`/chat?id=${activity.id}`"
                            class="text-xs text-slate-800 font-medium"
                          >
                            Lihat →
                          </NuxtLink>
                        </div>
                        <p class="mt-0.5 text-xs text-gray-500">
                          {{ activity.time }} • {{ activity.messageCount }} pesan
                        </p>
                      </div>
                      <div class="mt-2 text-sm text-gray-700">
                        <p class="line-clamp-2">{{ activity.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import { Button } from '@/components/ui/button'

definePageMeta({ middleware: 'auth' })

const { user, isLoading: isLoadingUser, fetchUser } = useAuthenticatedUser()
const { sessions, fetchSessions } = useChat(user)

const isLoading = ref(true)

// Computed
const totalChats = computed(() => sessions.value.length)

const chatsToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return sessions.value.filter(session => {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime()
  }).length
})

const totalMessages = computed(() => {
  return sessions.value.reduce((total, session) => {
    return total + (session.messageCount || 0)
  }, 0)
})

const recentActivity = computed(() => {
  // Sort sessions by updatedAt or createdAt
  const sortedSessions = [...sessions.value].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt).getTime()
    const dateB = new Date(b.updatedAt || b.createdAt).getTime()
    return dateB - dateA
  })

  // Take top 5 recent sessions
  return sortedSessions.slice(0, 5).map(session => {
    const date = new Date(session.updatedAt || session.createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    let timeAgo = ''
    if (diffMins < 1) {
      timeAgo = 'Baru saja'
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} menit yang lalu`
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} jam yang lalu`
    } else {
      timeAgo = `${diffDays} hari yang lalu`
    }

    return {
      id: session.id,
      action: 'Chat',
      description: session.title,
      time: timeAgo,
      messageCount: session.messageCount || 0
    }
  })
})

// Fetch data on mount
onMounted(async () => {
  try {
    if (!user.value) {
      await fetchUser()
    }
    if (user.value?.id) {
      await fetchSessions()
    }
  } catch (error) {
    console.error('Error fetching data')
  } finally {
    isLoading.value = false
  }
})
</script>