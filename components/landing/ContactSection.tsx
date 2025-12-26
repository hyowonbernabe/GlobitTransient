'use client'

import { motion } from 'framer-motion'
import { Facebook, Phone, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ContactSection() {
    return (
        <section id="contact" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl px-6 pointer-events-none opacity-50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Content Column */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-[0.2em]"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Baguio Connect
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tighter leading-[0.9]"
                            >
                                Let&apos;s Plan Your <br />
                                <span className="text-emerald-500">Cordillera Escape</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-500 font-medium text-lg max-w-lg leading-relaxed"
                            >
                                Got questions about the weather, directions, or which unit fits your group best? Our team is ready to help you settle into the City of Pines.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ContactCard
                                icon={<Facebook className="w-5 h-5" />}
                                title="Facebook Messenger"
                                value="@globit.transient"
                                href="https://facebook.com/globit.transient"
                                color="bg-blue-500"
                            />
                            <ContactCard
                                icon={<Phone className="w-5 h-5" />}
                                title="Direct Line"
                                value="0917 123 4567"
                                href="tel:+639171234567"
                                color="bg-emerald-600"
                            />
                            <ContactCard
                                icon={<Mail className="w-5 h-5" />}
                                title="Email Support"
                                value="inquire@globit.com"
                                href="mailto:inquire@globit.com"
                                color="bg-amber-500"
                            />
                            <div className="p-6 rounded-[2rem] border border-emerald-900/5 bg-emerald-50/30 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 mb-0.5">Response Time</h4>
                                    <p className="text-emerald-950 font-black">Within 30 mins</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/20 aspect-video md:aspect-square group">
                            <div className="absolute inset-0 bg-emerald-950/20 group-hover:bg-transparent transition-colors duration-700" />
                            <img
                                src="/assets/images/baguio-city-landscape-view.jpg"
                                alt="Baguio City Landscape"
                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                            />

                            {/* Overlaid Profile Card */}
                            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-emerald-500 p-1 shrink-0 overflow-hidden border-2 border-white/20">
                                    <img src="/assets/images/placeholder.png" alt="Host Profile" className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Your Local Host</p>
                                    <h3 className="text-xl font-black tracking-tight">Cathy G.</h3>
                                    <p className="text-sm font-medium text-emerald-50/60 leading-tight">Ready to welcome you with a warm Baguio smile.</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-100 rounded-full blur-[80px] -z-10" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-100 rounded-full blur-[80px] -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}

function ContactCard({ icon, title, value, href, color }: { icon: any, title: string, value: string, href: string, color: string }) {
    return (
        <motion.a
            href={href}
            target="_blank"
            whileHover={{ y: -5 }}
            className="p-6 rounded-[2rem] border border-emerald-900/5 bg-white shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all flex items-center gap-4 group"
        >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg",
                color
            )}>
                {icon}
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 mb-0.5">{title}</h4>
                <p className="text-emerald-950 font-black tracking-tight">{value}</p>
            </div>
        </motion.a>
    )
}
