import { NextResponse } from 'next/server';
import { DEFAULT_BRAND_CONFIG, BINGEBOX_CONFIG } from '@/src/lib/domainBranding';

// AI Plugin manifest for agentic SEO
const AI_PLUGIN_MANIFEST = {
  "schema_version": "1.0",
  "name": "Popcorn Movies AI Plugin",
  "description": "AI-powered movie and TV series discovery, recommendations, and streaming platform",
  "version": "1.0.0",
  "author": {
    "name": "Popcorn Movies Team",
    "url": "https://popcornmovies.online/",
    "email": "support@popcornmovies.online"
  },
  
  "capabilities": {
    "search": true,
    "discover": true,
    "recommendations": true,
    "personalization": true,
    "streaming": true,
    "offline": true,
    "multi_brand": true
  },
  
  "brands": [
    {
      "name": "Popcorn Movies",
      "description": "Ultimate frosted glass cinema streaming experience",
      "domain": "popcornmovies.online",
      "alternate_domains": [],
      "colors": {
        "primary": "#8B5CF6",
        "secondary": "#6366F1",
        "background": "#050508",
        "text": "#FFFFFF"
      },
      "logo": "https://popcornmovies.online/favicon.svg",
      "focus": ["movies", "trailers", "discovery", "ratings"]
    },
    {
      "name": "BingeBox",
      "description": "Ultimate streaming and cinema discovery experience",
      "domain": "bingebox.work",
      "alternate_domains": [],
      "colors": {
        "primary": "#06B6D4",
        "secondary": "#0891B2",
        "background": "#050508",
        "text": "#FFFFFF"
      },
      "logo": "https://bingebox.work/favicon.svg",
      "focus": ["binge watching", "TV series", "streaming", "marathons"]
    }
  ],
  
  "features": {
    "content_types": ["movies", "tv_series", "documentaries", "animated"],
    "languages": ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"],
    "regions": ["US", "UK", "CA", "AU", "IN", "BR", "MX", "DE", "FR", "JP"],
    "quality_options": ["720p", "1080p", "4K", "auto"],
    "streaming_servers": 11,
    "pwa_support": true,
    "offline_mode": true,
    "cloud_sync": true
  },
  
  "api": {
    "version": "1.0",
    "base_url": "https://api.popcornmovies.online/v1",
    "endpoints": {
      "search": "/search",
      "discover": "/discover",
      "trending": "/trending",
      "details": "/media/{id}",
      "recommendations": "/recommendations",
      "genres": "/genres",
      "providers": "/providers"
    },
    "authentication": {
      "required": false,
      "methods": ["anonymous", "firebase", "google_oauth"],
      "scopes": ["read:profile", "write:watchlist", "read:preferences"]
    },
    "rate_limiting": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000,
      "burst_limit": 10
    }
  },
  
  "ai_integration": {
    "tools": [
      {
        "name": "search_media",
        "description": "Search for movies and TV shows",
        "parameters": {
          "query": {
            "type": "string",
            "required": true,
            "description": "Search query"
          },
          "type": {
            "type": "string",
            "required": false,
            "enum": ["movie", "tv", "all"],
            "default": "all",
            "description": "Media type filter"
          },
          "year": {
            "type": "number",
            "required": false,
            "description": "Release year filter"
          },
          "genre": {
            "type": "number",
            "required": false,
            "description": "Genre ID filter"
          },
          "min_rating": {
            "type": "number",
            "required": false,
            "minimum": 0,
            "maximum": 10,
            "description": "Minimum rating filter"
          },
          "limit": {
            "type": "number",
            "required": false,
            "default": 20,
            "maximum": 100,
            "description": "Maximum number of results"
          }
        },
        "output_schema": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/MediaItem"
          }
        }
      },
      {
        "name": "discover_media",
        "description": "Discover media with advanced filters",
        "parameters": {
          "type": {
            "type": "string",
            "required": true,
            "enum": ["movie", "tv"],
            "description": "Media type"
          },
          "sort_by": {
            "type": "string",
            "required": false,
            "enum": ["popularity.desc", "vote_average.desc", "release_date.desc", "revenue.desc"],
            "default": "popularity.desc",
            "description": "Sort order"
          },
          "with_genres": {
            "type": "array",
            "required": false,
            "items": { "type": "number" },
            "description": "Genre IDs to include"
          },
          "primary_release_year": {
            "type": "number",
            "required": false,
            "description": "Release year"
          },
          "vote_average_gte": {
            "type": "number",
            "required": false,
            "minimum": 0,
            "maximum": 10,
            "description": "Minimum average vote"
          },
          "page": {
            "type": "number",
            "required": false,
            "default": 1,
            "minimum": 1,
            "description": "Page number"
          }
        },
        "output_schema": {
          "type": "object",
          "properties": {
            "results": {
              "type": "array",
              "items": { "$ref": "#/definitions/MediaItem" }
            },
            "page": { "type": "number" },
            "total_pages": { "type": "number" },
            "total_results": { "type": "number" }
          }
        }
      },
      {
        "name": "get_media_details",
        "description": "Get detailed information about a specific media item",
        "parameters": {
          "id": {
            "type": "number",
            "required": true,
            "description": "TMDB media ID"
          },
          "type": {
            "type": "string",
            "required": true,
            "enum": ["movie", "tv"],
            "description": "Media type"
          },
          "include": {
            "type": "array",
            "required": false,
            "items": { "type": "string" },
            "enum": ["credits", "videos", "recommendations", "reviews", "similar"],
            "description": "Additional data to include"
          }
        },
        "output_schema": {
          "$ref": "#/definitions/MediaItemDetailed"
        }
      },
      {
        "name": "get_recommendations",
        "description": "Get personalized recommendations",
        "parameters": {
          "user_id": {
            "type": "string",
            "required": false,
            "description": "User ID for personalized recommendations"
          },
          "media_id": {
            "type": "number", 
            "required": false,
            "description": "Get recommendations similar to this media"
          },
          "limit": {
            "type": "number",
            "required": false,
            "default": 10,
            "maximum": 50,
            "description": "Number of recommendations"
          },
          "type": {
            "type": "string",
            "required": false,
            "enum": ["movie", "tv", "all"],
            "default": "all",
            "description": "Media type"
          }
        },
        "output_schema": {
          "type": "array",
          "items": { "$ref": "#/definitions/MediaItem" }
        }
      },
      {
        "name": "get_trending",
        "description": "Get trending media",
        "parameters": {
          "type": {
            "type": "string",
            "required": false,
            "enum": ["movie", "tv", "all"],
            "default": "all",
            "description": "Media type"
          },
          "time_window": {
            "type": "string",
            "required": false,
            "enum": ["day", "week"],
            "default": "day",
            "description": "Time window for trending"
          }
        },
        "output_schema": {
          "type": "object",
          "properties": {
            "movies": { "type": "array", "items": { "$ref": "#/definitions/MediaItem" } },
            "tv": { "type": "array", "items": { "$ref": "#/definitions/MediaItem" } }
          }
        }
      }
    ],
    
    "prompt_examples": [
      "Find popular action movies from 2024",
      "Show me highly rated TV series with good reviews",
      "Recommend movies similar to Inception and The Matrix",
      "What are the top trending movies this week?",
      "Find family-friendly movies with high ratings",
      "Show me sci-fi movies released in the last year",
      "Find award-winning TV shows",
      "What are the most popular movies on TMDB right now?",
      "Show me movies directed by Christopher Nolan",
      "Find documentaries about space exploration"
    ]
  },
  
  "seo": {
    "sitemap": "https://popcornmovies.online/sitemap.xml",
    "robots_txt": "https://popcornmovies.online/robots.txt",
    "llms_txt": "https://popcornmovies.online/.well-known/llms.txt",
    "ai_agent_discovery": true,
    "structured_data": true,
    "open_graph": true,
    "twitter_cards": true
  },
  
  "security": {
    "cors_origins": [
      "https://popcornmovies.online",
      "https://bingebox.work"
    ],
    "content_security_policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.firebaseio.com https://*.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://image.tmdb.org https://*.googleusercontent.com; connect-src 'self' https://*.firebaseio.com https://api.themoviedb.org https://*.googleapis.com; frame-src https://www.youtube.com;",
    "authentication_required": false,
    "data_encryption": true
  },
  
  "legal": {
    "terms_of_service": "https://popcornmovies.online/terms",
    "privacy_policy": "https://popcornmovies.online/privacy",
    "cookie_policy": "https://popcornmovies.online/cookies",
    "data_source": "TMDB (The Movie Database)",
    "licensing": "All movie/TV data licensed from TMDB"
  },
  
  "support": {
    "documentation": "https://docs.popcornmovies.online",
    "api_documentation": "https://docs.popcornmovies.online/api",
    "community": "https://community.popcornmovies.online",
    "contact": "support@popcornmovies.online"
  },
  
  "definitions": {
    "MediaItem": {
      "type": "object",
      "properties": {
        "id": { "type": "number", "description": "TMDB ID" },
        "title": { "type": "string", "description": "Movie title or TV show name" },
        "name": { "type": "string", "description": "TV show name (for TV series)" },
        "overview": { "type": "string", "description": "Brief description" },
        "poster_path": { "type": "string", "description": "URL to poster image" },
        "backdrop_path": { "type": "string", "description": "URL to backdrop image" },
        "vote_average": { "type": "number", "description": "Average rating (0-10)" },
        "vote_count": { "type": "number", "description": "Number of votes" },
        "release_date": { "type": "string", "format": "date", "description": "Release date" },
        "first_air_date": { "type": "string", "format": "date", "description": "First air date (TV)" },
        "media_type": { "type": "string", "enum": ["movie", "tv"] },
        "genre_ids": { "type": "array", "items": { "type": "number" }, "description": "Genre IDs" },
        "genres": { "type": "array", "items": { "$ref": "#/definitions/Genre" }, "description": "Genre objects" },
        "runtime": { "type": "number", "description": "Runtime in minutes (movies)" },
        "number_of_seasons": { "type": "number", "description": "Number of seasons (TV)" },
        "number_of_episodes": { "type": "number", "description": "Number of episodes (TV)" },
        "popularity": { "type": "number", "description": "Popularity score" },
        "tagline": { "type": "string", "description": "Movie tagline" },
        "status": { "type": "string", "description": "Release status" },
        "adult": { "type": "boolean", "description": "Adult content flag" }
      },
      "required": ["id", "title", "poster_path", "vote_average", "media_type"]
    },
    
    "MediaItemDetailed": {
      "allOf": [
        { "$ref": "#/definitions/MediaItem" },
        {
          "type": "object",
          "properties": {
            "credits": {
              "type": "object",
              "properties": {
                "cast": { "type": "array", "items": { "$ref": "#/definitions/CastMember" } },
                "crew": { "type": "array", "items": { "$ref": "#/definitions/CrewMember" } }
              }
            },
            "videos": {
              "type": "array",
              "items": { "$ref": "#/definitions/Video" }
            },
            "recommendations": {
              "type": "array",
              "items": { "$ref": "#/definitions/MediaItem" }
            },
            "reviews": {
              "type": "array",
              "items": { "$ref": "#/definitions/Review" }
            },
            "similar": {
              "type": "array",
              "items": { "$ref": "#/definitions/MediaItem" }
            },
            "production_companies": {
              "type": "array",
              "items": { "$ref": "#/definitions/Company" }
            },
            "production_countries": {
              "type": "array",
              "items": { "$ref": "#/definitions/Country" }
            },
            "spoken_languages": {
              "type": "array",
              "items": { "$ref": "#/definitions/Language" }
            },
            "homepage": { "type": "string", "description": "Official homepage URL" },
            "imdb_id": { "type": "string", "description": "IMDb ID" },
            "revenue": { "type": "number", "description": "Box office revenue" },
            "budget": { "type": "number", "description": "Production budget" }
          }
        }
      ]
    },
    
    "Genre": {
      "type": "object",
      "properties": {
        "id": { "type": "number" },
        "name": { "type": "string" }
      },
      "required": ["id", "name"]
    },
    
    "CastMember": {
      "type": "object",
      "properties": {
        "id": { "type": "number" },
        "name": { "type": "string" },
        "character": { "type": "string" },
        "profile_path": { "type": "string" }
      },
      "required": ["id", "name", "character"]
    },
    
    "CrewMember": {
      "type": "object",
      "properties": {
        "id": { "type": "number" },
        "name": { "type": "string" },
        "job": { "type": "string" },
        "department": { "type": "string" },
        "profile_path": { "type": "string" }
      },
      "required": ["id", "name", "job"]
    },
    
    "Video": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "key": { "type": "string" },
        "name": { "type": "string" },
        "site": { "type": "string", "enum": ["YouTube", "Vimeo"] },
        "type": { "type": "string", "enum": ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes"] },
        "official": { "type": "boolean" },
        "published_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id", "key", "name", "site", "type"]
    },
    
    "Review": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "author": { "type": "string" },
        "content": { "type": "string" },
        "rating": { "type": "number", "minimum": 0, "maximum": 10 },
        "created_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id", "author", "content", "created_at"]
    },
    
    "Company": {
      "type": "object",
      "properties": {
        "id": { "type": "number" },
        "name": { "type": "string" },
        "logo_path": { "type": "string" },
        "origin_country": { "type": "string" }
      },
      "required": ["id", "name"]
    },
    
    "Country": {
      "type": "object",
      "properties": {
        "iso_3166_1": { "type": "string" },
        "name": { "type": "string" }
      },
      "required": ["iso_3166_1", "name"]
    },
    
    "Language": {
      "type": "object",
      "properties": {
        "iso_639_1": { "type": "string" },
        "name": { "type": "string" },
        "english_name": { "type": "string" }
      },
      "required": ["iso_639_1", "name"]
    }
  },
  
  "updated_at": new Date().toISOString(),
  "generated_by": "Popcorn Movies AI System"
};

export async function GET(request: Request) {
  return new NextResponse(JSON.stringify(AI_PLUGIN_MANIFEST, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
