<template>
  <AppLayout>
    <div class="h-full flex flex-col">
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div v-if="messages.length === 0" class="flex justify-center">
          <div class="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <p class="text-sm text-gray-600 text-center">
              Selamat datang! Saya Chatbot AI, siap membantu Anda. Silakan tanyakan apa saja!
            </p>
          </div>
        </div>
        <div v-for="(message, index) in messages" :key="message.id || index" class="flex justify-center group">
          <div class="w-full max-w-[800px]" :class="message.role === 'user' ? 'flex justify-end' : ''">
            <div v-if="message.role === 'user'" class="max-w-[70%] relative">
              <div class="bg-slate-200 rounded-xl px-4 py-3">
                <div v-if="editingMessageId === message.id">
                  <Textarea 
                    v-model="editContent"
                    rows="3"
                    class="text-sm mb-2"
                    placeholder="Edit pesan..."
                  />
                  <div class="flex gap-2 justify-end">
                    <Button @click="cancelEdit" size="sm" variant="outline">Batal</Button>
                    <Button @click="() => message.id && saveEdit(message.id, false)" size="sm">Simpan</Button>
                    <Button @click="() => message.id && saveEdit(message.id, true)" size="sm" variant="secondary">Simpan sebagai Branch</Button>
                  </div>
                </div>
                <div v-else>
                  <p class="text-sm whitespace-pre-wrap text-gray-900">{{ message.content }}</p>
                  <p v-if="(message as any).isEdited" class="text-xs text-gray-500 mt-1 italic">
                    (diedit)
                  </p>
                </div>
              </div>
              <div v-if="editingMessageId !== message.id && message.id" class="absolute -right-1 -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button @click="() => startEdit(message)" size="sm" variant="ghost" class="h-7 w-7 p-0 bg-white border shadow-sm hover:bg-gray-100">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button @click="() => message.id && confirmDelete(message.id)" size="sm" variant="ghost" class="h-7 w-7 p-0 bg-white border shadow-sm hover:bg-red-50 hover:text-red-600">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
            <div v-else-if="message.role === 'assistant'" class="flex items-start space-x-3 w-full">
              <div class="flex-1">
                <MessageRenderer :content="message.content" />
              </div>
            </div>
            <div v-else-if="message.role === 'error'" class="w-full">
              <Alert variant="destructive">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                <AlertDescription>
                  {{ message.content }}
                  <Button
                    v-if="message.canRetry"
                    @click="retryLastMessage"
                    variant="outline"
                    size="sm"
                    class="mt-2 h-8"
                  >
                    <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        <div v-if="isStreaming || isRegenerating" class="flex justify-center">
          <div class="w-full max-w-[800px]">
            <div class="flex items-start space-x-3 w-full">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">
                    {{ isRegenerating ? 'Regenerating jawaban...' : 'Sedang mengetik' }}
                  </span>
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center p-4">
        <div class="w-full max-w-[800px]">
          <div v-if="uploadedImages.length > 0" class="mb-2 flex flex-wrap gap-2">
            <div v-for="(img, idx) in uploadedImages" :key="idx" class="relative">
              <img :src="img.preview" class="h-20 w-20 object-cover rounded-lg border border-gray-300" />
              <button
                @click="removeImage(idx)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

            <div class="relative flex items-start gap-2">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              class="hidden"
            />
            <Button
              @click="() => fileInputRef?.click()"
              :disabled="isStreaming || isRegenerating"
              variant="outline"
              size="icon"
              class="h-[48px] w-12 shrink-0"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>

            <div class="flex-1 relative">
              <textarea
              ref="textareaRef"
              v-model="newMessage"
              @keydown="handleKeydown"
              @input="adjustTextareaHeight"
              :disabled="isStreaming || isRegenerating"
              placeholder="Ketik pesan Anda..."
              rows="1"
              class="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black focus:border-transparent overflow-hidden transition-all duration-200 text-sm min-h-[48px]"
              style="max-height: 300px;"
              />
              <Button 
              @click="handleSendMessage" 
              :disabled="!newMessage.trim() || isStreaming || isRegenerating"
              class="absolute bottom-3 right-2 h-8 w-8 p-0 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:opacity-50"
              >
              <svg v-if="!isStreaming" class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <svg v-else class="h-4 w-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              </Button>
            </div>
            </div>
          <p class="text-xs text-gray-500 mt-2 text-center">
            Tekan Enter untuk mengirim pesan. Shift + Enter untuk baris baru.
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Pesan akan dihapus secara permanen dari riwayat chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="() => { showDeleteDialog = false; messageToDelete = null; }">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction @click="deleteMessage" class="bg-red-600 hover:bg-red-700">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel 
} from '@/components/ui/alert-dialog'
import MessageRenderer from '@/components/MessageRenderer.vue'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

