export const useAuthenticatedUser = () => {
  const user = useState<any>('authenticated-user', () => null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const fetchUser = async () => {
    if (isLoading.value) return user.value
    
    try {
      isLoading.value = true
      error.value = null
      
      const response = await $fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.success && response.user) {
        user.value = response.user
        return response.user
      } else {
        user.value = null
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      user.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchUser,
    clearUser
  }
}
