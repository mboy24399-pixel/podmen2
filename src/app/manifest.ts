import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Podmen X',
    short_name: 'Podmen X',
    description: 'Music and podcasts from the live Podmen catalog.',
    start_url: '/',
    display: 'standalone',
    background_color: '#EEF0F4',
    theme_color: '#D99422',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  };
}
