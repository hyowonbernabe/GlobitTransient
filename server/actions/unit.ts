'use server'

import prisma from "@/lib/prisma"
import { unitSchema } from "@/lib/validations/unit"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateUnit(unitId: string, formData: FormData) {
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
        ...data,
        basePrice: data.basePrice * 100, 
        extraPaxPrice: data.extraPaxPrice * 100,
      }
    })

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
  }

  const result = unitSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Validation failed." }
  }

  try {
    const data = result.data
    
    // Generate a slug from the name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)

    await prisma.unit.create({
      data: {
        ...data,
        slug,
        basePrice: data.basePrice * 100,
        extraPaxPrice: data.extraPaxPrice * 100,
        images: ['/assets/images/placeholder.png'] // Default placeholder
      }
    })

    revalidatePath("/admin/units")
    revalidatePath("/book")
    return { success: true }
  } catch (error) {
    console.error("Create Unit Error:", error)
    return { error: "Failed to create unit." }
  }
}

export async function deleteUnit(unitId: string) {
  try {
    // Check if unit has active bookings?
    // Prisma will throw foreign key error if bookings exist unless cascade delete is on.
    // Usually safer to check first.
    const activeBookings = await prisma.booking.findFirst({
        where: { 
            unitId,
            status: { in: ['CONFIRMED', 'PENDING'] }
        }
    })

    if (activeBookings) {
        return { error: "Cannot delete unit with active bookings." }
    }

    await prisma.unit.delete({
      where: { id: unitId }
    })

    revalidatePath("/admin/units")
    revalidatePath("/book")
    return { success: true }
  } catch (error) {
    console.error("Delete Unit Error:", error)
    return { error: "Failed to delete unit." }
  }
}