'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/server/auth"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/server/actions/audit"

export async function createSnippet(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  const category = formData.get('category') as string
  const content = formData.get('content') as string

  if (!content || !category) {
    return { error: "Category and Content are required." }
  }

  try {
    // We cast to any because KnowledgeSnippet might not be in the generated client types yet
    // depending on if you ran `npx prisma generate` recently.
    await (prisma as any).knowledgeSnippet.create({
      data: {
        category,
        content
      }
    })

    // AUDIT LOG
    await logActivity(
      session.user.id!,
      "ADD_KNOWLEDGE",
      "AI",
      category,
      `Added snippet: ${content.substring(0, 30)}...`
    )

    revalidatePath("/admin/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Create Snippet Error:", error)
    return { error: "Failed to add knowledge." }
  }
}

export async function deleteSnippet(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    await (prisma as any).knowledgeSnippet.delete({
      where: { id }
    })

    await logActivity(
      session.user.id!,
      "DELETE_KNOWLEDGE",
      "AI",
      id,
      "Deleted knowledge snippet"
    )

    revalidatePath("/admin/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Delete Snippet Error:", error)
    return { error: "Failed to delete snippet." }
  }
}