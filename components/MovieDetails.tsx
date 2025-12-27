import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  isAddedToWatchlist: boolean;
  onToggleWatchlist: () => void;
  isDownloaded: boolean;
  onDownload: () => void;
  recommendedMovies?: Movie[];
}

const MovieDetails: React.FC<MovieDetailsProps> = ({
  movie,
  onClose,
  isAddedToWatchlist,
  onToggleWatchlist,
  isDownloaded,
  onDownload,
  recommendedMovies = []
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(movie.videoUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);

  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    setCurrentVideoUrl(movie.videoUrl || '');
    setIsPlaying(false);
    setIsBuffering(true);
  }, [movie.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 500);
    }
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  useEffect(() => {
    const initPlayer = () => {
      const videoId = getVideoId(currentVideoUrl);
      if (!videoId || !window.YT) return;

      if (player) {
        player.loadVideoById(videoId);
        return;
      }

      const newPlayer = new window.YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setDuration(event.target.getDuration());
            setIsBuffering(false);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            setIsPlaying(event.data === 1);
            setIsBuffering(event.data === 3);
            if (event.data === 1) {
              setDuration(event.target.getDuration());
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Don't destroy on video change, only on unmount
    };
  }, [currentVideoUrl]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (player) player.destroy();
    };
  }, [player]);

  const handleEpisodeClick = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setIsBuffering(true);
    // Scroll player into view if needed
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const skip = (seconds: number) => {
    if (!player) return;
    player.seekTo(player.getCurrentTime() + seconds, true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (player) player.seekTo(time, true);
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(volume);
    } else {
      player.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (player) {
      player.setVolume(val);
      if (val > 0) player.unMute();
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).filter((v, i) => v !== '00' || i > 0).join(':');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/90 backdrop-blur-sm p-3 sm:p-4 md:pt-12">
      <div className="relative w-full max-w-6xl bg-[#181818] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300 mb-16 sm:mb-20 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[110] bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Video Player Container */}
        <div
          ref={playerRef}
          className="relative aspect-video w-full bg-black group overflow-hidden"
          onMouseMove={handleMouseMove}
          onClick={togglePlay}
        >
          <div className="absolute inset-x-0 top-0 h-full w-full scale-[1.15] origin-center">
            <div id="yt-player" className="w-full h-full pointer-events-none" />
          </div>

          {/* Custom Overlay */}
          <div className={`player-control-overlay absolute inset-0 transition-all duration-500 overflow-hidden flex flex-col justify-between ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'} ${!isPlaying ? 'bg-black/70 backdrop-blur-sm' : 'bg-gradient-to-t from-black/80 via-transparent to-black/40'}`}>
            {/* Top Info */}
            <div className="p-6 sm:p-10 pointer-events-none">
              <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-md">{movie.title}</h1>
              <p className="text-sm text-gray-300 mt-2">{movie.category} • {movie.year}</p>
            </div>

            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Pause/Play State Icon (Centered) */}
            {!isPlaying && !isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="big-play-btn p-6 shadow-2xl">
                  <svg className="w-12 h-12 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="px-4 sm:px-10 pb-6 sm:pb-8 space-y-4" onClick={e => e.stopPropagation()}>
              {/* Progress Bar */}
              <div className="group/progress player-progress-container relative w-full cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 z-10 cursor-pointer"
                />
                <div className="player-progress-bar w-full bg-gray-600 rounded-full">
                  <div
                    className="h-full bg-red-600 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="player-progress-knob" />
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 sm:space-x-8">
                  <button onClick={togglePlay} className="hover:scale-110 transition shrink-0">
                    {isPlaying ? (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>

                  <div className="hidden xs:flex items-center space-x-6">
                    <button onClick={() => skip(-10)} className="hover:scale-110 transition">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                      </svg>
                    </button>
                    <button onClick={() => skip(10)} className="hover:scale-110 transition">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center group/volume space-x-2">
                    <button onClick={toggleMute}>
                      {isMuted || volume === 0 ? (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                      ) : (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0" max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 transition-all duration-300 opacity-0 group-hover/volume:opacity-100 accent-white h-1 cursor-pointer"
                    />
                  </div>

                  <div className="text-white text-xs sm:text-base font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <button onClick={toggleFullscreen} className="hover:scale-110 transition">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info Section */}
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
              <span className="text-green-400 font-bold">{movie.year}</span>
              <span className="text-gray-400">{movie.duration}</span>
              <span className="border border-gray-400 px-1 sm:px-1.5 py-0.5 rounded-sm text-[9px] sm:text-[10px] uppercase font-bold text-gray-300">{movie.rating}</span>
              {movie.type === 'series' && movie.episodes && (
                <span className="ml-2 text-gray-400">{movie.episodes} Episodes</span>
              )}
            </div>
            <p className="text-base sm:text-lg leading-relaxed">{movie.description}</p>
          </div>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="flex space-x-3">
              <button
                onClick={onToggleWatchlist}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center group-hover:border-white transition">
                  {isAddedToWatchlist ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41 1.41z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  )}
                </div>
                <span className="text-gray-400 group-hover:text-white transition text-[10px]">Watchlist</span>
              </button>

              <button
                onClick={onDownload}
                className="flex flex-col items-center space-y-1 group"
              >
                <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center group-hover:border-white transition">
                  {isDownloaded ? (
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 4m0 0l-4-4m4 4V4"></path></svg>
                  )}
                </div>
                <span className="text-gray-400 group-hover:text-white transition text-[10px]">Download</span>
              </button>
            </div>
            <div>
              <span className="text-gray-500">Cast:</span> <span className="text-gray-200">{movie.cast || 'Liberian All-Stars, Local Talents'}</span>
            </div>
            {movie.director && (
              <div>
                <span className="text-gray-500">Director:</span> <span className="text-gray-200">{movie.director}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Genres:</span> <span className="text-gray-200">{movie.category}, Emotional, Exciting</span>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        {movie.type === 'series' && movie.episodeData && (
          <div className="px-4 sm:px-6 md:px-8 py-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Episodes</h3>
              <div className="text-gray-400 text-sm font-medium px-3 py-1 bg-white/5 rounded-full border border-white/10 uppercase tracking-widest text-[10px]">Season 1</div>
            </div>
            <div className="space-y-4">
              {movie.episodeData.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeClick(episode.videoUrl)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl cursor-pointer transition-all duration-300 group/ep ${currentVideoUrl === episode.videoUrl ? 'bg-white/10 shadow-2xl ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                >
                  <div className="text-2xl font-black text-gray-700 w-12 shrink-0 hidden sm:block group-hover/ep:text-white transition-colors italic">
                    {episode.episodeNumber}
                  </div>
                  <div className="relative w-full sm:w-48 lg:w-56 aspect-video rounded-lg overflow-hidden shrink-0 shadow-2xl">
                    <img src={episode.thumbnail} alt={episode.title} className="w-full h-full object-cover transition duration-700 group-hover/ep:scale-110" />
                    <div className="absolute inset-0 bg-black/40 group-hover/ep:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center translate-y-4 opacity-0 group-hover/ep:translate-y-0 group-hover/ep:opacity-100 transition duration-500 shadow-xl">
                        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    {currentVideoUrl === episode.videoUrl && (
                      <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-red-600 p-2 rounded-full shadow-2xl">
                          <div className="flex space-x-0.5 items-end h-4 w-4">
                            <div className="w-1 bg-white animate-[bounce_0.6s_infinite] h-2" />
                            <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.1s] h-4" />
                            <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.2s] h-3" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-8 flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover/ep:text-red-500 transition-colors truncate">
                        {episode.episodeNumber}. {episode.title}
                      </h4>
                      <span className="text-xs sm:text-sm text-gray-400 font-bold bg-white/5 py-1 px-2 rounded shrink-0 ml-4">{episode.duration}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 md:line-clamp-3 group-hover/ep:text-gray-300 transition-colors">
                      {episode.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Section */}
        {recommendedMovies.length > 0 && (
          <div className="p-4 sm:p-6 md:p-8 bg-[#181818] border-t border-gray-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {recommendedMovies.map(rec => (
                <div
                  key={rec.id}
                  className="group/rec cursor-pointer bg-[#2f2f2f] rounded-md overflow-hidden transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-video">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/rec:bg-black/0 transition-colors" />
                    <div className="absolute right-2 top-2">
                      <span className="bg-black/50 text-[10px] px-1 border border-gray-500 rounded text-gray-300">{rec.duration}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400 font-bold text-xs">{rec.year}</span>
                      <span className="border border-gray-500 px-1 rounded text-[8px] uppercase">{rec.rating}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-100 truncate">{rec.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
