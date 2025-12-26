import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-950">Terms of Service & House Rules</h1>
              <p className="text-gray-600">
                Please read these terms carefully before booking. By confirming your reservation, you agree to abide by these rules.
              </p>
            </div>

            <Separator />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">1. Reservations & Payment</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>A <strong>fixed downpayment</strong> (tiered based on total bill) is required to secure any booking. This safeguards against last-minute cancellations.</li>
                <li>Payments are processed securely via <strong>PayMongo</strong>. Your booking is confirmed instantly upon successful payment.</li>
                <li>The remaining balance must be paid upon arrival (Check-in) via Cash or GCash.</li>
                <li>The downpayment is <strong>strictly non-refundable</strong>.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">2. Arrival & Departure</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li><strong>Check-in:</strong> 2:00 PM</li>
                <li><strong>Check-out:</strong> 12:00 PM (Noon) the following day.</li>
                <li>Guests remaining in the unit after 12:00 PM without prior approval may be charged an hourly extension fee or a full night's rate.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">3. House Rules</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li><strong>Quiet Hours:</strong> Please observe silence from 10:00 PM to 7:00 AM to respect our neighbors and other guests.</li>
                <li><strong>Clean As You Go:</strong> Please wash your own dishes and dispose of trash properly in the designated bins.</li>
                <li><strong>No Smoking:</strong> Smoking is strictly prohibited inside the bedrooms. Please use designated outdoor areas.</li>
                <li><strong>Damages:</strong> Guests are liable for any loss or damage to the property, furniture, or amenities caused during their stay.</li>
                <li><strong>Visitors:</strong> Only registered guests are allowed to stay overnight. Visitors must leave by 10:00 PM.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">4. Pet Policy</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Pets are allowed but must strictly wear <strong>diapers</strong> at all times while inside the house.</li>
                <li>Owners are responsible for any stains or damages caused by their pets.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">5. Liability</h2>
              <p className="text-gray-600">
                Globit Transient House is not responsible for any loss of personal belongings or valuables left inside the unit or vehicles parked in the premises. Please secure your items at all times.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}