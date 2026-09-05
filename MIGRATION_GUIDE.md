# Next.js 16 Migration Guide

This document outlines the migration from Vite + React to Next.js 16 with App Router.

## What Changed

### Project Structure
- **Before**: Vite-based SPA with React
- **After**: Next.js 16 with App Router architecture

### Key Directories
```
popcorn-movies/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (serverless functions)
│   │   ├── ai/           # AI/SEO endpoints
│   │   │   ├── llms/     # LLMs.txt endpoint
│   │   │   └── plugin/   # AI Plugin manifest
│   │   └── brands/      # Brand-specific endpoints (TBD)
│   ├── sitemap.xml/      # Dynamic sitemap
│   ├── robots.txt/       # Dynamic robots.txt
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with SEO
│   └── page.tsx         # Main page
├── src/                  # Source files (client components)
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── lib/            # Utility functions and configs
│   ├── services/       # Services (TMDB, Firebase, etc.)
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── public/               # Static assets
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
├── middleware.ts        # Next.js middleware for branding
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies and scripts
```

## Domain Branding System

### How It Works
1. **Middleware**: Detects domain from request headers
2. **Server Components**: Use `getServerDomainBranding()` for SSR SEO
3. **Client Components**: Use `getClientDomainBranding()` for client-side branding
4. **Context**: Brand config available via `useApp()` context

### Supported Brands
- **Popcorn Movies** (`popcornmovies.online`)
  - Color: Violet (#8B5CF6)
  - Focus: Movies, Trailers, Discovery
- **BingeBox** (`bingebox.ac`, `bingbox.work`)
  - Color: Cyan (#06B6D4)
  - Focus: Binge watching, TV Series, Streaming

### Brand Detection
- Server: Uses `headers()` from Next.js
- Client: Uses `window.location.hostname`
- Fallback: Defaults to Popcorn Movies

## SEO Implementation

### Static SEO (Server Components)
- **Metadata**: Dynamic metadata in `app/layout.tsx`
- **Open Graph**: Full OG tags for social sharing
- **Twitter Cards**: Twitter-specific metadata
- **JSON-LD**: Schema.org structured data

### Dynamic SEO
- **Brand Detection**: Server-side brand detection
- **Canonical URLs**: Automatic canonical URL generation
- **Alternate URLs**: Multi-brand alternate URL support
- **AI Discovery**: LLMs.txt and AI plugin manifests

### SEO Endpoints
- `/sitemap.xml` - Dynamic sitemap
- `/robots.txt` - Dynamic robots.txt
- `/api/ai/llms` - LLMs.txt for AI agents
- `/api/ai/plugin` - AI Plugin manifest

## Agentic SEO Features

### LLMs.txt
- **Purpose**: Help AI agents understand site content and capabilities
- **Location**: `/api/ai/llms` (accessible via `/.well-known/llms.txt`)
- **Content**: Site capabilities, data schema, API endpoints, usage guidelines

### AI Plugin Manifest
- **Purpose**: Enable AI tools to integrate with the platform
- **Location**: `/api/ai/plugin` (accessible via `/.well-known/ai-plugin.json`)
- **Content**: Tool definitions, parameters, schemas, examples

### AI Features Supported
- **Content Discovery**: Search, filter, trending
- **Personalization**: Recommendations based on user preferences
- **Multi-Brand**: Automatic brand switching based on domain
- **Real-time Data**: Live TMDB data integration

## Development Setup

### Install Dependencies
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

## Migration Notes

### From Vite to Next.js
1. **Entry Point**: `src/main.tsx` → `app/page.tsx`
2. **Routing**: Hash-based → File-based App Router
3. **SSR**: Client-only → Server Components + Client Components
4. **Environment**: `import.meta.env` → `process.env.NEXT_PUBLIC_*`

### Component Changes
- **Client Components**: Add `'use client'` directive
- **Server Components**: No directive needed (default)
- **Data Fetching**: Use Next.js `fetch` with caching
- **Images**: Use Next.js `<Image>` component for optimization

### Styling
- Tailwind CSS v4 compatible
- Global styles in `app/globals.css`
- Component styles remain unchanged

### Firebase
- Client-side initialization in `_app.tsx` equivalent
- Server Components cannot use Firebase directly (client-only)

## Deployment

### Recommended Platforms
- **Vercel**: Optimized for Next.js
- **Netlify**: Full Next.js support
- **AWS**: Lambda or EC2
- **Docker**: Containerized deployment

### Vercel Deployment
1. Connect Git repository
2. Select Next.js framework
3. Configure environment variables
4. Deploy

### Domain Configuration
- Add domains in project settings
- Configure SSL certificates
- Set up domain redirects if needed

## Performance Optimization

### Next.js Features Used
- **App Router**: Optimized routing and data fetching
- **Server Components**: Reduced client-side JavaScript
- **Dynamic Imports**: Code splitting for performance
- **Image Optimization**: Automatic image optimization
- **Caching**: Built-in caching strategies

### Additional Optimizations
- **CDN**: Serve static assets via CDN
- **Service Worker**: PWA service worker for offline support
- **Preloading**: Preload critical resources
- **Lazy Loading**: Load components and data on demand

## Troubleshooting

### Common Issues
1. **Headers not available in server components**
   - Use `getServerDomainBranding()` which handles headers properly
2. **Window not defined**
   - Use `'use client'` directive or check `typeof window`
3. **Environment variables not available**
   - Prefix with `NEXT_PUBLIC_` for client-side access
4. **Firebase in server components**
   - Move Firebase usage to client components

### Debugging
```bash
# Run development server with debug
npm run dev -- --debug

# Check build output
npm run build -- --debug

# Analyze bundle
npm run build -- --analyze
```

## Architecture Overview

### Server Components
- `app/layout.tsx` - Root layout with SEO
- `app/page.tsx` - Main page component
- `app/api/*` - API routes
- `middleware.ts` - Request middleware

### Client Components
- `src/components/*` - All UI components
- `src/context/*` - React context providers
- `src/utils/*` - Utility functions

### Data Flow
1. Request → Middleware → Brand Detection
2. Server Components → Generate Static/Streaming content
3. Client Components → Interactive UI with state
4. API Routes → Serverless functions for data

### SEO Strategy
1. **Server-side**: Static metadata generation
2. **Dynamic**: Brand-specific metadata based on domain
3. **AI**: LLMs.txt and plugin manifests for AI discovery
4. **Structured**: JSON-LD for rich search results

## Future Enhancements

### Planned Features
- [ ] Dynamic OG image generation
- [ ] Brand-specific favicons
- [ ] Advanced caching strategies
- [ ] Incremental Static Regeneration (ISR)
- [ ] Server Actions for mutations
- [ ] React Server Components for data fetching

### Performance Improvements
- [ ] Edge Runtime for API routes
- [ ] ISR for static pages
- [ ] Advanced image optimization
- [ ] Font optimization
- [ ] Script optimization

## Support

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Documentation](https://nextjs.org/docs/app)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Contact
- **Issues**: Report on GitHub
- **Support**: support@popcornmovies.online
- **Community**: Join our Discord/Slack

---

*Generated during migration to Next.js 16 with App Router*