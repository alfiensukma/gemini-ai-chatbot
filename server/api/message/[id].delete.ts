import { prisma } from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Message ID is required",
      });
    }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!message) {
      throw createError({
        statusCode: 404,
        message: "Message not found",
      });
    }

    await prisma.message.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Message deleted successfully",
      deletedMessageId: id,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to delete message",
    });
  }
});
