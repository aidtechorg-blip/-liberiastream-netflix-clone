
import React from 'react';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelect }) => {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center space-y-8 sm:space-y-12 animate-in fade-in duration-700 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium">Who's watching?</h1>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 max-w-2xl">
        {profiles.map(profile => (
          <div 
            key={profile.id} 
            className="group flex flex-col items-center space-y-3 sm:space-y-4 cursor-pointer w-28 sm:w-32"
            onClick={() => onSelect(profile)}
          >
            <div className="w-20 h-20 sm:w-24 md:w-32 sm:h-24 md:h-32 rounded overflow-hidden border-4 border-transparent group-hover:border-gray-200 transition-all">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" loading="eager" />
            </div>
            <span className="text-gray-400 text-base sm:text-lg md:text-xl group-hover:text-white transition-colors">{profile.name}</span>
          </div>
        ))}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 cursor-not-allowed group w-28 sm:w-32">
          <div className="w-20 h-20 sm:w-24 md:w-32 sm:h-24 md:h-32 rounded bg-gray-600 flex items-center justify-center text-4xl sm:text-5xl text-gray-400 group-hover:bg-gray-500 transition-all">
            +
          </div>
          <span className="text-gray-400 text-base sm:text-lg md:text-xl">Add Profile</span>
        </div>
      </div>
      <button className="border border-gray-500 text-gray-500 px-6 sm:px-8 py-2 text-base sm:text-lg uppercase tracking-widest hover:border-white hover:text-white transition">
        Manage Profiles
      </button>
    </div>
  );
};

export default ProfileSelector;
