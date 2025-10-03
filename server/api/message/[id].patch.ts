import { prisma } from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Message ID is required",
      });
    }

    const { content, createBranch } = body;

    if (!content?.trim()) {
      throw createError({
        statusCode: 400,
        message: "Content is required",
      });
    }

    const originalMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!originalMessage) {
      throw createError({
        statusCode: 404,
        message: "Message not found",
      });
    }

    if (createBranch) {
      const newBranch = await (prisma.message.create as any)({
        data: {
          content: content.trim(),
          role: originalMessage.role,
          sessionId: originalMessage.sessionId,
          parentMessageId: originalMessage.parentMessageId,
          isEdited: true,
          editedAt: new Date(),
          originalContent: originalMessage.content,
        },
      });

      return {
        success: true,
        message: newBranch,
        branched: true,
      };
    } else {
      const updatedMessage = await (prisma.message.update as any)({
        where: { id },
        data: {
          content: content.trim(),
          isEdited: true,
          editedAt: new Date(),
          originalContent: (originalMessage as any).isEdited
            ? (originalMessage as any).originalContent
            : originalMessage.content,
        },
      });

      return {
        success: true,
        message: updatedMessage,
        branched: false,
      };
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to update message",
    });
  }
});
