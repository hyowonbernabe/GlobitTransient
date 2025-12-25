import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const units = [
  {
    name: 'Big House',
    slug: 'big-house',
    description: 'Perfect for large family reunions or team buildings. Exclusive use of the main house.',
    images: ['/images/big-house-main.jpg'],
    maxPax: 20,
    basePrice: 1500000, // Stored in centavos (15,000.00) - adjust as needed for "Custom"
    basePax: 10,
    extraPaxPrice: 50000, // 500.00
    hasTV: true,
    hasRef: true,
    hasHeater: true,
    hasOwnCR: true,
  },
  {
    name: 'Veranda Unit',
    slug: 'veranda-unit',
    description: 'Spacious unit with a private veranda and great view.',
    images: ['/images/veranda.jpg'],
    maxPax: 6,
    basePrice: 150000, // 1,500.00
    basePax: 3,
    extraPaxPrice: 50000, // 500.00
    hasTV: true,
    hasRef: true,
    hasHeater: true,
    hasOwnCR: true,
  },
  {
    name: '3F Unit 3',
    slug: '3f-unit-3',
    description: 'Cozy unit on the third floor.',
    images: ['/images/unit3.jpg'],
    maxPax: 8,
    basePrice: 150000,
    basePax: 3,
    extraPaxPrice: 50000,
    hasTV: true,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: true,
  },
  {
    name: '3F Unit 6',
    slug: '3f-unit-6',
    description: 'Third floor unit with complete amenities.',
    images: ['/images/unit6.jpg'],
    maxPax: 8,
    basePrice: 150000,
    basePax: 3,
    extraPaxPrice: 50000,
    hasTV: true,
    hasRef: true,
    hasHeater: true,
    hasOwnCR: true,
  },
  {
    name: '3F Unit 7',
    slug: '3f-unit-7',
    description: 'Third floor unit suitable for medium groups.',
    images: ['/images/unit7.jpg'],
    maxPax: 6,
    basePrice: 150000,
    basePax: 3,
    extraPaxPrice: 50000,
    hasTV: true,
    hasRef: true,
    hasHeater: true,
    hasOwnCR: true,
  },
  {
    name: 'Unit 10 (4 Pax)',
    slug: 'unit-10-4pax',
    description: 'Standard unit for small families.',
    images: ['/images/unit10.jpg'],
    maxPax: 4,
    basePrice: 150000,
    basePax: 2,
    extraPaxPrice: 50000,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: true,
  },
  {
    name: 'Unit 10 (2 Pax)',
    slug: 'unit-10-2pax',
    description: 'Budget friendly unit for couples.',
    images: ['/images/unit10.jpg'],
    maxPax: 2,
    basePrice: 150000,
    basePax: 2,
    extraPaxPrice: 0,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: true,
  },
  {
    name: 'Small Rm 1',
    slug: 'small-rm-1',
    description: 'Backpacker style room.',
    images: ['/images/small1.jpg'],
    maxPax: 2,
    basePrice: 100000, // 1,000.00
    basePax: 2,
    extraPaxPrice: 0,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: false, // Common CR
  },
  {
    name: 'Small Rm 2',
    slug: 'small-rm-2',
    description: 'Backpacker style room.',
    images: ['/images/small2.jpg'],
    maxPax: 2,
    basePrice: 100000,
    basePax: 2,
    extraPaxPrice: 0,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: false,
  },
  {
    name: 'Small Rm 3',
    slug: 'small-rm-3',
    description: 'Backpacker style room.',
    images: ['/images/small3.jpg'],
    maxPax: 2,
    basePrice: 100000,
    basePax: 2,
    extraPaxPrice: 0,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: false,
  },
  {
    name: 'Dbl Deck Rm 1',
    slug: 'dbl-deck-rm-1',
    description: 'Room with double deck beds.',
    images: ['/images/deck1.jpg'],
    maxPax: 4,
    basePrice: 100000,
    basePax: 2,
    extraPaxPrice: 50000,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: false,
  },
  {
    name: 'Dbl Deck Rm 2',
    slug: 'dbl-deck-rm-2',
    description: 'Room with double deck beds.',
    images: ['/images/deck2.jpg'],
    maxPax: 4,
    basePrice: 100000,
    basePax: 2,
    extraPaxPrice: 50000,
    hasTV: false,
    hasRef: false,
    hasHeater: false,
    hasOwnCR: false,
  },
]

async function main() {
  console.log('Start seeding ...')
  
  for (const unit of units) {
    const result = await prisma.unit.upsert({
      where: { slug: unit.slug },
      update: unit,
      create: unit,
    })
    console.log(`Created/Updated unit: ${result.name}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })