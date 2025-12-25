import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

const units = [
  {
    name: 'Big House',
    slug: 'big-house',
    description: 'Perfect for large family reunions or team buildings. Exclusive use of the main house.',
    images: ['/assets/images/placeholder.png'],
    maxPax: 20,
    basePrice: 1500000, 
    basePax: 10,
    extraPaxPrice: 50000, 
    hasTV: true,
    hasRef: true,
    hasHeater: true,
    hasOwnCR: true,
  },
  {
    name: 'Veranda Unit',
    slug: 'veranda-unit',
    description: 'Spacious unit with a private veranda and great view.',
    images: ['/assets/images/placeholder.png'],
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
    name: '3F Unit 3',
    slug: '3f-unit-3',
    description: 'Cozy unit on the third floor.',
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    name: 'Small Rm 2',
    slug: 'small-rm-2',
    description: 'Backpacker style room.',
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
    images: ['/assets/images/placeholder.png'],
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
  
  // 1. Seed Units
  for (const unit of units) {
    const result = await prisma.unit.upsert({
      where: { slug: unit.slug },
      update: unit,
      create: unit,
    })
    console.log(`Created/Updated unit: ${result.name}`)
  }

  // 2. Seed Admin User
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@globit.com' },
    update: {
      password: hashedPassword, // Ensure password is set if user exists
      role: 'ADMIN'
    },
    create: {
      email: 'admin@globit.com',
      name: 'Globit Admin',
      password: hashedPassword,
      role: 'ADMIN',
      mobile: '09170000000'
    }
  })
  console.log(`Created/Updated Admin: ${admin.email}`)
  
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