import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { detectBrandFromHost, DEFAULT_BRAND_CONFIG } from '@/src/lib/domainBranding';
import { getMediaPath } from '@/src/lib/mediaSeo';
import { getServerTrendingMedia } from '@/src/lib/serverMedia';

// Generate sitemap for search engines
const generateSitemap = (brandConfig: typeof DEFAULT_BRAND_CONFIG) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${brandConfig.canonicalUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=home</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=tv</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=library</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Popular genres -->
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie&genre=28</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie&genre=12</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie&genre=16</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie&genre=35</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}?tab=browse&type=movie&genre=80</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- AI/SEO endpoints -->
  <url>
    <loc>${brandConfig.canonicalUrl}.well-known/llms.txt</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${brandConfig.canonicalUrl}.well-known/ai-plugin.json</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Static assets -->
  <url>
    <loc>${brandConfig.canonicalUrl}manifest.json</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

export async function GET() {
  const brandConfig = detectBrandFromHost((await headers()).get('host') || '');
  const media = await getServerTrendingMedia();
  const mediaUrls = media.map((item) => `
  <url>
    <loc>${brandConfig.canonicalUrl}${getMediaPath(item).slice(1)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
  const sitemap = generateSitemap(brandConfig).replace('</urlset>', `${mediaUrls}
</urlset>`);
  
  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24 hours
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
