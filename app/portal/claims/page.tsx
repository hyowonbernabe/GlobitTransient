'use client'

import { useState } from 'react'
import { searchBookings, submitClaim } from '@/server/actions/agent-claim'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, PlusCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

// Define the booking type returned by search
type SearchResult = {
  id: string
  checkIn: Date
  totalPrice: number
  unit: { name: string }
  user: { name: string | null }
}

export default function AgentClaimsPage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSearch = async (formData: FormData) => {
    setIsSearching(true)
    setMessage(null)
    setResults([])

    const res = await searchBookings(formData)
    
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else if (res.bookings) {
      // @ts-ignore - Date serialization issues from server actions sometimes require mapping
      setResults(res.bookings)
      if (res.bookings.length === 0) {
        setMessage({ type: 'error', text: "No unclaimed bookings found with that name." })
      }
    }
    setIsSearching(false)
  }

  const handleClaim = async (bookingId: string) => {
    setIsClaiming(bookingId)
    const res = await submitClaim(bookingId)
    
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: "Claim submitted! Waiting for Admin approval." })
      // Remove from results list
      setResults(prev => prev.filter(b => b.id !== bookingId))
    }
    setIsClaiming(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Claims</h1>
        <p className="text-gray-500">
          Forgot your link? Find the booking and claim it here.
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find Booking</CardTitle>
          <CardDescription>Search by Guest Name for bookings made in the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSearch} className="flex gap-4 mb-6">
            <Input 
              name="guestName" 
              placeholder="Guest Name (e.g. Juan)" 
              required 
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching} className="bg-emerald-600 hover:bg-emerald-700">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </form>

          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-2 mb-4 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {results.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.user.name}</TableCell>
                      <TableCell>{booking.unit.name}</TableCell>
                      <TableCell>{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right font-mono">
                        {(booking.totalPrice / 100).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleClaim(booking.id)}
                          disabled={isClaiming === booking.id}
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          {isClaiming === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4 mr-1" /> Claim
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helper Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <h4 className="font-bold mb-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Note on Claims
        </h4>
        <p>
          Claims are subject to Admin approval. Only bookings that do not already have an agent assigned will appear in the search results.
        </p>
      </div>
    </div>
  )
}