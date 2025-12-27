
import React, { useState, useEffect, useMemo } from 'react';
import { Profile, Movie, Download, ContentRating } from './types';
import { ALL_CONTENT } from './data/content';
import { getAIPersonalizedRecommendations } from './services/geminiService';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import ProfileSelector from './components/ProfileSelector';
import MovieDetails from './components/MovieDetails';
import DownloadsPage from './pages/Downloads';
import SearchPage from './pages/Search';
import Footer from './components/Footer';

const INITIAL_PROFILES: Profile[] = [
    { id: '1', name: 'James', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', maxRating: 'R', watchlist: [], history: [] },
    { id: '2', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', maxRating: 'PG-13', watchlist: [], history: [] },
    { id: '3', name: 'Liberia Kids', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kids', maxRating: 'G', watchlist: [], history: [] },
];

const RATING_HIERARCHY: Record<ContentRating, number> = {
    'G': 1,
    'PG': 2,
    'PG-13': 3,
    'R': 4
};

const App: React.FC = () => {
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>(() => {
        const saved = localStorage.getItem('ls_profiles');
        return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    });
    const [downloads, setDownloads] = useState<Download[]>(() => {
        const saved = localStorage.getItem('ls_downloads');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [currentPage, setCurrentPage] = useState<'home' | 'downloads' | 'search'>('home');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiRecommendations, setAiRecommendations] = useState<Movie[]>([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        localStorage.setItem('ls_profiles', JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem('ls_downloads', JSON.stringify(downloads));
    }, [downloads]);

    const filteredContent = useMemo(() => {
        if (!currentProfile) return [];
        const maxVal = RATING_HIERARCHY[currentProfile.maxRating];
        let content = ALL_CONTENT.filter(m => RATING_HIERARCHY[m.rating] <= maxVal);

        if (activeFilter !== 'all') {
            content = content.filter(m => m.type === activeFilter);
        }

        return content;
    }, [currentProfile, activeFilter]);

    const featuredItems = useMemo(() => filteredContent.filter(m => m.isFeatured), [filteredContent]);

    const heroMovie = useMemo(() => {
        if (featuredItems.length > 0) {
            const idx = Math.floor(Math.random() * featuredItems.length);
            return featuredItems[idx];
        }
        return filteredContent[0];
    }, [featuredItems, filteredContent]);

    const handleNavigate = (page: 'home' | 'downloads' | 'search', filter: string = 'all') => {
        setCurrentPage(page);
        setActiveFilter(filter);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        const fetchAiRecommendations = async () => {
            if (!currentProfile) return;
            setIsLoadingAi(true);
            try {
                const recommendedIds = await getAIPersonalizedRecommendations(currentProfile, filteredContent);
                const recommendedMovies = filteredContent.filter(m => recommendedIds.includes(m.id));
                setAiRecommendations(recommendedMovies);
            } catch (error) {
                console.error('Failed to fetch AI recommendations:', error);
                setAiRecommendations([]);
            } finally {
                setIsLoadingAi(false);
            }
        };

        const timeout = setTimeout(fetchAiRecommendations, 800);
        return () => clearTimeout(timeout);
    }, [currentProfile, filteredContent]);

    const handleToggleWatchlist = (movieId: string) => {
        if (!currentProfile) return;
        const isAdding = !currentProfile.watchlist.includes(movieId);
        const updatedProfile = {
            ...currentProfile,
            watchlist: isAdding
                ? [...currentProfile.watchlist, movieId]
                : currentProfile.watchlist.filter(id => id !== movieId)
        };
        setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
        setCurrentProfile(updatedProfile);
    };

    const handleDownload = (movieId: string) => {
        const exists = downloads.some(d => d.movieId === movieId);
        if (exists) {
            setDownloads(prev => prev.filter(d => d.movieId !== movieId));
        } else {
            const newDownload: Download = {
                movieId,
                downloadedAt: Date.now(),
                expiryAt: Date.now() + (48 * 60 * 60 * 1000)
            };
            setDownloads(prev => [...prev, newDownload]);
        }
    };

    if (!currentProfile) {
        return <ProfileSelector profiles={profiles} onSelect={setCurrentProfile} />;
    }

    const AILoadingRow = () => (
        <div className="space-y-4 px-3 sm:px-6 md:px-12 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <svg className="w-5 h-5 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                        AI Picks for {currentProfile.name}
                    </h3>
                </div>
                <div className="flex items-center space-x-2 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-blue-400 text-xs font-medium">AI Analyzing...</span>
                </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex-none w-[140px] xs:w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] h-[78px] xs:h-[90px] sm:h-[112px] md:h-[135px] lg:h-[157px] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded-lg"
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            <Navbar
                currentProfile={currentProfile}
                onSwitchProfile={() => setCurrentProfile(null)}
                onNavigate={handleNavigate}
                onSearch={setSearchQuery}
                activePage={currentPage}
                activeFilter={activeFilter}
            />

            <main className="pb-16 sm:pb-20">
                {currentPage === 'home' && (
                    <>
                        <Hero
                            movie={heroMovie}
                            onMoreInfo={setSelectedMovie}
                        />
                        <div className="relative z-10 -mt-16 sm:-mt-20 md:-mt-24 space-y-6 sm:space-y-8">
                            {activeFilter === 'all' && (
                                <>
                                    {isLoadingAi ? (
                                        <AILoadingRow />
                                    ) : aiRecommendations.length > 0 ? (
                                        <MovieRow
                                            title={`AI Picks for ${currentProfile.name}`}
                                            movies={aiRecommendations}
                                            onSelect={setSelectedMovie}
                                        />
                                    ) : null}

                                    {featuredItems.length > 0 && (
                                        <MovieRow
                                            title="Featured"
                                            movies={featuredItems}
                                            onSelect={setSelectedMovie}
                                        />
                                    )}

                                    <MovieRow
                                        title="Liberian Hits"
                                        movies={filteredContent.filter(m => m.id.startsWith('lib'))}
                                        onSelect={setSelectedMovie}
                                    />
                                </>
                            )}

                            {activeFilter !== 'all' && (
                                <MovieRow
                                    title={activeFilter === 'movie' ? 'Movies' : activeFilter === 'series' ? 'Series' : 'TV Shows'}
                                    movies={filteredContent}
                                    onSelect={setSelectedMovie}
                                />
                            )}

                            {activeFilter === 'all' && (
                                <>
                                    <MovieRow
                                        title="Trending Now"
                                        movies={filteredContent.filter(m => m.isNew)}
                                        onSelect={setSelectedMovie}
                                    />
                                    <MovieRow
                                        title="My List"
                                        movies={filteredContent.filter(m => currentProfile.watchlist.includes(m.id))}
                                        onSelect={setSelectedMovie}
                                    />
                                    <MovieRow
                                        title="Top Series"
                                        movies={filteredContent.filter(m => m.type === 'series')}
                                        onSelect={setSelectedMovie}
                                    />
                                    <MovieRow
                                        title="Documentaries"
                                        movies={filteredContent.filter(m => m.category === 'Documentary')}
                                        onSelect={setSelectedMovie}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}

                {currentPage === 'downloads' && (
                    <DownloadsPage
                        downloads={downloads}
                        allMovies={ALL_CONTENT}
                        onSelect={setSelectedMovie}
                        onRemove={handleDownload}
                    />
                )}

                {currentPage === 'search' && (
                    <SearchPage
                        query={searchQuery}
                        allMovies={filteredContent}
                        onSelect={setSelectedMovie}
                    />
                )}
            </main>

            <Footer />

            {selectedMovie && (
                <MovieDetails
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    isAddedToWatchlist={currentProfile.watchlist.includes(selectedMovie.id)}
                    onToggleWatchlist={() => handleToggleWatchlist(selectedMovie.id)}
                    isDownloaded={downloads.some(d => d.movieId === selectedMovie.id)}
                    onDownload={() => handleDownload(selectedMovie.id)}
                    recommendedMovies={filteredContent.filter(m =>
                        m.id !== selectedMovie.id &&
                        (m.category === selectedMovie.category || m.type === selectedMovie.type)
                    ).slice(0, 6)}
                />
            )}
        </div>
    );
};

export default App;