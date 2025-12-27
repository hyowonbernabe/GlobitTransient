import { z } from "zod"

export const createBookingSchema = z.object({
  unitId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  pax: z.number().min(1), // Total paying guests (Adults + Kids > 3)
  toddlers: z.number().min(0).optional(), // Not counted in pax, strictly for check-in info
  guestName: z.string().min(2, "Name is required"),
  guestMobile: z.string().min(10, "Valid mobile number required"),
  guestEmail: z.string().email().optional().or(z.literal("")),
  hasCar: z.boolean(),
  hasPet: z.boolean(),
  hasPWD: z.boolean(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>