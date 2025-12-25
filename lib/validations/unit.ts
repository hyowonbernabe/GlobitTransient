import { z } from "zod"

export const unitSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  basePax: z.coerce.number().min(1),
  maxPax: z.coerce.number().min(1),
  extraPaxPrice: z.coerce.number().min(0),
  hasTV: z.boolean(),
  hasRef: z.boolean(),
  hasHeater: z.boolean(),
  hasOwnCR: z.boolean(),
})

export type UnitFormValues = z.infer<typeof unitSchema>