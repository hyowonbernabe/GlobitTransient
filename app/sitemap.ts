import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL || 'https://globit-transient.vercel.app'

  // 1. Static Routes
  const routes = [
    '',
    '/book',
    '/track',
    '/faq',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Dynamic Unit Routes
  const units = await prisma.unit.findMany({
    select: { slug: true }
  })

  const unitRoutes = units.map((unit: { slug: string }) => ({
    url: `${baseUrl}/book/${unit.slug}`,
    lastModified: new Date(), // Fallback as updatedAt is not in schema
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...routes, ...unitRoutes]
}