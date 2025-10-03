interface ChatMessage {
  id?: string
  content: string
  role: 'user' | 'assistant' | 'error'
  createdAt?: Date
  canRetry?: boolean
  isEdited?: boolean
  editedAt?: Date
  originalContent?: string
  parentMessageId?: string
}

interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt?: Date
  messageCount: number
  lastMessage: string
}

export const useChat = (authUser?: Ref<any>) => {
  const sessions = ref<ChatSession[]>([])
  const currentSession = ref<ChatSession | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const shouldRefreshSessions = ref(false)
  const user = authUser
  const fetchSessions = async () => {
    if (!user?.value?.id) return

    try {
      const response = await $fetch<ChatSession[]>('/api/chat/sessions', {
        query: { userId: user?.value.id }
      })
      sessions.value = response
    } catch (error) {
      console.error('Error')
    }
  }

  const loadSession = async (sessionId: string) => {
    if (!user?.value?.id) return

    try {
      isLoading.value = true
      const response = await $fetch<{
        session: ChatSession
        messages: ChatMessage[]
      }>(`/api/chat/${sessionId}`, {
        query: { userId: user?.value.id }
      })
      
      currentSession.value = response.session
      messages.value = response.messages
    } catch (error) {
      console.error('Error loading session')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createNewSession = () => {
    currentSession.value = null
    messages.value = []
  }

  const sendMessage = async (content: string, images?: any[]) => {
    if (!user?.value?.id || isStreaming.value) {
      return
    }

    try {
      isStreaming.value = true
      const userMessage: ChatMessage = {
        content,
        role: 'user',
        createdAt: new Date()
      }
      messages.value.push(userMessage)

      const apiMessages = messages.value
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
          content: msg.content,
          role: msg.role
        }))

      const selectedModel = useState<string>('selectedModel', () => 'gemini-2.5-pro')
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId: currentSession.value?.id,
          userId: user?.value.id,
          model: selectedModel.value,
          images: images || []
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status}`)
      }

      const sessionId = response.headers.get('X-Session-Id')
      if (sessionId && !currentSession.value) {
        currentSession.value = {
          id: sessionId,
          title: content.length > 50 ? content.substring(0, 47) + '...' : content,
          createdAt: new Date(),
          messageCount: 0,
          lastMessage: ''
        }
        
        await fetchSessions()
        shouldRefreshSessions.value = !shouldRefreshSessions.value
        generateTitle(sessionId, content)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Streaming tidak didukung')

      const aiMessage: ChatMessage = {
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
        isStreaming.value = false
      }

      await fetchSessions()
      shouldRefreshSessions.value = !shouldRefreshSessions.value

      if (currentSession.value?.id) {
        setTimeout(async () => {
          try {
            await loadSession(currentSession.value!.id)
          } catch (error) {
            console.error('Failed to reload session')
          }
        }, 1000)
      }
      
      setTimeout(async () => {
        await fetchSessions()
        shouldRefreshSessions.value = !shouldRefreshSessions.value
      }, 1500)

    } catch (error) {
      isStreaming.value = false
      
      if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
        messages.value.pop()
      }
      
      const errorMessage: ChatMessage = {
        content: error instanceof Error 
          ? (error.message.includes('fetch') 
              ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
              : error.message.includes('Server error')
              ? 'Server sedang mengalami masalah. Silakan coba lagi nanti.'
              : 'Gagal mengirim pesan. Silakan coba lagi.')
          : 'Terjadi kesalahan yang tidak diketahui.',
        role: 'error',
        createdAt: new Date(),
        canRetry: true
      }
      messages.value.push(errorMessage)
      
      throw error
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!user?.value?.id) return

    try {
      await $fetch(`/api/chat/${sessionId}`, {
        method: 'DELETE' as any,
        query: { userId: user?.value.id }
      })
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      if (currentSession.value?.id === sessionId) {
        createNewSession()
      }
    } catch (error) {
      throw error
    }
  }

  const removeMessage = (index: number) => {
    if (index >= 0 && index < messages.value.length) {
      messages.value.splice(index, 1)
    }
  }

  const generateTitle = async (sessionId: string, firstMessage: string) => {
    try {
      const response = await $fetch<{ success: boolean; title: string }>('/api/chat/generate-title', {
        method: 'POST',
        body: { sessionId, firstMessage }
      })

      if (response.success && response.title) {
        if (currentSession.value?.id === sessionId) {
          currentSession.value.title = response.title
        }

        const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          sessions.value[sessionIndex].title = response.title
        }

        await fetchSessions()
        
        shouldRefreshSessions.value = !shouldRefreshSessions.value
      }
    } catch (error) {
      console.log('Failed to generate title')
    }
  }

  onMounted(() => {
    if (user?.value?.id) {
      fetchSessions()
    }
  })

  if (user) {
    watch(user, (newUser) => {
      if (newUser?.id) {
        fetchSessions()
      } else {
        sessions.value = []
        messages.value = []
        currentSession.value = null
      }
    })
  }

  return {
    sessions,
    currentSession,
    messages,
    isLoading: readonly(isLoading),
    isStreaming: readonly(isStreaming),
    shouldRefreshSessions: readonly(shouldRefreshSessions),
    fetchSessions,
    loadSession,
    createNewSession,
    sendMessage,
    deleteSession,
    removeMessage
  }
}