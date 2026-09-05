import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { detectBrandFromHost } from '@/src/lib/domainBranding';
import { getImageUrl, getBackdropUrl } from '@/src/services/tmdb';
import { getMediaIdFromSlug, getMediaSlug, getMediaTitle, type MediaRouteType } from '@/src/lib/mediaSeo';
import { getServerMediaDetails } from '@/src/lib/serverMedia';
import { AppEntry } from '@/src/components/AppEntry';

type MediaPageProps = {
  params: Promise<{ mediaType: string; slug: string }>;
};

const isMediaType = (value: string): value is MediaRouteType => value === 'movie' || value === 'tv';

async function getBrand() {
  const requestHeaders = await headers();
  return detectBrandFromHost(requestHeaders.get('host') || '');
}

export async function generateMetadata({ params }: MediaPageProps): Promise<Metadata> {
  const { mediaType, slug } = await params;
  if (!isMediaType(mediaType)) return {};

  const id = getMediaIdFromSlug(slug);
  if (!id) return {};

  const media = await getServerMediaDetails(id, mediaType);
  if (!media) return {};

  const brand = await getBrand();
  const title = getMediaTitle(media);
  const canonical = `${brand.canonicalUrl}${mediaType}/${getMediaSlug(media)}`;
  const description = media.overview.slice(0, 160);
  const image = media.backdrop_path
    ? getBackdropUrl(media.backdrop_path, 'original')
    : getImageUrl(media.poster_path, 'w780');

  return {
    title: `${title} | ${brand.brandName}`,
    description,
    applicationName: brand.brandName,
    category: mediaType === 'movie' ? 'Movies' : 'TV Series',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    keywords: [
      title,
      `${title} ${mediaType}`,
      `${title} cast`,
      `${title} trailer`,
      brand.brandName,
      brand.domain,
    ],
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: `${title} | ${brand.brandName}`,
      description,
      url: canonical,
      siteName: brand.brandName,
      images: [{ url: image, alt: `${title} on ${brand.brandName}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${brand.brandName}`,
      description,
      images: [image],
    },
  };
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { mediaType, slug } = await params;
  if (!isMediaType(mediaType)) notFound();

  const id = getMediaIdFromSlug(slug);
  if (!id) notFound();

  const [media, brand] = await Promise.all([getServerMediaDetails(id, mediaType), getBrand()]);
  if (!media) notFound();

  const title = getMediaTitle(media);
  const canonicalSlug = getMediaSlug(media);
  if (slug !== canonicalSlug) {
    redirect(`/${mediaType}/${canonicalSlug}`);
  }
  const canonical = `${brand.canonicalUrl}${mediaType}/${canonicalSlug}`;
  const image = media.backdrop_path
    ? getBackdropUrl(media.backdrop_path, 'original')
    : getImageUrl(media.poster_path, 'w780');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
    name: title,
    url: canonical,
    image,
    description: media.overview,
    datePublished: media.release_date || media.first_air_date,
    genre: media.genres?.map((genre) => genre.name),
    aggregateRating: media.vote_count > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: media.vote_average.toFixed(1),
          ratingCount: media.vote_count,
          bestRating: '10',
          worstRating: '1',
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: brand.brandName,
      url: brand.canonicalUrl,
      logo: `${brand.canonicalUrl}favicon.svg`,
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: brand.brandName,
        item: brand.canonicalUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: mediaType === 'movie' ? 'Movies' : 'TV Series',
        item: `${brand.canonicalUrl}${mediaType}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AppEntry initialMedia={media} />
      <noscript>
        <article>
          <h1>{title}</h1>
          <p>{media.overview}</p>
          <p>{brand.brandName} {mediaType === 'movie' ? 'movie' : 'TV series'} details.</p>
        </article>
      </noscript>
    </>
  );
}
