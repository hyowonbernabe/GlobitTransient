import { MapPin, ShoppingCart, Coffee, Store } from 'lucide-react'

export function LocationMap() {
  const essentialPlaces = [
    { name: '7-Eleven', distance: '2 mins walk', icon: <Store className="w-4 h-4" /> },
    { name: 'Public Market', distance: '5 mins drive', icon: <ShoppingCart className="w-4 h-4" /> },
    { name: 'Burnham Park', distance: '5-10 mins drive', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Pet Store', distance: '3 mins walk', icon: <Coffee className="w-4 h-4" /> }, // Used Coffee icon as generic placeholder
  ]

  return (
    <section id="location" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Accessible & Convenient
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Located just outside the busy city center, giving you a peaceful night's sleep while remaining close to everything you need. 
                We are a short jeepney ride away from Burnham Park and Session Road.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {essentialPlaces.map((place) => (
                <div key={place.name} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    {place.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{place.name}</h4>
                    <p className="text-xs text-gray-500">{place.distance}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
              <strong>Tip:</strong> Jeepneys pass directly in front of the gate. Taxi cabs are also easy to hail from the main road.
            </div>
          </div>

          {/* Map Embed */}
          <div className="order-1 lg:order-2 h-[400px] lg:h-[500px] bg-gray-200 rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative">
             {/* NOTE: This is a placeholder for the Google Maps Embed. 
                In production, replace the src below with the actual Embed URL from Google Maps -> Share -> Embed a Map 
                pointing to the specific coordinate of Globit Transient.
             */}
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.284767118335!2d120.593746!3d16.410145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391a16879e80351%3A0x6c623b0d2358872!2sBurnham%20Park!5e0!3m2!1sen!2sph!4v1703485000000!5m2!1sen!2sph" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
             />
             <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-md">
                📍 Globit Transient Map Preview
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}