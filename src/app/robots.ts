import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/tasks', '/'],
      disallow: ['/api/', '/auth/', '/tasks/'],
    },
  };
}
