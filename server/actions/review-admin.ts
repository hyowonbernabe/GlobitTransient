'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/server/actions/audit"

export async function deleteReview(reviewId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { 
        unit: { select: { name: true } },
        user: { select: { name: true } }
      }
    })

    if (!review) return { error: "Review not found" }

    await prisma.review.delete({
      where: { id: reviewId }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "DELETE_REVIEW",
      "REVIEW",
      reviewId,
      `Deleted review for ${review.unit.name} by ${review.user.name}`
    )

    revalidatePath("/admin/reviews")
    revalidatePath("/book") // Update public pages where reviews appear
    return { success: true }
  } catch (error) {
    console.error("Delete Review Error:", error)
    return { error: "Failed to delete review." }
  }
}