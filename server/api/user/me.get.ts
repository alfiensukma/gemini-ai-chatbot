import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/user/me
 * Get current authenticated user from database
 * Reads Logto session from cookies
 */
export default defineEventHandler(async (event) => {
  try {
    const cookies = parseCookies(event)
    const logtoAppId = process.env.NUXT_LOGTO_APP_ID || '2415e7ja4023tsvbqc5dm'
    const sessionCookieName = `logto:${logtoAppId}`
    const hasLogtoSession = cookies[sessionCookieName] || 
                           cookies['logto_session'] ||
                           Object.keys(cookies).some(key => key.startsWith('logto'))
    
    if (!hasLogtoSession) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - No session found'
      })
    }

    let logtoUser: any = null
    
    logtoUser = event.context.user || 
                event.context.logtoUser ||
                event.context.logto?.user
    
    if (!logtoUser?.sub) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - Session exists but user not loaded'
      })
    }

    const logtoId = logtoUser.sub
    const name = logtoUser.name || logtoUser.username || 'User'
    const user = await prisma.user.upsert({
      where: { logtoId },
      update: {
        name
      },
      create: {
        logtoId,
        name
      },
      select: {
        id: true,
        name: true,
        logtoId: true
      }
    })

    return {
      success: true,
      user
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to get current user'
    })
  }
})
