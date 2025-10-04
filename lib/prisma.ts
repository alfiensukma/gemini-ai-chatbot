import Prisma from '@prisma/client'
const { PrismaClient } = Prisma

declare global {
  var __prisma: InstanceType<typeof PrismaClient> | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}