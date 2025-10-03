<template>
  <div class="flex flex-col h-full bg-white">
    <div class="flex items-center h-16 px-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold">Chatbot AI</h2>
    </div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="p-4 space-y-4">
        <NuxtLink
          to="/dashboard"
          class="flex"
        >
          <Button
            variant="ghost"
            class="w-full justify-start"
            :class="{ 'bg-accent': route.path === '/dashboard' }"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3H8V5z" />
            </svg>
            Dashboard
          </Button>
        </NuxtLink>
        <Button size="lg" class="w-full justify-start px-4" @click="startNewChat">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Chat Baru
        </Button>
        <Separator />
      </div>
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex items-center justify-between mb-2 px-4">
          <h3 class="text-sm font-semibold text-muted-foreground">Riwayat Chat</h3>
          <Badge v-if="sessions.length > 0" variant="secondary">{{ sessions.length }}</Badge>
        </div>
        <ScrollArea class="flex-1 px-4">
          <div class="space-y-1">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="relative flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors group"
                :class="{
                  'bg-indigo-100 border border-indigo-300': currentSession?.id === session.id,
                  'hover:bg-gray-100 focus:bg-gray-100': currentSession?.id !== session.id
                }"
                @click="selectChat(session.id)"
                tabindex="0"
                @keydown.enter="selectChat(session.id)"
              >
                <div v-if="currentSession?.id === session.id" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-md"></div>
                <p 
                  class="text-sm truncate flex-1"
                  :class="currentSession?.id === session.id ? 'font-semibold text-indigo-900' : 'text-gray-700'"
                >
                  {{ session.title }}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                      @click.stop
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Chat?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Chat ini akan dihapus secara permanen dari memori.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction @click="handleDeleteChat(session.id)">
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div v-if="sessions.length === 0" class="py-10 text-center">
                <svg class="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="mt-2 text-sm text-gray-600">Belum ada chat</p>
                <p class="text-xs text-gray-400">Mulai percakapan baru</p>
              </div>
            </div>
          </ScrollArea>
        </div>
      <Separator class="mt-4" />
      <div class="p-4 border-t bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Avatar class="h-10 w-10 text-gray-900 bg-slate-200">
              <AvatarFallback class="text-sm font-medium">
                {{ getInitials(user?.name || 'User') }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ truncateName(user?.name || 'User') }}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon" @click="handleLogout">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Keluar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()


const route = useRoute()
const router = useRouter()
const { user } = useAuthenticatedUser()
const { sessions, currentSession, createNewSession, deleteSession, shouldRefreshSessions, fetchSessions } = useChat(user)
const sessionsKey = computed(() => sessions.value.length + '-' + sessions.value.map(s => s.id).join('-'))

let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  refreshInterval = setInterval(async () => {
    if (route.path === '/chat' && user.value?.id) {
      await fetchSessions()
    }
  }, 2000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

const startNewChat = async () => {
  createNewSession()
  const timestamp = Date.now()
  
  if (route.path === '/chat') {
    await router.push({ path: '/chat', query: { new: timestamp.toString() } })
    await router.replace({ path: '/chat' })
  } else {
    await router.push('/chat')
  }
}

const selectChat = async (sessionId: string) => {
  try {
    await navigateTo(`/chat?id=${sessionId}`)
  } catch (error) {
    toast({
      title: 'Gagal Memuat Chat',
      description: 'Tidak dapat membuka chat. Silakan coba lagi.',
      variant: 'destructive',
    })
  }
}

const handleDeleteChat = async (sessionId: string) => {
  try {
    await deleteSession(sessionId)
    toast({
      title: 'Chat Berhasil Dihapus',
      description: 'Chat telah dihapus dari riwayat Anda.',
    })
  } catch (error) {
    toast({
      title: 'Gagal Menghapus Chat',
      description: 'Terjadi kesalahan saat menghapus chat. Silakan coba lagi.',
      variant: 'destructive',
    })
  }
}

const handleLogout = async () => {
  try {
    await navigateTo('/logto/logout', { external: true })
  } catch (error) {
    if (process.client) window.location.href = '/logto/logout'
  }
}

const getInitials = (name: string) => {
  if (!name || name === 'User') return 'U'
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const truncateName = (name: string, maxLength: number = 15) => {
  if (!name || name === 'User') return name
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength) + '...'
}
</script>