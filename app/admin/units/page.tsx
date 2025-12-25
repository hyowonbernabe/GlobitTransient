import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { deleteUnit } from '@/server/actions/unit'
import { CreateUnitDialog } from '@/components/admin/CreateUnitDialog'

export const dynamic = 'force-dynamic'

async function getUnits() {
  return await prisma.unit.findMany({
    orderBy: { name: 'asc' }
  })
}

export default async function UnitsPage() {
  const units = await getUnits()

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val / 100)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit Management</h1>
          <p className="text-gray-500">Manage your rooms, pricing, and amenities.</p>
        </div>
        <CreateUnitDialog />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Unit Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead className="hidden md:table-cell">Amenities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">
                  {unit.name}
                  <div className="md:hidden text-xs text-gray-500 mt-1">
                    {formatMoney(unit.basePrice)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>Good for: {unit.basePax}</span>
                    <span className="text-gray-400 text-xs">Max: {unit.maxPax}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-emerald-700">
                  {formatMoney(unit.basePrice)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {unit.hasOwnCR && <Badge variant="secondary" className="text-[10px]">CR</Badge>}
                    {unit.hasTV && <Badge variant="secondary" className="text-[10px]">TV</Badge>}
                    {unit.hasHeater && <Badge variant="secondary" className="text-[10px]">Heater</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/units/${unit.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                    </Link>
                    <form action={async () => {
                        'use server'
                        await deleteUnit(unit.id)
                    }}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}