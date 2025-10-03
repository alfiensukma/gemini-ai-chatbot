import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const sessionId = getRouterParam(event, 'sessionId')
    const query = getQuery(event)
    const { userId } = query

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Session ID is required'
      })
    }

    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const deletedSession = await prisma.chatSession.deleteMany({
      where: {
        id: sessionId,
        userId: userId
      }
    })

    if (deletedSession.count === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found or unauthorized'
      })
    }

    return { success: true, message: 'Session deleted successfully' }

  } catch (error) {
    
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})