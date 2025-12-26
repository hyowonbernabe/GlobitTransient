import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqPage() {
  const faqs = [
    {
      question: "What are the check-in and check-out times?",
      answer: "Check-in time is strictly at 2:00 PM. Check-out time is at 12:00 PM the following day. Early check-ins or late check-outs are subject to availability and may incur additional charges."
    },
    {
      question: "Is parking available?",
      answer: "Yes, but we strictly have ONE (1) parking slot available for the entire property per night. It is available on a first-come, first-served basis or by reservation request during booking. Street parking is available but at your own risk."
    },
    {
      question: "Are pets allowed?",
      answer: "Yes, we are pet-friendly! However, all pets must strictly wear diapers while inside the unit to maintain cleanliness. Owners are responsible for cleaning up after their pets."
    },
    {
      question: "Do you provide toiletries?",
      answer: "No, we do not provide personal toiletries such as towels, soap, shampoo, or toothbrushes. We recommend bringing your own hygiene kits. Beddings and blankets are provided."
    },
    {
      question: "Is there a kitchen we can use?",
      answer: "Selected units (like the Big House, Veranda Unit, and 3F Unit 6/7) have their own kitchen with basic cooking utensils and a refrigerator. Smaller units do not have cooking facilities. Please check the specific unit amenities before booking."
    },
    {
      question: "How do I confirm my booking?",
      answer: "We require a small fixed downpayment to secure your reservation (500 PHP, 1,000 PHP, or 1,500 PHP depending on your total bill). Payments are processed securely via PayMongo (GCash, Maya, or Card). Your booking is instantly confirmed once payment is successful."
    },
    {
      question: "What is your cancellation policy?",
      answer: "The downpayment is non-refundable as it secures your slot and prevents other guests from booking those dates. If you need to re-schedule, please contact us at least 7 days before your arrival, subject to availability."
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-950">Frequently Asked Questions</h1>
            <p className="text-gray-600">
              Everything you need to know about your stay at Globit Transient.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-emerald-700 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}