import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '~/lib/prisma'

/**
 * POST /api/chat/generate-title
 * Generate a short, relevant title for a chat session based on the first message
 */
export default defineEventHandler(async (event) => {
  try {
    const { sessionId, firstMessage } = await readBody(event)

    if (!sessionId || !firstMessage) {
      throw createError({
        statusCode: 400,
        message: 'Session ID and first message are required'
      })
    }

    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey as string
    
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'Gemini API key not configured'
      })
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `Based on this user message, generate a short, concise title (max 6 words) in Bahasa Indonesia that summarizes the topic. Only return the title, nothing else.

User message: "${firstMessage}"

Title:`

    const result = await model.generateContent(prompt)
    const response = result.response
    let title = response.text().trim()

    title = title.replace(/^["']|["']$/g, '')
    
    if (title.length > 50) {
      title = title.substring(0, 47) + '...'
    }
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    })

    return {
      success: true,
      title
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Failed to generate title'
    })
  }
})
