import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tiny Steps — Low-Friction AI Task Companion',
    short_name: 'Tiny Steps',
    description: 'Empathetic, zero-pressure task breakdown for ADHD paralysis, burnout, and executive dysfunction.',
    start_url: '/tasks',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#5A8A70',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
