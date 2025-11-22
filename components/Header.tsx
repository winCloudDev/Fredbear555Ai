import React from 'react';
import { Cpu, Settings, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { UserTier } from '../types';

interface HeaderProps {
  toggleSidebar: () => void;
  userTier: UserTier;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, userTier, onLogout }) => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Cpu className="text-white" size={18} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            Fredbear555Ai
          </h1>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
               <ShieldCheck size={10} /> AntiVirus
             </span>
             <span className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
               <Lock size={10} /> Secure
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {userTier === 'premium' && (
          <span className="hidden md:block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-md shadow-orange-500/20">
            PREMIUM V2.7
          </span>
        )}
        {userTier === 'free' && (
           <span className="hidden md:block px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-500 border border-gray-200">
             FREE v2.1
           </span>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <button 
          onClick={onLogout}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;