definePageMeta({
  middleware: 'auth'
})

const { user, isLoading, fetchUser } = useAuthenticatedUser()
const { 
  messages, 
  currentSession, 
  isStreaming, 
  sendMessage, 
  createNewSession,
  loadSession,
  removeMessage
} = useChat(user)

const route = useRoute()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()
const lastFailedMessage = ref<string>('')

// Image upload state
interface UploadedImage {
  data: string
  preview: string
  mimeType: string
}
const uploadedImages = ref<UploadedImage[]>([])

// Edit/Delete state
const editingMessageId = ref<string | null>(null)
const editContent = ref('')
const messageToDelete = ref<string | null>(null)
const showDeleteDialog = ref(false)
const isRegenerating = ref(false)

const startEdit = (message: any) => {
  editingMessageId.value = message.id
  editContent.value = message.content
}

const cancelEdit = () => {
  editingMessageId.value = null
  editContent.value = ''
}

// Save edited message
const saveEdit = async (messageId: string, createBranch: boolean) => {
  if (!editContent.value.trim()) {
    toast({
      title: 'Konten Kosong',
      description: 'Pesan tidak boleh kosong.',
      variant: 'destructive',
    })
    return
  }

  try {
    const response = await $fetch(`/api/message/${messageId}`, {
      method: 'PATCH',
      body: {
        content: editContent.value.trim(),
        createBranch
      }
    })

    if (response.success) {
      cancelEdit()
      const editedMsgIndex = messages.value.findIndex(m => m.id === messageId)
      
      if (editedMsgIndex !== -1) {
        const messagesToKeep = messages.value.slice(0, editedMsgIndex + 1)
        messages.value.length = 0
        messages.value.push(...messagesToKeep)
        
        messages.value[editedMsgIndex].content = editContent.value.trim()
        if ((response as any).message?.isEdited) {
          (messages.value[editedMsgIndex] as any).isEdited = true
        }

        toast({
          title: createBranch ? 'Branch Dibuat' : 'Pesan Diedit',
          description: 'Generating jawaban baru dari AI...',
        })

        const contextMessages = messages.value
          .filter(msg => msg.role !== 'error')
          .map(msg => ({
            content: msg.content,
            role: msg.role
          }))

        const selectedModel = useState<string>('selectedModel', () => 'gemini-2.5-pro')

        isRegenerating.value = true

        const aiResponse = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: contextMessages,
            sessionId: currentSession.value?.id,
            userId: user.value?.id,
            model: selectedModel.value,
            images: []
          })
        })

        if (!aiResponse.ok) {
          throw new Error(`Server error: ${aiResponse.status}`)
        }

        const reader = aiResponse.body?.getReader()
        if (!reader) throw new Error('Streaming tidak didukung')

        const aiMessage: any = {
          content: '',
          role: 'assistant',
          createdAt: new Date()
        }
        messages.value.push(aiMessage)

        const decoder = new TextDecoder()
        let accumulated = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            accumulated += chunk
            
            const aiMessageIndex = messages.value.length - 1
            messages.value[aiMessageIndex].content = accumulated
          }
        } finally {
          reader.releaseLock()
          isRegenerating.value = false
        }

        toast({
          title: 'Selesai!',
          description: 'Jawaban baru telah digenerate.',
        })

        nextTick(() => {
          scrollToBottom()
        })
      }

      if (currentSession.value?.id) {
        setTimeout(async () => {
          await loadSession(currentSession.value!.id)
        }, 1000)
      }
    }
  } catch (error) {
    isRegenerating.value = false
    toast({
      title: 'Gagal Menyimpan',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan perubahan.',
      variant: 'destructive',
    })
  }
}

