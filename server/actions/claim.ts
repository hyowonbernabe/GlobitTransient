"use server"

import { auth } from "@/server/auth"
import prisma from "@/lib/prisma"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

// Submit a claim request with proof image
export async function submitClaimRequest(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== "AGENT") {
        return { error: "Unauthorized" }
    }

    const bookingId = formData.get("bookingId") as string
    const description = formData.get("description") as string
    const proofImage = formData.get("proofImage") as File | null

    if (!bookingId || !description) {
        return { error: "Booking ID and description are required" }
    }

    try {
        // Check if booking exists and is not already claimed
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { agent: true, claimRequests: true },
        })

        if (!booking) {
            return { error: "Booking not found" }
        }

        if (booking.agentId) {
            return { error: "This booking is already claimed" }
        }

        // Check if agent already has a pending claim for this booking
        const existingClaim = booking.claimRequests.find(
            (c) => c.agentId === session.user.id && c.status === "PENDING"
        )

        if (existingClaim) {
            return { error: "You already have a pending claim for this booking" }
        }

        // Upload proof image if provided
        let proofImageUrl: string | null = null
        if (proofImage && proofImage.size > 0) {
            const blob = await put(`claims/${Date.now()}-${proofImage.name}`, proofImage, {
                access: "public",
            })
            proofImageUrl = blob.url
        }

        // Create claim request
        const claimRequest = await prisma.claimRequest.create({
            data: {
                bookingId,
                agentId: session.user.id!,
                description,
                proofImage: proofImageUrl,
                status: "PENDING",
            },
        })

        // Notify admins
        const admins = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true },
        })

        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                title: "New Claim Request",
                message: `Agent ${session.user.name} submitted a claim for booking ${booking.id.slice(0, 8)}`,
                type: "CLAIM_SUBMITTED",
                link: `/dashboard/claims`,
                adminOnly: true,
            })),
        })

        revalidatePath("/dashboard/claims")
        return { success: true, claimId: claimRequest.id }
    } catch (error) {
        console.error("Error submitting claim:", error)
        return { error: "Failed to submit claim" }
    }
}

// Get claim requests (filtered by role)
export async function getClaimRequests() {
    const session = await auth()
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "AGENT")) {
        return { error: "Unauthorized" }
    }

    try {
        const claims = await prisma.claimRequest.findMany({
            where: session.user.role === "AGENT" ? { agentId: session.user.id } : {},
            include: {
                agent: { select: { name: true, email: true } },
                booking: {
                    select: {
                        id: true,
                        checkIn: true,
                        checkOut: true,
                        totalPrice: true,
                        user: { select: { name: true } },
                        unit: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return { claims }
    } catch (error) {
        console.error("Error fetching claims:", error)
        return { error: "Failed to fetch claims" }
    }
}

// Approve claim request (admin only)
export async function approveClaimRequest(claimId: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        const claim = await prisma.claimRequest.findUnique({
            where: { id: claimId },
            include: {
                booking: { include: { agent: true, unit: true } },
                agent: true,
            },
        })

        if (!claim) {
            return { error: "Claim not found" }
        }

        if (claim.status !== "PENDING") {
            return { error: "This claim has already been reviewed" }
        }

        // Update booking with agent
        await prisma.booking.update({
            where: { id: claim.bookingId },
            data: { agentId: claim.agentId },
        })

        // Calculate commission (5% default)
        const commissionRate = claim.agent.commissionRate || 0.05
        const commissionAmount = Math.floor(claim.booking.totalPrice * commissionRate)

        // Create commission record
        await prisma.commission.create({
            data: {
                bookingId: claim.booking.id,
                agentId: claim.agentId,
                amount: commissionAmount,
                status: "PENDING",
            },
        })

        // Update claim status
        await prisma.claimRequest.update({
            where: { id: claimId },
            data: {
                status: "APPROVED",
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
            },
        })

        // Notify agent
        await prisma.notification.create({
            data: {
                userId: claim.agentId,
                title: "Claim Approved",
                message: `Your claim for booking ${claim.booking.id.slice(0, 8)} at ${claim.booking.unit.name} has been approved. Commission: ₱${(commissionAmount / 100).toFixed(2)}`,
                type: "CLAIM_APPROVED",
                link: `/dashboard/commissions`,
            },
        })

        revalidatePath("/dashboard/claims")
        revalidatePath("/dashboard/commissions")
        return { success: true }
    } catch (error) {
        console.error("Error approving claim:", error)
        return { error: "Failed to approve claim" }
    }
}

// Reject claim request (admin only)
export async function rejectClaimRequest(claimId: string, reason?: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        const claim = await prisma.claimRequest.findUnique({
            where: { id: claimId },
            include: { booking: true, agent: true },
        })

        if (!claim) {
            return { error: "Claim not found" }
        }

        if (claim.status !== "PENDING") {
            return { error: "This claim has already been reviewed" }
        }

        // Update claim status
        await prisma.claimRequest.update({
            where: { id: claimId },
            data: {
                status: "REJECTED",
                reviewedBy: session.user.id,
                reviewedAt: new Date(),
                description: reason ? `${claim.description}\n\nRejection reason: ${reason}` : claim.description,
            },
        })

        // Notify agent
        await prisma.notification.create({
            data: {
                userId: claim.agentId,
                title: "Claim Rejected",
                message: `Your claim for booking ${claim.booking.id.slice(0, 8)} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
                type: "CLAIM_REJECTED",
                link: `/dashboard/claims`,
            },
        })

        revalidatePath("/dashboard/claims")
        return { success: true }
    } catch (error) {
        console.error("Error rejecting claim:", error)
        return { error: "Failed to reject claim" }
    }
}

// Search for unclaimed bookings (agent only)
export async function searchUnclaimedBookings(query: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "AGENT") {
        return { error: "Unauthorized" }
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                agentId: null, // Not claimed
                status: { in: ["CONFIRMED", "COMPLETED"] },
                OR: [
                    { id: { contains: query, mode: "insensitive" } },
                    { user: { name: { contains: query, mode: "insensitive" } } },
                    { unit: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            include: {
                user: { select: { name: true, mobile: true } },
                unit: { select: { name: true } },
            },
            take: 10,
            orderBy: { createdAt: "desc" },
        })

        return { bookings }
    } catch (error) {
        console.error("Error searching bookings:", error)
        return { error: "Failed to search bookings" }
    }
}
