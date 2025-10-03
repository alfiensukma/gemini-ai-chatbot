import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId } = query

    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session._count.messages,
      lastMessage: session.messages[0]?.content || 'No messages yet'
    }))

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})