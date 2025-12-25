'use client'

import { useState } from 'react'
import { exportBookingsCSV, exportCommissionsCSV } from '@/server/actions/export'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'

export function ExportSection() {
  const [loading, setLoading] = useState<'bookings' | 'commissions' | null>(null)

  const handleDownload = async (type: 'bookings' | 'commissions') => {
    setLoading(type)
    
    try {
      const csvData = type === 'bookings' 
        ? await exportBookingsCSV() 
        : await exportCommissionsCSV()

      if (!csvData) {
        alert('Failed to generate export.')
        return
      }

      // Create Blob and trigger download
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `globit-${type}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      alert('An error occurred during export.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export system data for backup or offline analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-20 flex flex-col items-center justify-center gap-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 text-emerald-800"
            onClick={() => handleDownload('bookings')}
            disabled={!!loading}
          >
            {loading === 'bookings' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                <FileSpreadsheet className="w-6 h-6" />
            )}
            <span className="font-semibold">Export Bookings</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex-1 h-20 flex flex-col items-center justify-center gap-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 text-blue-800"
            onClick={() => handleDownload('commissions')}
            disabled={!!loading}
          >
            {loading === 'commissions' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                <Download className="w-6 h-6" />
            )}
            <span className="font-semibold">Export Commissions</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500 pt-2">
          * Exports include all historical data in CSV format compatible with Excel and Google Sheets.
        </p>
      </CardContent>
    </Card>
  )
}