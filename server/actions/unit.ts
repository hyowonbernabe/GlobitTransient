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
    // Store prices in centavos
    const data = result.data
    
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        ...data,
        // Ensure numbers are stored correctly if you handle conversion in the form.
        // Assuming the form sends raw integers (e.g. 150000 for 1,500.00), 
        // we just save them directly. If the form sends 1500, multiply by 100 here.
        // For this implementation, let's assume the Admin types the full PHP amount
        // and we convert to centavos here for safety.
        basePrice: data.basePrice * 100, 
        extraPaxPrice: data.extraPaxPrice * 100,
      }
    })

    revalidatePath("/admin/units")
    revalidatePath(`/admin/units/${unitId}`)
    revalidatePath("/book") // Update public listing
  } catch (error) {
    console.error("Update Unit Error:", error)
    return { error: "Failed to update unit." }
  }

  redirect("/admin/units")
}