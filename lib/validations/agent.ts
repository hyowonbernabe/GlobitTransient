import { z } from "zod"

export const agentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Valid mobile number required"),
  // Password is optional for updates, required for creation (handled in action logic or separate schemas)
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  commissionRate: z.coerce.number().min(0).max(100, "Rate must be between 0 and 100"),
  agentCode: z.string().min(3, "Agent code must be at least 3 characters").optional().or(z.literal("")),
})

export type AgentFormValues = z.infer<typeof agentSchema>