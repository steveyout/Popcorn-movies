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
  logoType: 'popcorn' | 'bingebox';
}

export const getDomainBranding = (): DomainBrandConfig => {
  if (typeof window === 'undefined') {
    return {
      brandName: 'Popcorn Movies',
      brandShortName: 'Popcorn',
      brandSub: 'MOVIES & TV',
      documentTitle: 'Popcorn Movies — Watch Trailers, Discover Movies & TV Shows',
      description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn Movies — the ultimate frosted glass cinema streaming experience.',
      keywords: 'Popcorn Movies, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
      domain: 'popcornmovies.online',
      logoType: 'popcorn',
    };
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('bingebox') || hostname.includes('bingebox.work')) {
    return {
      brandName: 'BingeBox',
      brandShortName: 'BingeBox',
      brandSub: 'BINGE WATCH',
      documentTitle: 'BingeBox — Binge Watch Movies, TV Shows & Trailers',
      description: 'Binge watch top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with BingeBox — the ultimate streaming and cinema discovery experience.',
      keywords: 'BingeBox, bingebox.work, binge watch, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, TV series, PWA streaming, TMDB ratings',
      domain: 'bingebox.work',
      logoType: 'bingebox',
    };
  }

  // Default or popcornmovies.online
  return {
    brandName: 'Popcorn Movies',
    brandShortName: 'Popcorn',
    brandSub: 'MOVIES & TV',
    documentTitle: 'Popcorn Movies — Watch Trailers, Discover Movies & TV Shows',
    description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn Movies — the ultimate frosted glass cinema streaming experience.',
    keywords: 'Popcorn Movies, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
    domain: 'popcornmovies.online',
    logoType: 'popcorn',
  };
};

/**
 * Dynamically updates DOM meta tags and title based on the active domain
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

  // Standard Meta Tags
  setMeta('title', branding.documentTitle);
  setMeta('description', branding.description);
  setMeta('keywords', branding.keywords);
  setMeta('application-name', branding.brandShortName);
  setMeta('apple-mobile-web-app-title', branding.brandShortName);

  // Open Graph Tags
  setMeta('og:title', branding.documentTitle, true);
  setMeta('og:site_name', branding.brandShortName, true);
  setMeta('og:description', branding.description, true);

  // Twitter Tags
  setMeta('twitter:title', branding.documentTitle);
  setMeta('twitter:description', branding.description);
};
