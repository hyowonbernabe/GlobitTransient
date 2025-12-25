'use server'

import prisma from "@/lib/prisma"
import { unitSchema } from "@/lib/validations/unit"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { logActivity } from "@/server/actions/audit"

export async function updateUnit(unitId: string, formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  // Parse images separately as getAll returns string[]
  const images = formData.getAll("images").map(i => i.toString()).filter(i => i.length > 0)

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    basePax: formData.get("basePax"),
    maxPax: formData.get("maxPax"),
    extraPaxPrice: formData.get("extraPaxPrice"),
    hasTV: formData.get("hasTV") === "on",
    hasRef: formData.get("hasRef") === "on",
    hasHeater: formData.get("hasHeater") === "on",
    hasOwnCR: formData.get("hasOwnCR") === "on",
    images: images, 
  }

  const result = unitSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Validation failed. Please check your inputs." }
  }

  try {
    const data = result.data
    
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        name: data.name,
        description: data.description,
        basePax: data.basePax,
        maxPax: data.maxPax,
        hasTV: data.hasTV,
        hasRef: data.hasRef,
        hasHeater: data.hasHeater,
        hasOwnCR: data.hasOwnCR,
        basePrice: data.basePrice * 100, 
        extraPaxPrice: data.extraPaxPrice * 100,
        // Only update images if provided, otherwise keep existing? 
        // No, in this UI we send the full list every time, so we overwrite.
        images: data.images && data.images.length > 0 ? data.images : undefined
      }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "UPDATE_UNIT",
      "UNIT",
      unitId,
      `Updated details for ${data.name}`
    )

    revalidatePath("/admin/units")
    revalidatePath(`/admin/units/${unitId}`)
    revalidatePath("/book")
  } catch (error) {
    console.error("Update Unit Error:", error)
    return { error: "Failed to update unit." }
  }

  redirect("/admin/units")
}

export async function createUnit(formData: FormData) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  const images = formData.getAll("images").map(i => i.toString()).filter(i => i.length > 0)

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    basePax: formData.get("basePax"),
    maxPax: formData.get("maxPax"),
    extraPaxPrice: formData.get("extraPaxPrice"),
    hasTV: formData.get("hasTV") === "on",
    hasRef: formData.get("hasRef") === "on",
    hasHeater: formData.get("hasHeater") === "on",
    hasOwnCR: formData.get("hasOwnCR") === "on",
    images: images,
  }

  const result = unitSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Validation failed." }
  }

  try {
    const data = result.data
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)

    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        basePax: data.basePax,
        maxPax: data.maxPax,
        hasTV: data.hasTV,
        hasRef: data.hasRef,
        hasHeater: data.hasHeater,
        hasOwnCR: data.hasOwnCR,
        basePrice: data.basePrice * 100,
        extraPaxPrice: data.extraPaxPrice * 100,
        images: data.images && data.images.length > 0 ? data.images : ['/assets/images/placeholder.png'] 
      }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "CREATE_UNIT",
      "UNIT",
      unit.id,
      `Created unit: ${data.name}`
    )

    revalidatePath("/admin/units")
    revalidatePath("/book")
    return { success: true }
  } catch (error) {
    console.error("Create Unit Error:", error)
    return { error: "Failed to create unit." }
  }
}

export async function deleteUnit(unitId: string) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    const activeBookings = await prisma.booking.findFirst({
        where: { 
            unitId,
            status: { in: ['CONFIRMED', 'PENDING'] }
        }
    })

    if (activeBookings) {
        return { error: "Cannot delete unit with active bookings." }
    }

    const unit = await prisma.unit.delete({
      where: { id: unitId }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "DELETE_UNIT",
      "UNIT",
      unitId,
      `Deleted unit: ${unit.name}`
    )

    revalidatePath("/admin/units")
    revalidatePath("/book")
    return { success: true }
  } catch (error) {
    console.error("Delete Unit Error:", error)
    return { error: "Failed to delete unit." }
  }
}