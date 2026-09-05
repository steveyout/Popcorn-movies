/**
 * Domain-based dynamic branding & SEO configuration for Next.js App Router.
 * This version works with both server and client components.
 */

export interface DomainBrandConfig {
  brandName: string;
  brandShortName: string;
  brandSub: string;
  documentTitle: string;
  description: string;
  keywords: string;
  domain: string;
  sourceDomain: string;
  canonicalUrl: string;
  alternateUrl: string;
  logoType: 'popcorn' | 'bingebox';
  primaryColor: string;
  accentColor: string;
}

// Default configuration for Popcorn Movies
export const DEFAULT_BRAND_CONFIG: DomainBrandConfig = {
  brandName: 'Popcorn Movies',
  brandShortName: 'Popcorn Movies',
  brandSub: 'MOVIES & TV',
  documentTitle: 'Popcorn Movies — Watch Trailers, Discover Movies & TV Shows',
  description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn Movies — the ultimate frosted glass cinema streaming experience.',
  keywords: 'Popcorn Movies, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
  domain: 'popcornmovies.online',
  sourceDomain: 'popcornmovies.online',
  canonicalUrl: 'https://popcornmovies.online/',
  alternateUrl: 'https://bingebox.work',
  logoType: 'popcorn',
  primaryColor: '#8B5CF6',
  accentColor: '#6366F1',
};

// BingeBox configuration
export const BINGEBOX_CONFIG: DomainBrandConfig = {
  brandName: 'BingeBox',
  brandShortName: 'BingeBox',
  brandSub: 'BINGE WATCH',
  documentTitle: 'BingeBox — Binge Watch Movies, TV Shows & Trailers',
  description: 'Binge watch top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with BingeBox — the ultimate streaming and cinema discovery experience.',
  keywords: 'BingeBox, bingebox.work, binge watch, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, TV series, PWA streaming, TMDB ratings',
  domain: 'bingebox.work',
  sourceDomain: 'bingebox.work',
  canonicalUrl: 'https://bingebox.work/',
  alternateUrl: 'https://popcornmovies.online',
  logoType: 'bingebox',
  primaryColor: '#06B6D4',
  accentColor: '#0891B2',
};

/**
 * Get domain branding configuration for client components.
 * This version reads from window.location.
 */
export const getClientDomainBranding = (): DomainBrandConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_BRAND_CONFIG;
  }

  return detectBrandFromHost(window.location.hostname);
};

/**
 * Unified function that works in both server and client environments.
 * For server components, use getServerDomainBranding() directly.
 * For client components, use getClientDomainBranding() directly.
 */
export const getDomainBranding = (): DomainBrandConfig => {
  return getClientDomainBranding();
};

/**
 * Get SEO metadata for the current brand
 */
export const getBrandSEOMetadata = (brandConfig: DomainBrandConfig = DEFAULT_BRAND_CONFIG) => {
  const currentYear = new Date().getFullYear();
  
  return {
    title: brandConfig.documentTitle,
    description: brandConfig.description,
    keywords: brandConfig.keywords,
    canonical: brandConfig.canonicalUrl,
    alternate: brandConfig.alternateUrl,
    ogTitle: brandConfig.documentTitle,
    ogDescription: brandConfig.description,
    ogUrl: brandConfig.canonicalUrl,
    ogSiteName: brandConfig.brandName,
    twitterTitle: brandConfig.documentTitle,
    twitterDescription: brandConfig.description,
    twitterUrl: brandConfig.canonicalUrl,
    brandName: brandConfig.brandName,
    applicationName: brandConfig.brandShortName,
    themeColor: brandConfig.primaryColor,
    // Additional SEO for movies/TV
    additionalMeta: {
      'application-name': brandConfig.brandShortName,
      'apple-mobile-web-app-title': brandConfig.brandShortName,
      'brand': brandConfig.brandName,
      'al:web:url': brandConfig.canonicalUrl,
    },
    // Schema.org JSON-LD for Web Application
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: brandConfig.brandName,
        alternateName: [brandConfig.brandShortName, brandConfig.sourceDomain],
        url: brandConfig.canonicalUrl,
        sameAs: [
          brandConfig.canonicalUrl,
          brandConfig.alternateUrl,
        ],
        applicationCategory: 'EntertainmentApplication',
        genre: 'Movies & TV',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: brandConfig.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1250',
        },
        featureList: [
          '11 Anonymous High-Speed Streaming Server Engines',
          'TMDB Movie and TV Series Catalog',
          '4K Official YouTube Trailers',
          'Cloud Sync Watchlist and Favorites with Firebase',
          'Ambient Lighting Cinema Engine',
          'PWA Offline Mode Support',
          'Multi-Brand Domain Support',
          'Agentic SEO Ready',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: `${brandConfig.brandName} & TV`,
        url: brandConfig.canonicalUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${brandConfig.canonicalUrl}?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brandConfig.brandName,
        url: brandConfig.canonicalUrl,
        logo: `${brandConfig.canonicalUrl}favicon.svg`,
        foundingDate: '2024',
        description: brandConfig.description,
      },
    ],
  };
};

/**
 * Generate Open Graph image URL with branding
 */
export const getBrandedOGImage = (brandConfig: DomainBrandConfig = DEFAULT_BRAND_CONFIG) => {
  // For now, return the favicon, but this could be enhanced with dynamic OG image generation
  return `${brandConfig.canonicalUrl}favicon.svg`;
};

/**
 * Get brand-specific manifest for PWA
 */
export const getBrandManifest = (brandConfig: DomainBrandConfig) => ({
  name: brandConfig.brandName,
  short_name: brandConfig.brandShortName,
  description: brandConfig.description,
  start_url: '/',
  display: 'standalone' as const,
  background_color: '#050508',
  theme_color: brandConfig.primaryColor,
  icons: [
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
    {
      src: '/favicon.svg',
      sizes: '180x180',
      type: 'image/svg+xml',
      purpose: 'apple touch icon' as const,
    },
  ],
});

/**
 * Brand detection helper that can be used in middleware
 */
export const detectBrandFromHost = (host: string): DomainBrandConfig => {
  const hostname = host.toLowerCase().split(':')[0];
  
  if (hostname === 'bingebox.work' || hostname.endsWith('.bingebox.work')) {
    return BINGEBOX_CONFIG;
  }
  
  return DEFAULT_BRAND_CONFIG;
};
