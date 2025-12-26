import prisma from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, MessageSquare } from 'lucide-react'
import { deleteReview } from '@/server/actions/review-admin'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getAllReviews() {
  return await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      unit: {
        select: { name: true }
      },
      user: {
        select: { name: true, email: true }
      }
    }
  })
}

export default async function ReviewsPage() {
  const reviews = await getAllReviews()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
          <p className="text-gray-500">Monitor and moderate guest feedback.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[40%]">Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                            <span>No reviews submitted yet.</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : (
                reviews.map((review) => (
                <TableRow key={review.id}>
                    <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span>{review.user.name || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">{review.user.email}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-emerald-800 font-medium">
                        {review.unit.name}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-700">{review.rating}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <p className="text-sm text-gray-600 line-clamp-2" title={review.comment || ''}>
                            {review.comment}
                        </p>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                        <form
                            action={async () => {
                                'use server'
                                await deleteReview(review.id)
                            }}
                        >
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </form>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}