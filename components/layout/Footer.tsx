import Link from 'next/link'
import { Facebook, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-50 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🌲</span> Globit Transient
            </h3>
            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-sm">
              Your affordable home away from home in the City of Pines. 
              Secure parking, family-friendly, and accessible to major tourist spots.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link href="/book" className="hover:text-white transition-colors">Book a Stay</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">House Rules</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-emerald-200/80">
              <li className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                <a href="#" target="_blank" className="hover:text-white">Globit Facebook Page</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0917 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>inquire@globit.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-400/60">
          <p>&copy; {new Date().getFullYear()} Globit Transient House. All rights reserved.</p>
          
          <div className="flex gap-4">
             {/* Admin Login Placement */}
             <Link href="/admin/login" className="hover:text-emerald-200 transition-colors">
               Admin Portal
             </Link>
             <Link href="/portal/login" className="hover:text-emerald-200 transition-colors">
               Agent Login
             </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}