// Confirm delete
const confirmDelete = (messageId: string) => {
  messageToDelete.value = messageId
  showDeleteDialog.value = true
}

// Delete message
const deleteMessage = async () => {
  if (!messageToDelete.value) return

  try {
    const response = await $fetch(`/api/message/${messageToDelete.value}`, {
      method: 'DELETE'
    })

    if (response.success) {
      const msgIndex = messages.value.findIndex(m => m.id === messageToDelete.value)
      if (msgIndex !== -1) {
        messages.value.splice(msgIndex, 1)
      }

      toast({
        title: 'Pesan Dihapus',
        description: 'Pesan berhasil dihapus.',
      })

      showDeleteDialog.value = false
      messageToDelete.value = null

      if (currentSession.value?.id) {
        await loadSession(currentSession.value.id)
      }
    }
  } catch (error) {
    toast({
      title: 'Gagal Menghapus',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus pesan.',
      variant: 'destructive',
    })
  }
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipe File Tidak Valid',
        description: 'Hanya file gambar yang diperbolehkan.',
        variant: 'destructive',
      })
      continue
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Ukuran File Terlalu Besar',
        description: 'Ukuran file maksimal 10MB.',
        variant: 'destructive',
      })
      continue
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      uploadedImages.value.push({
        data: base64,
        preview: base64,
        mimeType: file.type
      })
      
      toast({
        title: 'Gambar Berhasil Ditambahkan',
        description: `${file.name} siap untuk dikirim.`,
      })
    }
    reader.onerror = () => {
      toast({
        title: 'Gagal Membaca File',
        description: 'Terjadi kesalahan saat membaca file gambar.',
        variant: 'destructive',
      })
    }
    reader.readAsDataURL(file)
  }

  input.value = ''
}

// Remove image
const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

const retryLastMessage = async () => {
  if (lastFailedMessage.value) {
    const errorIndex = messages.value.findLastIndex(msg => msg.role === 'error')
    if (errorIndex !== -1) {
      removeMessage(errorIndex)
    }

    const messageToRetry = lastFailedMessage.value
    lastFailedMessage.value = ''
    newMessage.value = messageToRetry
    await handleSendMessage()
  }
}

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 300) + 'px'
  }
}

const formatTime = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || isStreaming.value) return

  if (!user.value) {
    await fetchUser()
    if (!user.value) {
      toast({
        title: 'Sesi Berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      await navigateTo('/')
      return
    }
  }

  const message = newMessage.value.trim()
  newMessage.value = ''
  

  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  try {
    const imagesToSend = uploadedImages.value.length > 0 
      ? uploadedImages.value.map(img => ({
          data: img.data,
          mimeType: img.mimeType
        }))
      : undefined

    await sendMessage(message, imagesToSend)
    
    uploadedImages.value = []

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    lastFailedMessage.value = message
    
    toast({
      title: 'Gagal Mengirim Pesan',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      variant: 'destructive',
    })
    
    nextTick(() => {
      adjustTextareaHeight()
    })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

watch(newMessage, () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})

const handleSessionFromURL = async () => {
  const sessionId = route.query.id as string
  if (sessionId && user.value?.id) {
    try {
      await loadSession(sessionId)
    } catch (error) {
      await navigateTo('/chat', { replace: true })
    }
  }
}

watch(() => route.query.id, async (newSessionId, oldSessionId) => {
  if (newSessionId && user.value?.id) {
    await handleSessionFromURL()
  } else if (!newSessionId && oldSessionId) {
    createNewSession()
  }
}, { immediate: false })

watch(() => route.query.new, (newValue) => {
  if (newValue) {
    createNewSession()
  }
})


watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/chat' && !route.query.id && !route.query.new) {
    createNewSession()
  }
})

watch(user, async (newUser) => {
  if (newUser?.id && route.query.id) {
    await handleSessionFromURL()
  }
})

onMounted(async () => {
  scrollToBottom()
  
  if (!user.value) {
    await fetchUser()
  }
  
  if (user.value?.id) {
    await handleSessionFromURL()
  }
})
</script>