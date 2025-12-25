import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EditUnitForm } from '@/components/admin/EditUnitForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditUnitPage(props: PageProps) {
  const params = await props.params;
  const unit = await prisma.unit.findUnique({
    where: { id: params.id },
  })

  if (!unit) return notFound()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/units">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Unit: {unit.name}</h1>
      </div>

      <EditUnitForm unit={unit} />
    </div>
  )
}