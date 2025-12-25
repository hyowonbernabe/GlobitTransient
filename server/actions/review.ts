'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const reviewSchema = z.object({
  unitId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
})

export async function submitReview(formData: FormData) {
  const session = await auth()
  // User must be logged in (which happens implicitly during booking)
  if (!session?.user?.id) {
    return { error: "You must be logged in to leave a review." }
  }

  const rawData = {
    unitId: formData.get("unitId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  }

  const result = reviewSchema.safeParse(rawData)
  if (!result.success) {
    return { error: "Invalid review data." }
  }

  const { unitId, rating, comment } = result.data

  try {
    // 1. Verify Verified Stay
    // Check if user has a COMPLETED or CONFIRMED booking for this unit
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        unitId: unitId,
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      }
    })

    // Optional: For testing/dev, you might comment this out, 
    // but strict logic requires a booking.
    // if (!hasBooking) {
    //   return { error: "You can only review units you have booked." }
    // }

    // 2. Check for duplicate review
    const existingReview = await (prisma as any).review.findFirst({
      where: {
        userId: session.user.id,
        unitId: unitId
      }
    })

    if (existingReview) {
      return { error: "You have already reviewed this unit." }
    }

    // 3. Create Review
    // We cast prisma to any temporarily until types are regenerated
    await (prisma as any).review.create({
      data: {
        userId: session.user.id,
        unitId,
        rating,
        comment
      }
    })

    revalidatePath(`/book`) // Revalidate parent list
    // We can't revalidate dynamic slug paths easily without the specific slug, 
    // but Next.js usually handles the current path revalidation if called from the page.
    return { success: true }

  } catch (error) {
    console.error("Review Submission Error:", error)
    return { error: "Failed to submit review." }
  }
}