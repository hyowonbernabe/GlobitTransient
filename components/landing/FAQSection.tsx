'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, HelpCircle, Calendar, Car, Cat, MapPin, Coffee } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FAQItemProps {
    question: string
    answer: string
    icon: React.ReactNode
    isOpen: boolean
    onClick: () => void
}

const FAQS = [
    {
        question: "What are the standard check-in and check-out times?",
        answer: "Our standard check-in time is at 2:00 PM and check-out is at 11:00 AM. This gives us enough time to deep clean and sanitize the units for the next guests. Early check-ins or late check-outs are subject to availability and may incur a small fee.",
        icon: <Calendar className="w-5 h-5" />
    },
    {
        question: "Is there secure parking available?",
        answer: "Yes, we provide free on-site parking for our guests. The parking area is located within our gated property and is monitored to ensure the safety of your vehicles.",
        icon: <Car className="w-5 h-5" />
    },
    {
        question: "Do you allow pets in the transients?",
        answer: "We are pet-friendly! However, we request that you inform us in advance if you're bringing your furry friends. We have specific house rules for pets to ensure the comfort of all our guests and the cleanliness of our units.",
        icon: <Cat className="w-5 h-5" />
    },
    {
        question: "How far are you from Baguio's main attractions?",
        answer: "We are conveniently located along Marcos Highway. Burnham Park is about a 10-minute drive, and SM City Baguio is approximately 12 minutes away. Popular cafes and restaurants are within walking distance.",
        icon: <MapPin className="w-5 h-5" />
    },
    {
        question: "What amenities are included in each unit?",
        answer: "All units are equipped with high-speed Wi-Fi, shower heaters, basic kitchen utensils, and comfortable bedding. Some premium units like the Big House also include a full kitchen, refrigerator, and smart TV.",
        icon: <Coffee className="w-5 h-5" />
    },
    {
        question: "How can I guarantee my booking?",
        answer: "Bookings are confirmed once a downpayment is received through our secure payment gateway. You'll receive an automated confirmation email with all the details of your stay immediately after a successful transaction.",
        icon: <HelpCircle className="w-5 h-5" />
    }
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section id="faq" className="py-24 bg-[#fafdfc] relative overflow-hidden">
            {/* Decorative Ornaments */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center space-y-4 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest"
                    >
                        <HelpCircle className="w-3 h-3" />
                        Common Questions
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tighter"
                    >
                        Everything You Need to Know
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium text-lg max-w-2xl mx-auto"
                    >
                        Planning your Baguio getaway? Here are the answers to some of the most frequently asked questions about staying at Globit Transient.
                    </motion.p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <FAQItem
                            key={index}
                            {...faq}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {/* Support Teaser */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-16 p-8 rounded-[2.5rem] bg-emerald-950 text-white text-center space-y-6 relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
                    <div className="space-y-2">
                        <h4 className="text-xl font-black">Still have questions?</h4>
                        <p className="text-emerald-100/60 font-medium">Our virtual concierge is available 24/7 to help you plan your stay.</p>
                    </div>
                    <Button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                        className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-full px-10 py-8 text-xl border-b-4 border-emerald-500 transition-all hover:-translate-y-1 active:translate-y-0.5 active:border-b-0 shadow-2xl shadow-emerald-400/20"
                    >
                        Ask our AI Assistant
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}

function FAQItem({ question, answer, icon, isOpen, onClick }: FAQItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-[2rem] border transition-all duration-300 overflow-hidden",
                isOpen
                    ? "bg-white border-emerald-200 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-500/10"
                    : "bg-white/50 border-emerald-900/5 hover:border-emerald-200 hover:bg-white"
            )}
        >
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
            >
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300",
                        isOpen ? "bg-emerald-600 text-white shadow-lg" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {icon}
                    </div>
                    <span className={cn(
                        "text-lg md:text-xl font-black tracking-tight leading-tight transition-colors duration-300",
                        isOpen ? "text-emerald-950" : "text-gray-600"
                    )}>
                        {question}
                    </span>
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-emerald-950 text-white rotate-180" : "bg-gray-100 text-gray-400"
                )}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-6 pb-8 md:px-8 md:pb-10 pt-0 ml-[4.5rem]">
                            <div className="h-0.5 w-12 bg-emerald-100 mb-6" />
                            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

