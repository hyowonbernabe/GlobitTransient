'use client'

import { useState } from 'react'
import { Star, StarHalf, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { submitReview } from '@/server/actions/review'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
  }
}

interface ReviewSectionProps {
  unitId: string
  reviews: Review[]
}

export function ReviewSection({ unitId, reviews }: ReviewSectionProps) {
  const [isWriting, setIsWriting] = useState(false)
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate Average
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "New"

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          "w-4 h-4", 
          i < score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )} 
      />
    ))
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    // Append rating manually since it's state-based
    formData.append('rating', rating.toString())
    formData.append('unitId', unitId)

    const result = await submitReview(formData)
    
    if (result?.error) {
      alert(result.error)
    } else {
      setIsWriting(false)
      // Optimistic update or wait for revalidate
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8" id="reviews">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Guest Reviews
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {reviews.length}
            </span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-emerald-700">{averageRating}</span>
            <div className="flex text-yellow-400">
              {averageRating !== "New" && renderStars(Math.round(Number(averageRating)))}
            </div>
          </div>
        </div>
        
        {!isWriting && (
          <Button onClick={() => setIsWriting(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            Write a Review
          </Button>
        )}
      </div>

      {isWriting && (
        <Card className="p-6 bg-gray-50 border-emerald-100 animate-in slide-in-from-top-4 fade-in">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={cn(
                        "w-8 h-8", 
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Your Feedback</Label>
              <Textarea 
                id="comment" 
                name="comment" 
                placeholder="What did you like about your stay?" 
                required 
                className="bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsWriting(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? 'Submitting...' : 'Post Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border border-gray-200">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {review.user.name ? review.user.name[0].toUpperCase() : 'G'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{review.user.name || 'Guest'}</h4>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 w-fit mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}