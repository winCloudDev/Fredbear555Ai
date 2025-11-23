

import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
      <div className="relative mb-8">
        {/* Outer Ring */}
        <div className="w-24 h-24 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin"></div>
        {/* Logo Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center shadow-inner">
             <Cpu className="text-orange-600" size={32} />
          </div>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Fredbear555Ai</h1>
      
      <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-400 font-mono animate-pulse">Initializing Core Systems...</p>
          <div className="flex items-center gap-2 mt-4">
              <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center gap-1">
                  <ShieldCheck size={10} /> AUTO-SAVE ACTIVE
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                  V2.7 HYBRID
              </span>
          </div>

          <div className="mt-8 text-center px-4">
             <p className="text-xs text-gray-400 mb-1">Wait too long? Try use React Or this:</p>
             <a href="https://ai.studio/apps/drive/1PlbTtH7JKxUz23WHVR3vrjpQSdYcFTiS" target="_blank" className="text-xs text-blue-500 underline hover:text-blue-700">
               https://ai.studio/apps/drive/1PlbTtH7JKxUz23WHVR3vrjpQSdYcFTiS
             </a>
          </div>
      </div>
    </div>
  );
};

export default LoadingScreen;