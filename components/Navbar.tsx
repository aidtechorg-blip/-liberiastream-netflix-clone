
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';

interface NavbarProps {
  currentProfile: Profile;
  onSwitchProfile: () => void;
  onNavigate: (page: 'home' | 'downloads' | 'search', filter?: string) => void;
  onSearch: (query: string) => void;
  activePage: string;
  activeFilter?: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentProfile, onSwitchProfile, onNavigate, onSearch, activePage, activeFilter = 'all' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.length > 0) {
      onNavigate('search');
      onSearch(val);
    } else if (activePage === 'search') {
      onNavigate('home');
    }
  };

  const navigateTo = (page: 'home' | 'downloads' | 'search', filter: string = 'all') => {
    onNavigate(page, filter);
    setMobileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 px-3 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between ${isScrolled ? 'bg-[#141414]/95 backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <h1
            className="text-[#E50914] text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter cursor-pointer"
            onClick={() => navigateTo('home')}
          >
            LIBERIASTREAM
          </h1>
          <div className="hidden md:flex space-x-3 sm:space-x-4 text-sm font-medium">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-white transition ${activePage === 'home' && activeFilter === 'all' ? 'text-white font-bold' : 'text-gray-300'}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('home', 'tv-show')}
              className={`hover:text-white transition ${activeFilter === 'tv-show' ? 'text-white font-bold' : 'text-gray-300'}`}
            >
              TV Shows
            </button>
            <button
              onClick={() => navigateTo('home', 'movie')}
              className={`hover:text-white transition ${activeFilter === 'movie' ? 'text-white font-bold' : 'text-gray-300'}`}
            >
              Movies
            </button>
            <button
              onClick={() => navigateTo('home', 'series')}
              className={`hover:text-white transition ${activeFilter === 'series' ? 'text-white font-bold' : 'text-gray-300'}`}
            >
              Series
            </button>
            <button
              onClick={() => onNavigate('downloads')}
              className={`hover:text-white transition ${activePage === 'downloads' ? 'text-white font-bold' : 'text-gray-300'}`}
            >
              Downloads
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          <div className="relative group flex items-center order-2 sm:order-1">
            <svg className="w-4 h-4 text-white absolute left-2.5 sm:left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-black/50 border border-white/20 rounded-full py-1 sm:py-1.5 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm focus:outline-none focus:border-white focus:bg-black/70 w-28 sm:w-48 md:w-64 transition-all"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className="md:hidden order-1 sm:order-2 p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <div className="relative order-3">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img src={currentProfile.avatar} alt="Avatar" className="w-7 h-7 sm:w-8 sm:h-8 rounded cursor-pointer hover:ring-2 hover:ring-gray-400 transition" />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 top-full pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="bg-black/95 backdrop-blur-md border border-gray-700 w-48 py-2 text-sm rounded-lg shadow-xl">
                  <div
                    className="px-4 py-2 hover:bg-gray-800 transition cursor-pointer"
                    onClick={() => {
                      onSwitchProfile();
                      setProfileMenuOpen(false);
                    }}
                  >
                    Switch Profile
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-800 transition border-t border-gray-700 cursor-pointer">Account</div>
                  <div className="px-4 py-2 hover:bg-gray-800 transition cursor-pointer">Help Center</div>
                  <div className="px-4 py-2 hover:bg-gray-800 transition font-bold cursor-pointer">Sign out</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[49] top-[54px] sm:top-[64px] bg-[#141414]/98 backdrop-blur-lg px-6 py-8 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigateTo('home')}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium transition ${activePage === 'home' && activeFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('home', 'tv-show')}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium transition ${activeFilter === 'tv-show' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              TV Shows
            </button>
            <button
              onClick={() => navigateTo('home', 'movie')}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium transition ${activeFilter === 'movie' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Movies
            </button>
            <button
              onClick={() => navigateTo('home', 'series')}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium transition ${activeFilter === 'series' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Series
            </button>
            <button
              onClick={() => {
                onNavigate('downloads');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium transition ${activePage === 'downloads' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Downloads
            </button>
            <div className="h-px bg-gray-800 my-4" />
            <button
              onClick={() => {
                onSwitchProfile();
                setMobileMenuOpen(false);
              }}
              className="text-left py-3 px-4 rounded-lg text-lg font-medium text-gray-400 hover:bg-white/5 transition"
            >
              Switch Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
