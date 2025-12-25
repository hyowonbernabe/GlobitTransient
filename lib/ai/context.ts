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

  // 2. Format Units into Text
  const unitText = units.map(u => `
- Unit: ${u.name}
  - Price: PHP ${u.basePrice / 100} (Good for ${u.basePax} pax)
  - Extra Pax: PHP ${u.extraPaxPrice / 100}/head
  - Max Capacity: ${u.maxPax}
  - Amenities: ${u.hasOwnCR ? 'Own CR' : 'Common CR'}, ${u.hasTV ? 'TV' : 'No TV'}, ${u.hasRef ? 'Fridge' : 'No Fridge'}, ${u.hasHeater ? 'Heater' : 'No Heater'}
  - Details: ${u.description}
`).join('\n')

  // 3. Static House Rules (Could be DB driven later)
  const rules = `
- Check-in: 2:00 PM
- Check-out: 12:00 PM (Noon)
- Parking: Strictly 1 slot available (First come first served).
- Pets: Allowed but must wear diapers.
- Downpayment: 50% required to confirm. Non-refundable.
- Location: Near Burnham Park, Baguio City.
- Contact: 0917 123 4567 / inquire@globit.com
  `

  // 4. Construct System Prompt
  return `
You are the friendly and helpful virtual assistant for Globit Transient House in Baguio City.
Your goal is to help guests choose a room and answer their questions using ONLY the information below.

### AVAILABLE UNITS
${unitText}

### HOUSE RULES & POLICIES
${rules}

### INSTRUCTIONS
- Answer concisely and politely.
- If a guest asks for a room for X people, suggest the best fitting unit from the list above.
- If the answer is not in the list above, apologize and say you don't know, but they can contact the admin at 0917 123 4567.
- Do NOT make up facts.
- Prices are in Philippine Peso (PHP).
- Always maintain a warm, "Baguio-friendly" tone.
`
}