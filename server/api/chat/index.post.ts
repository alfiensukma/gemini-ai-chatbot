import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { messages, sessionId, userId, model } = await readBody(event)

    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Messages are required'
      })
    }

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User ID is required'
      })
    }

    const config = useRuntimeConfig()
    if (!config.geminiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Gemini API key not configured'
      })
    }

    let chatSession
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId }
      })
    }

    if (!chatSession) {
      const firstMessage = messages[0]?.content || 'New Chat'
      const title = firstMessage.length > 50 
        ? firstMessage.substring(0, 47) + '...' 
        : firstMessage

      chatSession = await prisma.chatSession.create({
        data: {
          title,
          userId
        }
      })
    }

    const userMessage = messages[messages.length - 1]
    await prisma.message.create({
      data: {
        content: userMessage.content,
        role: 'user',
        sessionId: chatSession.id
      }
    })

    const googleAI = createGoogleGenerativeAI({
      apiKey: config.geminiApiKey as string,
    })

    const formattedMessages = messages
      .filter((msg: any) => msg.content && msg.content.trim())
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role,
        content: msg.content
      }))

    const selectedModel = model || 'gemini-2.0-flash'

    const result = await streamText({
      model: googleAI(selectedModel),
      messages: formattedMessages,
      temperature: 0,
    })

    const encoder = new TextEncoder()
    let aiResponse = ''
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            aiResponse += chunk
            controller.enqueue(encoder.encode(chunk))
          }
          
          await prisma.message.create({
            data: {
              content: aiResponse,
              role: 'assistant',
              sessionId: chatSession!.id
            }
          })
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': chatSession.id,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})