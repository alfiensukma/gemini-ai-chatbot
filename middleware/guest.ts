export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  if (to.path === '/') return
  
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const user = useLogtoUser()
    
    if (user?.value) {
      return navigateTo('/dashboard', { replace: true })
    }
  } catch (e) {
    console.error('Guest middleware error')
  }
})