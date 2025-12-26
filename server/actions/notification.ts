'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
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

// Internal helper: Notify a specific user
export async function createNotification(userId: string, title: string, message: string, link?: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO') {
  try {
    await (prisma as any).notification.create({
      data: {
        userId,
        title,
        message,
        link,
        type
      }
    })
  } catch (error) {
    console.error("Create Notification Error:", error)
  }
}

// Internal helper: Notify ALL Admins
export async function notifyAdmins(title: string, message: string, link?: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO') {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    })

    if (admins.length === 0) return

    // Create notifications in batch
    await (prisma as any).notification.createMany({
      data: admins.map((admin: any) => ({
        userId: admin.id,
        title,
        message,
        link,
        type
      }))
    })
  } catch (error) {
    console.error("Notify Admins Error:", error)
  }
}