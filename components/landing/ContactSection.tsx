import { Facebook, Phone } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Side */}
            <div className="relative bg-emerald-800 min-h-[300px] flex items-end justify-center overflow-hidden">
               <div className="absolute inset-0 bg-[url('/assets/images/baguio-city-landscape-view.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
               <img 
                 src="/assets/images/baguio-city-landscape-view.jpg" 
                 alt="Owner of Globit Transient" 
                 className="relative z-10 w-64 md:w-80 object-contain translate-y-4 hover:scale-105 transition-transform duration-500"
               />
            </div>

            {/* Info Side */}
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Questions? Chat with us!
                </h2>
                <p className="text-gray-600">
                  We are responsive from 8:00 AM to 10:00 PM. Feel free to ask about availability, special requests, or directions.
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Facebook className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700">Message us on Facebook</h4>
                      <p className="text-xs text-gray-500">Fastest response time</p>
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
                   <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                      <Phone className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900">Call / Text</h4>
                      <p className="text-sm font-mono text-gray-600 select-all">0917 123 4567</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}