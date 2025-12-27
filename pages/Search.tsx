
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { searchAIContent } from '../services/geminiService';

interface SearchPageProps {
  query: string;
  allMovies: Movie[];
  onSelect: (movie: Movie) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ query, allMovies, onSelect }) => {
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      const localResults = allMovies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(localResults);
      setIsSearching(false);

      setAiSearching(true);
      const aiMatchedIds = await searchAIContent(query, allMovies);
      const aiResults = allMovies.filter(m => aiMatchedIds.includes(m.id));

      setResults(prev => {
        const combined = [...prev, ...aiResults];
        return combined.filter((m, idx) => combined.findIndex(item => item.id === m.id) === idx);
      });

      setAiSearching(false);
    };

    const timeout = setTimeout(performSearch, 400);
    return () => clearTimeout(timeout);
  }, [query, allMovies]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="aspect-video bg-gray-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  const AILoader = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-500/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-pulse flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 bg-[length:200%_auto] animate-shimmer">
          AI Discovering Content
        </h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto px-4">
          Our Gemini AI is analyzing thousands of scenes to find your perfect matches...
        </p>
      </div>
    </div>
  );

  return (
    <div className="pt-24 px-3 sm:px-6 md:px-12 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl text-gray-400">
          Search results for: <span className="text-white font-bold">{query || '...'}</span>
        </h2>
        {isSearching && !results.length && <LoadingSkeleton />}
      </div>

      {!isSearching && query && (
        <>
          {aiSearching && <AILoader />}

          {results.length === 0 && !aiSearching ? (
            <div className="flex flex-col items-center justify-center pt-16 sm:pt-20 text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-base sm:text-lg">No results found for "{query}"</p>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Try keywords like "Liberian History", "L-Pop", "Documentary", or "Music"</p>
            </div>
          ) : (
            results.length > 0 && (
              <>
                {aiSearching && (
                  <div className="mb-4 text-sm text-blue-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <span className="animate-pulse">AI enhancing your results...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {results.map(movie => (
                    <div
                      key={movie.id}
                      onClick={() => onSelect(movie)}
                      className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs font-bold truncate text-white">{movie.title}</p>
                        <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] text-gray-300 mt-1">
                          <span className="text-green-400 font-bold">{movie.year}</span>
                          <span className="border border-gray-400 px-1 rounded text-[8px]">{movie.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </>
      )}

      {!query && (
        <div className="flex flex-col items-center justify-center pt-20 sm:pt-32 text-center px-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mb-8 rounded-full bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Find your next favorite</h3>
          <p className="text-gray-500 text-sm sm:text-base max-w-md">
            Search for Liberian movies, documentaries, music videos, and more. AI-powered to give you the best results.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
