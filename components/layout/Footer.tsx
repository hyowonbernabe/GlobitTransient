'use client'

import Link from 'next/link'
import { Facebook, Mail, Phone } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-emerald-950 text-white py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/10 pb-12">

                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🌲</span>
                            <span className="font-black text-xl tracking-tighter uppercase">Globit</span>
                        </Link>
                        <p className="text-emerald-100/40 text-sm max-w-xs font-medium">
                            Your sanctuary in the heart of Baguio City. Experience the true pines breeze.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Navigation</h4>
                            <ul className="space-y-2 text-sm font-bold text-emerald-100/60">
                                <li><Link href="/book" className="hover:text-white transition-colors">Book Now</Link></li>
                                <li><Link href="/#faq" className="hover:text-white transition-colors">Guest FAQ</Link></li>
                                <li><Link href="/#location" className="hover:text-white transition-colors">Location</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Connect</h4>
                            <ul className="space-y-2 text-sm font-bold text-emerald-100/60">
                                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                                <li><a href="mailto:contact@globit.com" className="hover:text-white transition-colors">Email Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-emerald-500/20">
                    <p>&copy; {new Date().getFullYear()} Globit Transient. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/admin/login" className="hover:text-emerald-500/60 transition-colors">Admin</Link>
                        <Link href="/portal/login" className="hover:text-emerald-500/60 transition-colors">Agent</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
