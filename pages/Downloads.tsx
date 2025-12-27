
import React from 'react';
import { Movie, Download } from '../types';

interface DownloadsPageProps {
  downloads: Download[];
  allMovies: Movie[];
  onSelect: (movie: Movie) => void;
  onRemove: (movieId: string) => void;
}

const DownloadsPage: React.FC<DownloadsPageProps> = ({ downloads, allMovies, onSelect, onRemove }) => {
  const downloadedMovies = downloads.map(d => {
    const movie = allMovies.find(m => m.id === d.movieId);
    return movie ? { ...movie, ...d } : null;
  }).filter(Boolean) as (Movie & Download)[];

  const getTimeLeft = (expiry: number) => {
    const diff = expiry - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  return (
    <div className="pt-24 px-3 sm:px-6 md:px-12 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Downloads</h2>
        <button className="text-blue-500 hover:text-blue-400 font-medium text-sm sm:text-base w-fit">Smart Downloads: ON</button>
      </div>

      {downloadedMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-16 sm:pt-20 text-gray-500 px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </div>
          <p className="text-lg sm:text-xl">You have no downloaded titles.</p>
          <p className="mt-2 text-sm sm:text-base text-center max-w-md">Movies and TV shows you download will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {downloadedMovies.map(movie => (
            <div key={movie.id} className="bg-[#242424] rounded-lg overflow-hidden group border border-transparent hover:border-gray-700 transition hover:shadow-xl">
              <div className="relative aspect-video cursor-pointer" onClick={() => onSelect(movie)}>
                <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-white" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-600 text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Downloaded
                </div>
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold truncate text-sm sm:text-base">{movie.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{getTimeLeft(movie.expiryAt)}</p>
                </div>
                <button 
                  onClick={() => onRemove(movie.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                  title="Remove Download"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
