import prisma from '@/lib/prisma'

export async function getSystemContext() {
  // 1. Fetch all Units
  const units = await prisma.unit.findMany({
    select: {
      name: true,
      basePrice: true,
      basePax: true,
      maxPax: true,
      extraPaxPrice: true,
      hasTV: true,
      hasRef: true,
      hasHeater: true,
      hasOwnCR: true,
      description: true
    }
  })

  // 2. Fetch Dynamic Knowledge Base
  // Use try-catch or cast because table might be empty/new
  let snippets = []
  try {
    snippets = await (prisma as any).knowledgeSnippet.findMany({
      orderBy: { category: 'asc' }
    })
  } catch (e) {
    // Fallback if table doesn't exist yet or error
    console.warn("Could not fetch knowledge snippets", e)
  }

  // 3. Format Units
  const unitText = units.map(u => `
- Unit: ${u.name}
  - Price: PHP ${u.basePrice / 100} (Good for ${u.basePax} pax)
  - Extra Pax: PHP ${u.extraPaxPrice / 100}/head
  - Max Capacity: ${u.maxPax}
  - Amenities: ${u.hasOwnCR ? 'Own CR' : 'Common CR'}, ${u.hasTV ? 'TV' : 'No TV'}, ${u.hasRef ? 'Fridge' : 'No Fridge'}, ${u.hasHeater ? 'Heater' : 'No Heater'}
  - Details: ${u.description}
`).join('\n')

  // 4. Format Snippets
  const knowledgeText = snippets.length > 0 
    ? snippets.map((s: any) => `- [${s.category}]: ${s.content}`).join('\n')
    : `- Rules: Check-in 2PM, Check-out 12PM. 50% Downpayment required.` // Default fallback

  // 5. Construct System Prompt
  return `
You are the friendly and helpful virtual assistant for Globit Transient House in Baguio City.
Your goal is to help guests choose a room and answer their questions using ONLY the information below.

### AVAILABLE UNITS
${unitText}

### HOUSE RULES & KNOWLEDGE BASE
${knowledgeText}

### INSTRUCTIONS
- Answer concisely and politely.
- If a guest asks for a room for X people, suggest the best fitting unit from the list above.
- If the answer is not in the list above, apologize and say you don't know, but they can contact the admin at 0917 123 4567.
- Do NOT make up facts.
- Prices are in Philippine Peso (PHP).
- Always maintain a warm, "Baguio-friendly" tone.
`
}