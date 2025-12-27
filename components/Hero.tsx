import React, { useState, useEffect } from 'react';
import { Movie } from '../types';

interface HeroProps {
  movie?: Movie;
  onMoreInfo: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onMoreInfo }) => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowVideo(false);
    if (movie?.videoUrl) {
      const timer = setTimeout(() => setShowVideo(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [movie?.id]);

  if (!movie) return <div className="h-[70vh] sm:h-[85vh] md:h-[95vh] bg-[#141414]" />;

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = movie.videoUrl ? getVideoId(movie.videoUrl) : null;

  return (
    <div className="relative h-[70vh] sm:h-[85vh] md:h-[95vh] w-full overflow-hidden">
      {/* Background Image / Video */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={movie.banner}
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
          loading="eager"
        />
        {showVideo && videoId && (
          <div className="absolute inset-x-0 top-0 h-full w-full scale-[1.3] origin-center">
            <iframe
              className="w-full h-full pointer-events-none"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              frameBorder="0"
            />
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent md:via-black/30 lg:via-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />

      {/* Content */}
      <div className="absolute bottom-[15%] sm:bottom-[18%] md:bottom-[22%] left-4 sm:left-8 md:left-12 max-w-[90%] sm:max-w-xl md:max-w-2xl lg:max-w-4xl space-y-3 sm:space-y-6">
        <h2 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          {movie.title}
        </h2>
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-200 line-clamp-2 sm:line-clamp-3 drop-shadow-lg font-medium max-w-sm sm:max-w-xl">
          {movie.description}
        </p>

        <div className="flex items-center space-x-3 pt-2 sm:pt-6">
          <button
            onClick={() => onMoreInfo(movie)}
            className="flex items-center space-x-2 bg-white text-black px-4 sm:px-8 py-2 sm:py-3 rounded font-bold hover:bg-white/80 transition text-sm sm:text-lg shadow-xl"
          >
            <svg className="w-5 h-5 sm:w-8 sm:h-8 fill-black" viewBox="0 0 24 24"><path d="M7 6v12l10-6z" /></svg>
            <span>Play</span>
          </button>
          <button
            onClick={() => onMoreInfo(movie)}
            className="flex items-center space-x-2 bg-gray-500/40 text-white px-4 sm:px-8 py-2 sm:py-3 rounded font-bold hover:bg-gray-500/60 transition backdrop-blur-md text-sm sm:text-lg border border-white/10"
          >
            <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>More Info</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 sm:bottom-12 md:bottom-16 right-0 bg-black/40 border-l-4 border-gray-200 py-1.5 px-6 sm:px-10 pr-10 sm:pr-16 text-sm sm:text-xl font-bold backdrop-blur-sm">
        {movie.rating}
      </div>
    </div>
  );
};

export default Hero;
