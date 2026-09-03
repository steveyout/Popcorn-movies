/**
 * Domain-based dynamic branding & SEO configuration.
 * Detects whether the user is accessing via popcornmovies.online, bingebox.work, or localhost,
 * and updates document title, branding text, Open Graph, and meta keywords accordingly.
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
}

export const getDomainBranding = (): DomainBrandConfig => {
  if (typeof window === 'undefined') {
    return {
      brandName: 'Popcorn Movies',
      brandShortName: 'Popcorn Movies',
      brandSub: 'MOVIES & TV',
      documentTitle: 'Popcorn Movies — Watch Trailers, Discover Movies & TV Shows',
      description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn Movies (https://popcornmovies.ac/) — the ultimate frosted glass cinema streaming experience.',
      keywords: 'Popcorn Movies, popcornmovies.ac, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
      domain: 'popcornmovies.ac',
      sourceDomain: 'popcornmovies.online',
      canonicalUrl: 'https://popcornmovies.ac/',
      alternateUrl: 'https://popcornmovies.online',
      logoType: 'popcorn',
    };
  }

  const hostname = window.location.hostname.toLowerCase();

  // Check for bingbox.work, bingebox.ac, or bingebox domains
  if (hostname.includes('bingbox') || hostname.includes('bingebox')) {
    return {
      brandName: 'BingeBox',
      brandShortName: 'BingeBox',
      brandSub: 'BINGE WATCH',
      documentTitle: 'BingeBox — Binge Watch Movies, TV Shows & Trailers',
      description: 'Binge watch top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with BingeBox (https://bingebox.ac/) — the ultimate streaming and cinema discovery experience.',
      keywords: 'BingeBox, bingebox.ac, bingbox.work, binge watch, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, TV series, PWA streaming, TMDB ratings',
      domain: 'bingebox.ac',
      sourceDomain: 'bingbox.work',
      canonicalUrl: 'https://bingebox.ac/',
      alternateUrl: 'https://bingbox.work',
      logoType: 'bingebox',
    };
  }

  // Default for popcornmovies.online, popcornmovies.ac, and others
  return {
    brandName: 'Popcorn Movies',
    brandShortName: 'Popcorn Movies',
    brandSub: 'MOVIES & TV',
    documentTitle: 'Popcorn Movies — Watch Trailers, Discover Movies & TV Shows',
    description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn Movies (https://popcornmovies.ac/) — the ultimate frosted glass cinema streaming experience.',
    keywords: 'Popcorn Movies, popcornmovies.ac, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
    domain: 'popcornmovies.ac',
    sourceDomain: 'popcornmovies.online',
    canonicalUrl: 'https://popcornmovies.ac/',
    alternateUrl: 'https://popcornmovies.online',
    logoType: 'popcorn',
  };
};

/**
 * Dynamically updates DOM meta tags, canonical link, open graph, and schema based on the active domain
 */
export const applyDomainSEO = (): void => {
  if (typeof document === 'undefined') return;

  const branding = getDomainBranding();

  // Document Title
  document.title = branding.documentTitle;

  const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
    const selector = isProperty 
      ? `meta[property="${nameOrProperty}"]` 
      : `meta[name="${nameOrProperty}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', nameOrProperty);
      } else {
        element.setAttribute('name', nameOrProperty);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const setLink = (rel: string, href: string, hreflang?: string) => {
    let selector = `link[rel="${rel}"]`;
    if (hreflang) {
      selector += `[hreflang="${hreflang}"]`;
    }
    let element = document.querySelector(selector) as HTMLLinkElement | null;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      if (hreflang) {
        element.setAttribute('hreflang', hreflang);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // Standard Meta Tags
  setMeta('title', branding.documentTitle);
  setMeta('description', branding.description);
  setMeta('keywords', branding.keywords);
  setMeta('application-name', branding.brandShortName);
  setMeta('apple-mobile-web-app-title', branding.brandShortName);
  setMeta('brand', branding.brandName);
  setMeta('al:web:url', branding.canonicalUrl, true);

  // Canonical & Alternate URLs
  setLink('canonical', branding.canonicalUrl);
  setLink('alternate', branding.alternateUrl, 'x-default');

  // Open Graph Tags
  setMeta('og:title', branding.documentTitle, true);
  setMeta('og:site_name', branding.brandName, true);
  setMeta('og:description', branding.description, true);
  setMeta('og:url', branding.canonicalUrl, true);

  // Twitter Tags
  setMeta('twitter:title', branding.documentTitle);
  setMeta('twitter:description', branding.description);
  setMeta('twitter:url', branding.canonicalUrl);

  // Search Engine JSON-LD Schema Update
  try {
    let jsonLdScript = document.getElementById('schema-static-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'schema-static-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const schemaData = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': branding.brandName,
        'alternateName': [branding.brandShortName, branding.sourceDomain],
        'url': branding.canonicalUrl,
        'sameAs': [
          branding.canonicalUrl,
          branding.alternateUrl
        ],
        'applicationCategory': 'EntertainmentApplication',
        'genre': 'Movies & TV',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          '11 Anonymous High-Speed Streaming Server Engines',
          'TMDB Movie and TV Series Catalog',
          '4K Official YouTube Trailers',
          'Cloud Sync Watchlist and Favorites with Firebase',
          'Ambient Lighting Cinema Engine',
          'PWA Offline Mode Support'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': branding.brandName,
        'url': branding.canonicalUrl,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${branding.canonicalUrl}?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ];

    jsonLdScript.textContent = JSON.stringify(schemaData, null, 2);
  } catch (err) {
    // Non-blocking schema generation fallback
    console.debug('Schema JSON-LD update skipped:', err);
  }
};
