export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  
  const publicRoutes = ['/', '/login', '/logto/login', '/logto/logout', '/auth/callback']
  if (publicRoutes.includes(to.path)) {
    console.log(`[Auth middleware] Allowing public route: ${to.path}`)
    return
  }
  
  try {
    const response = await $fetch('/api/user/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response?.user) {
      return
    }
    return navigateTo('/login', { replace: true })
  } catch (error: any) {
    return navigateTo('/login', { replace: true })
  }
})
