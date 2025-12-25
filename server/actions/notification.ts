'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    // Cast prisma to any to allow access to 'notification' model 
    // before client regeneration completes
    const notifications = await (prisma as any).notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    return notifications
  } catch (error) {
    console.error("Fetch Notifications Error:", error)
    return []
  }
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return

  try {
    await (prisma as any).notification.updateMany({
      where: { 
        userId: session.user.id,
        isRead: false
      },
      data: { isRead: true }
    })
    revalidatePath("/admin")
    revalidatePath("/portal")
  } catch (error) {
    console.error("Mark Read Error:", error)
  }
}

// Internal helper to spawn notifications
export async function createNotification(userId: string, title: string, message: string, link?: string) {
  try {
    await (prisma as any).notification.create({
      data: {
        userId,
        title,
        message,
        link
      }
    })
  } catch (error) {
    console.error("Create Notification Error:", error)
  }
}