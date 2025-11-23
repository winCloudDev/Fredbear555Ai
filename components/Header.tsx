
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
    <header className="h-16 border-b border-yellow-500/20 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20 shadow-lg shadow-yellow-900/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(234,179,8,0.4)] border border-yellow-300/50">
          <Cpu className="text-black" size={20} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 tracking-wide">
            Fredbear555Ai
          </h1>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-green-400 flex items-center gap-1 font-semibold tracking-wider uppercase">
               <ShieldCheck size={10} /> AntiVirus
             </span>
             <span className="text-[10px] text-blue-400 flex items-center gap-1 font-semibold tracking-wider uppercase">
               <Lock size={10} /> Secure
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {userTier === 'premium' && (
          <span className="hidden md:block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-xs font-black text-black shadow-lg shadow-yellow-500/20 border border-yellow-400/50">
            PREMIUM V2.7
          </span>
        )}
        {userTier === 'free' && (
           <span className="hidden md:block px-3 py-1 rounded-full bg-neutral-800 text-xs font-bold text-yellow-500/70 border border-yellow-500/20">
             FREE v2.1
           </span>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-2 text-yellow-500/70 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <button 
          onClick={onLogout}
          className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
