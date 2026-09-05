import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getBrandSEOMetadata, DEFAULT_BRAND_CONFIG, detectBrandFromHost } from '@/src/lib/domainBranding';
import { headers } from 'next/headers';
import Script from 'next/script';

// Function to get metadata for a specific path
export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    return createMetadata(detectBrandFromHost(headersList.get('host') || ''));
  } catch (error) {
    console.debug('Could not determine host for metadata:', error);
    return createMetadata(DEFAULT_BRAND_CONFIG);
  }
}

function createMetadata(brandConfig: typeof DEFAULT_BRAND_CONFIG): Metadata {
  const seo = getBrandSEOMetadata(brandConfig);
  const ogImage = `${brandConfig.canonicalUrl}favicon.svg`;

  return {
    title: {
      default: seo.title,
      template: `%s | ${brandConfig.brandName}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: brandConfig.brandName, url: brandConfig.canonicalUrl }],
    creator: brandConfig.brandName,
    publisher: brandConfig.brandName,
    
    // Open Graph
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.ogUrl,
      siteName: seo.ogSiteName,
      images: [
        {
          url: ogImage,
          width: 1920,
          height: 1080,
          alt: `${brandConfig.brandName} - Movie Discovery App`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      site: brandConfig.canonicalUrl,
      creator: brandConfig.brandName,
      images: [ogImage],
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical and Alternate
    alternates: {
      canonical: seo.canonical,
      languages: {
        'x-default': seo.alternate,
      },
    },
    
    // Application
    applicationName: seo.applicationName,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: seo.applicationName,
    },
    
    // Icons
    icons: {
      icon: '/favicon.svg',
      apple: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    
    // Manifest
    manifest: '/manifest.json',
    
    // Additional meta tags
    other: {
      ...seo.additionalMeta,
      'mobile-web-app-capable': 'yes',
      'format-detection': 'telephone=no',
      'googlebot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      'bingbot': 'index, follow',
      'theme-color': brandConfig.primaryColor,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  viewportFit: 'cover',
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}

async function RootLayoutContent({ children }: { children: React.ReactNode }) {
  let brandConfig = DEFAULT_BRAND_CONFIG;

  try {
    const headersList = await headers();
    brandConfig = detectBrandFromHost(headersList.get('host') || '');
  } catch (error) {
    // If headers are not available (e.g., during build), use default
    console.debug('Headers not available, using default brand config');
  }

  const seo = getBrandSEOMetadata(brandConfig);

  return (
    <html lang="en" data-brand={brandConfig.logoType}>
      <head>
        {/* Dynamic Schema.org JSON-LD */}
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seo.jsonLd, null, 2),
          }}
        />
        
        {/* AI Agent SEO - LLMs.txt reference */}
        <link 
          rel="alternate" 
          type="text/markdown" 
          href="/api/ai/llms" 
          title="LLMs.txt Specification"
        />
        
        {/* AI Plugin discovery */}
        <link 
          rel="alternate" 
          type="application/json" 
          href="/api/ai/plugin" 
          title="AI Plugin Manifest"
        />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Service Worker registration for PWA */}
        <Script
          id="service-worker-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('${brandConfig.brandName} PWA ServiceWorker active:', registration.scope);
                    })
                    .catch(err => {
                      console.warn('${brandConfig.brandName} PWA ServiceWorker registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
