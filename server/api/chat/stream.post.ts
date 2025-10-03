import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { messages, sessionId, userId, model = 'gemini-2.0-flash', images } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Messages array is required'
      })
    }

    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey as string
    
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini API key not configured'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    let session = null

    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: userId
        }
      })
    }

    if (!session) {
      const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Chat'
      session = await prisma.chatSession.create({
        data: {
          title: firstUserMessage.length > 50 
            ? firstUserMessage.substring(0, 47) + '...' 
            : firstUserMessage,
          userId: userId
        }
      })
    }

    setHeader(event, 'X-Session-Id', session.id)
    const googleAI = createGoogleGenerativeAI({ apiKey })
    const gemini = googleAI(model)
    const formattedMessages = messages.map((msg, index) => {
      if (msg.role === 'user' && index === messages.length - 1 && images && images.length > 0) {
        const contentParts: any[] = []
        images.forEach((img: any) => {
          contentParts.push({
            type: 'image',
            image: img.data
          })
        })
        
        contentParts.push({
          type: 'text',
          text: msg.content
        })
        
        return {
          role: 'user' as const,
          content: contentParts
        }
      }
      
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }
    })

    const result = await streamText({
      model: gemini,
      messages: formattedMessages,
      temperature: 0.7,
      onFinish: async (result) => {
        try {
          const existingSession = await prisma.chatSession.findUnique({
            where: { id: session!.id }
          })

          if (!existingSession) {
            return
          }
          
          const existingMessages = await prisma.message.findMany({
            where: { sessionId: existingSession.id },
            orderBy: { createdAt: 'desc' },
            take: 5
          })

          const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0]
          if (lastUserMessage) {
            const userMessageExists = existingMessages.some(
              m => m.role === 'user' && m.content === lastUserMessage.content
            )
            
            if (!userMessageExists) {
              await prisma.message.create({
                data: {
                  content: lastUserMessage.content,
                  role: 'user',
                  sessionId: existingSession.id
                }
              })
            }
          }
          
          await prisma.message.create({
            data: {
              content: result.text,
              role: 'assistant',
              sessionId: existingSession.id
            }
          })

          await prisma.chatSession.update({
            where: { id: existingSession.id },
            data: { updatedAt: new Date() }
          })
          
        } catch (dbError) {
          console.error('Error saving messages:', dbError)
        }
      }
    })

    return result.toTextStreamResponse()

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})