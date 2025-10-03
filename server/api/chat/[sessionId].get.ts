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

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: userId
      }
    })

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found'
      })
    }

    const messages = await prisma.message.findMany({
      where: {
        sessionId: sessionId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return {
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt
      },
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt,
        isEdited: (msg as any).isEdited || false,
        editedAt: (msg as any).editedAt,
        originalContent: (msg as any).originalContent,
        parentMessageId: msg.parentMessageId
      }))
    }

  } catch (error) {
    
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})