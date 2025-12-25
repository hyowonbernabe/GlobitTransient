import { auth } from '@/server/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, QrCode, Smartphone, Share2 } from 'lucide-react'

export default async function AgentToolsPage() {
  const session = await auth()
  if (!session?.user) return null

  // @ts-ignore
  const agentCode = session.user.agentCode || 'NO-CODE'
  const referralLink = `${process.env.AUTH_URL}/book?ref=${agentCode}`
  
  // Using a public API for QR generation to avoid heavy libraries. 
  // In a real high-scale app, we might use 'qrcode.react' or similar.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralLink)}`

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Tools</h1>
        <p className="text-gray-500">Resources to help you get more bookings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-600" />
              Direct Link
            </CardTitle>
            <CardDescription>
              Share this link via Messenger, Viber, or SMS. Guests who click this are automatically tagged to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input readOnly value={referralLink} className="font-mono bg-gray-50" />
              <Button variant="outline" className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <strong>Tip:</strong> Post this on Facebook Groups or your profile story to reach more potential guests.
            </div>
          </CardContent>
        </Card>

        {/* Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              Manual Code
            </CardTitle>
            <CardDescription>
              If a guest is booking directly on the website without your link, tell them to mention this code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-6 rounded-xl text-center border-2 border-dashed border-gray-300">
              <span className="block text-sm text-gray-500 uppercase mb-1">Your Unique Code</span>
              <span className="text-3xl font-mono font-bold text-gray-900 tracking-widest selection:bg-emerald-200">
                {agentCode}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card - Full Width on Mobile */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Walk-in QR Code
            </CardTitle>
            <CardDescription>
              Show this to guests you meet in person. When they scan it, they will be taken directly to the booking page with your referral attached.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeUrl} 
                alt="Agent Referral QR Code" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain"
              />
            </div>
            <Button variant="outline">Download QR Code</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}