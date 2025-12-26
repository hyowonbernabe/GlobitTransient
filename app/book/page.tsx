import prisma from "@/lib/prisma"
import { WizardContainer } from "@/components/booking/wizard/WizardContainer"
import { Metadata } from "next"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book Your Stay | Globit Transient',
  description: 'Find the perfect unit for your Baguio getaway.',
}

export default async function BookingPage() {
  // Fetch all units to pass to the client-side wizard
  const units = await prisma.unit.findMany({
    orderBy: {
      basePrice: 'asc'
    }
  })

  return (
    <div className="w-full h-full">
      <WizardContainer initialUnits={units} />
    </div>
  )
}