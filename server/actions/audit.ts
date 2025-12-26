'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/server/auth'

// Helper function to be used internally by other server actions
export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  try {
    // We cast prisma to any temporarily if types aren't regenerated yet
    await (prisma as any).auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details
      }
    })
  } catch (error) {
    console.error("Audit Log Error:", error)
    // We don't throw here to avoid breaking the main user flow if logging fails
  }
}

// Action for the Admin UI to fetch logs
export async function getAuditLogs() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') return []

  try {
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 for performance
      include: {
        user: {
          select: { name: true, role: true }
        }
      }
    })
    return logs
  } catch (error) {
    console.error("Fetch Audit Logs Error:", error)
    return []
  }
}