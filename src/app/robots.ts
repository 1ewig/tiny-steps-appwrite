import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tiny-steps-gules.vercel.app');

  return {
    rules: {
      userAgent: '*',
      allow: ['/tasks', '/'],
      disallow: ['/api/', '/auth/', '/tasks/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
