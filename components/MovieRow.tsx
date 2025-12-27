
import React, { useRef } from 'react';
import { Movie } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, onSelect }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2 px-3 sm:px-6 md:px-12 group">
      <h3 className="text-lg sm:text-xl font-bold text-gray-100">{title}</h3>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/40 px-2 sm:px-3 opacity-0 group-hover:opacity-100 transition hover:bg-black/60 rounded-r-lg"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div
          ref={rowRef}
          className="flex space-x-2 sm:space-x-3 overflow-x-auto hide-scrollbar py-2 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {movies.map(movie => (
            <div
              key={movie.id}
              onClick={() => onSelect(movie)}
              className="flex-none w-[140px] xs:w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] h-[78px] xs:h-[90px] sm:h-[112px] md:h-[135px] lg:h-[157px] relative group/card cursor-pointer rounded-sm overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ scrollSnapAlign: 'start' }}
            >
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 group-hover/card:translate-y-[-4px]">
                <p className="text-[11px] sm:text-sm font-bold truncate text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{movie.title}</p>
                <div className="flex items-center space-x-1 sm:space-x-2 text-[9px] sm:text-[11px] text-gray-300 mt-0.5 sm:mt-1 font-medium">
                  {movie.isNew && <span className="text-green-400 font-bold">New</span>}
                  <span className="border border-gray-500/50 px-1 rounded text-[8px] bg-black/20">{movie.rating}</span>
                  <span className="hidden xs:inline">{movie.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/40 px-2 sm:px-3 opacity-0 group-hover:opacity-100 transition hover:bg-black/60 rounded-l-lg"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
