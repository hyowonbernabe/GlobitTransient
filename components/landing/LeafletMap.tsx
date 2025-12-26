"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { 
  MapPin, 
} from "lucide-react"
import { renderToStaticMarkup } from "react-dom/server"

// --- TYPES ---
interface Landmark {
  id: number
  name: string
  type: string
  distance: string
  time: string
  mode: string
  coords: [number, number]
  icon: any
  color: string
  bg: string
}

interface LeafletMapProps {
  center: [number, number]
  zoom: number
  activeLandmark: [number, number] | null
  activeId: number | null
  landmarks: Landmark[]
  setActiveId: (id: number | null) => void
  setActiveLandmark: (coords: [number, number] | null) => void
  onUserInteraction: () => void
}

// --- HELPER: CUSTOM ICONS ---
const createCustomIcon = (IconComponent: any, colorClass: string) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`w-8 h-8 rounded-full bg-white shadow-md border-2 border-white flex items-center justify-center ${colorClass}`}>
       <IconComponent size={16} strokeWidth={2.5} />
    </div>
  )
  
  return L.divIcon({
    html: iconMarkup,
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32]
  })
}

const globitIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="relative">
            <div className="w-12 h-12 rounded-full bg-emerald-600 shadow-xl border-4 border-white flex items-center justify-center z-10 relative animate-bounce-slow">
                <MapPin size={24} className="text-white fill-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/20 blur-sm rounded-full"></div>
        </div>
    ),
    className: "globit-marker-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
})

// --- COMPONENT: MAP CONTROLLER & RESIZER ---
function MapController({ 
    center, 
    zoom, 
    onUserInteraction 
}: { 
    center: [number, number], 
    zoom: number,
    onUserInteraction: () => void 
}) {
    const map = useMap()
    
    // Detect user interactions to pause/reset autoplay
    useMapEvents({
        dragstart: onUserInteraction,
        zoomstart: onUserInteraction,
        click: onUserInteraction,
    })
    
    // Fix for map rendering issue on load/tab switch
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 100)
        return () => clearTimeout(timer)
    }, [map])

    useEffect(() => {
        map.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25
        })
    }, [center, zoom, map])
    
    return null
}

// --- MAIN EXPORTED COMPONENT ---
export default function LeafletMap({ 
    center, 
    zoom, 
    activeLandmark, 
    activeId,
    landmarks,
    setActiveId,
    setActiveLandmark,
    onUserInteraction
}: LeafletMapProps) {
    // Configurable zoom offset for when focusing on a specific landmark vs general view
    const ZOOM_OFFSET = 2; 
    const effectiveZoom = activeLandmark ? zoom + ZOOM_OFFSET : zoom;

    return (
        <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={false}
            className="w-full h-full z-0 leaflet-container-custom" 
            zoomControl={false} 
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapController 
                center={activeLandmark || center} 
                zoom={effectiveZoom} 
                onUserInteraction={onUserInteraction}
            />

            {/* Main Marker */}
            <Marker position={center} icon={globitIcon}>
                <Popup className="custom-popup" offset={[0, -20]}>
                    <div className="font-bold text-emerald-600 text-base">Globit Transient</div>
                    <div className="text-xs text-gray-500">You are here</div>
                </Popup>
            </Marker>

            {/* Landmark Markers */}
            {landmarks.map(landmark => (
                <Marker 
                    key={landmark.id} 
                    position={landmark.coords}
                    icon={createCustomIcon(landmark.icon, landmark.color.replace('text-', 'text-'))}
                    eventHandlers={{
                        click: () => {
                            onUserInteraction();
                            setActiveId(landmark.id)
                            setActiveLandmark(landmark.coords)
                        }
                    }}
                >
                        <Popup offset={[0, -16]}>
                        <div className="font-bold text-gray-800">{landmark.name}</div>
                        <div className="text-xs text-gray-500">{landmark.distance} • {landmark.time}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}