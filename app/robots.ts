import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.AUTH_URL || 'https://globit-transient.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/portal/',
        '/api/',
        '/payment/', // Don't index payment pages
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}