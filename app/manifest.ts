import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Globit Transient House',
    short_name: 'Globit House',
    description: 'Affordable and cozy transient house in Baguio City near Burnham Park.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#065f46', // Emerald 800
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png', // You should add these images to public/ later
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}