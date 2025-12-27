export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="text-gray-500 text-sm">Last updated: December 27, 2025</p>

          <div className="prose prose-emerald max-w-none space-y-4 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">1. Booking & Reservation</h2>
              <p>
                All bookings are subject to availability and acceptance by Globit Transient.
                A down payment is required to secure your reservation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">2. Cancellation Policy</h2>
              <p>
                Down payments are strictly non-refundable but may be transferable/re-schedulable
                subject to notice period requirements (at least 7 days before check-in).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">3. House Rules</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Check-in time is 2:00 PM. Check-out time is 12:00 PM.</li>
                <li>Observe quiet hours between 10:00 PM and 7:00 AM.</li>
                <li>No smoking inside the units. Designated smoking areas are available.</li>
                <li>Clean as you go policy is strictly implemented.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">4. Liability</h2>
              <p>
                Guests are responsible for any damage caused to the property during their stay.
                Globit Transient is not liable for loss of personal belongings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}