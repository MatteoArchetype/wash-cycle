import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wash Cycle',
    short_name: 'Wash Cycle',
    description: 'Book communal laundry machines in your building',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF4EC',
    theme_color: '#9DC4E8',
    icons: [
      {
        src: '/icon-192.png',
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
