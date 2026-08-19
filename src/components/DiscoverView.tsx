import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, Film, Tv, Sparkles, RefreshCw, Star } from 'lucide-react';
import { MediaItem, FilterState } from '../types';
import { GENRES } from '../services/curatedData';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from './MovieCard';
import { DiscoverGridSkeleton } from './Skeletons';
import { triggerHaptic } from '../utils/haptics';

interface DiscoverViewProps {
  initialGenreId?: number | null;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ initialGenreId }) => {
  const [filters, setFilters] = useState<FilterState>({
    mediaType: 'all',
    genreId: initialGenreId || null,
    sortBy: 'popularity.desc',
    year: '',
    minRating: 0,
  });

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    if (initialGenreId) {
      setFilters((prev) => ({ ...prev, genreId: initialGenreId }));
    }
  }, [initialGenreId]);

  useEffect(() => {
    let isMounted = true;
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const data = await tmdbService.discover(filters);
        if (isMounted) {
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFiltered();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const resetFilters = () => {
    triggerHaptic('light');
    setFilters({
      mediaType: 'all',
      genreId: null,
      sortBy: 'popularity.desc',
      year: '',
      minRating: 0,
    });
  };

  const hasActiveFilters =
    filters.mediaType !== 'all' ||
    filters.genreId !== null ||
    filters.year !== '' ||
    filters.minRating > 0 ||
    filters.sortBy !== 'popularity.desc';

  return (
    <div className="w-full px-4 sm:px-6 pb-24 lg:pb-12 space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Discover & Filter</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Explore {results.length} curated movies, series, and blockbusters
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 transition-colors border border-white/10 backdrop-blur-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'all' }))}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filters.mediaType === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'movie' }))}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filters.mediaType === 'movie'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" /> Movies
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'tv' }))}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filters.mediaType === 'tv'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" /> Series
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row: Sort, Min Rating, Year */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl">
        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Sort:
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
            className="bg-white/10 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 focus:border-white/30 outline-none backdrop-blur-md"
          >
            <option value="popularity.desc" className="bg-slate-900">Most Popular</option>
            <option value="vote_average.desc" className="bg-slate-900">Highest Rated</option>
            <option value="primary_release_date.desc" className="bg-slate-900">Release Date</option>
          </select>
        </div>

        {/* Rating Filter Buttons */}
        <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Rating:
          </span>
          {[0, 7.0, 8.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setFilters((f) => ({ ...f, minRating: rate }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filters.minRating === rate
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {rate > 0 ? (
                <>
                  <Star className="w-3 h-3 fill-current" /> {rate}+
                </>
              ) : (
                'Any'
              )}
            </button>
          ))}
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 ml-0 sm:ml-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Year:
          </span>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="bg-white/10 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 focus:border-white/30 outline-none backdrop-blur-md"
          >
            <option value="" className="bg-slate-900">All Years</option>
            <option value="2026" className="bg-slate-900">2026</option>
            <option value="2025" className="bg-slate-900">2025</option>
            <option value="2024" className="bg-slate-900">2024</option>
            <option value="2023" className="bg-slate-900">2023</option>
            <option value="2022" className="bg-slate-900">2022</option>
            <option value="2020" className="bg-slate-900">2020s</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilters((f) => ({ ...f, genreId: null }))}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md ${
            filters.genreId === null
              ? 'bg-white text-black border-white shadow-md font-bold'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          All Genres
        </button>
        {GENRES.map((g) => {
          const isSelected = filters.genreId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setFilters((f) => ({ ...f, genreId: isSelected ? null : g.id }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md font-bold'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Media Results Grid */}
      {loading ? (
        <DiscoverGridSkeleton />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {results.map((item) => (
            <MovieCard key={item.id} item={item} size="md" className="w-full" />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No titles found for this filter</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your genre, release year, or rating filters to explore more movies.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
