

import React from 'react';
import { X, BrainCircuit, Thermometer, Sparkles, Zap, Lock, Search, Gauge, Plus, MessageSquare, Trash2, Code, Box } from 'lucide-react';
import { AppConfig, ModelId, UserTier, ChatSession } from '../types';
import { MODEL_OPTIONS, MAX_THINKING_BUDGET } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigChange: (newConfig: AppConfig) => void;
  userTier: UserTier;
  sessions: ChatSession[];
  currentSessionId: string;
  onSwitchSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  config, 
  onConfigChange, 
  userTier,
  sessions,
  currentSessionId,
  onSwitchSession,
  onNewChat,
  onDeleteSession
}) => {
  
  const handleModelChange = (id: ModelId) => {
    if (userTier === 'free' && id === ModelId.PremiumTier) {
      alert("This model requires a Premium subscription (2$).");
      return;
    }
    onConfigChange({ ...config, model: id });
  };

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <SettingsIcon size={20} />
            Menu
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
          {/* History / Folders Section */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved Chats</label>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Auto-Save</span>
             </div>
             
             <button 
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 transition-all"
             >
                <Plus size={18} /> New Chat
             </button>

             <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                 {sessions.length === 0 && (
                     <p className="text-center text-gray-400 text-xs py-4">No saved chats yet.</p>
                 )}
                 {sessions.map(session => (
                     <div 
                        key={session.id}
                        className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                            ${session.id === currentSessionId 
                                ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-100' 
                                : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                        onClick={() => { onSwitchSession(session.id); onClose(); }}
                     >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare size={16} className={session.id === currentSessionId ? 'text-orange-500' : 'text-gray-400'} />
                            <div className="flex flex-col min-w-0">
                                <span className={`text-sm font-medium truncate ${session.id === currentSessionId ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {session.title}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {formatDate(session.lastModified)}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                     </div>
                 ))}
             </div>
          </div>
          
          <div className="h-px bg-gray-100 my-4"></div>

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Core Engine</label>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((option) => {
                const isLocked = userTier === 'free' && option.id === ModelId.PremiumTier;
                const isSelected = config.model === option.id;
                
                return (
                  <div 
                    key={option.id}
                    onClick={() => handleModelChange(option.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden
                      ${isSelected
                        ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                      ${isLocked ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {option.id === ModelId.FreeTier ? <Zap size={16} className="text-gray-500"/> : <Sparkles size={16} className="text-amber-500"/>}
                      <span className={`font-bold text-sm ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}>
                        {option.name}
                      </span>
                      {isLocked && <Lock size={14} className="text-gray-400 ml-auto" />}
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Toggles */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Advanced Features</label>
            
            {/* Make App Mode */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Code size={16} className="text-blue-600" />
                  Make App / Exe
               </div>
               <div 
                 className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${config.makeAppMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                 onClick={() => onConfigChange({...config, makeAppMode: !config.makeAppMode})}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.makeAppMode ? 'translate-x-5' : ''}`} />
               </div>
            </div>

            {/* Fast Think */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Gauge size={16} className="text-blue-500" />
                  Fast Think
               </div>
               <div 
                 className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${config.fastThink ? 'bg-blue-500' : 'bg-gray-300'}`}
                 onClick={() => onConfigChange({...config, fastThink: !config.fastThink, moreThink: false})}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.fastThink ? 'translate-x-5' : ''}`} />
               </div>
            </div>

            {/* More Think (Premium) */}
            <div className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg transition-colors ${userTier === 'free' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BrainCircuit size={16} className="text-purple-500" />
                  More Think (Deep Logic)
               </div>
               <div 
                 className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${config.moreThink ? 'bg-purple-500' : 'bg-gray-300'}`}
                 onClick={() => userTier === 'premium' && onConfigChange({...config, moreThink: !config.moreThink, fastThink: false})}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.moreThink ? 'translate-x-5' : ''}`} />
               </div>
            </div>

            {/* Double Research (Grounding) */}
            <div className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg transition-colors ${userTier === 'free' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
               <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Search size={16} className="text-green-500" />
                  Double Research
               </div>
               <div 
                 className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${config.doubleResearch ? 'bg-green-500' : 'bg-gray-300'}`}
                 onClick={() => userTier === 'premium' && onConfigChange({...config, doubleResearch: !config.doubleResearch})}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.doubleResearch ? 'translate-x-5' : ''}`} />
               </div>
            </div>

          </div>

          {/* Custom Thinking Budget Slider (Only if More Think is OFF) */}
          {config.model === ModelId.PremiumTier && !config.moreThink && !config.fastThink && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Thinking Budget
                  </label>
                  <span className="text-xs font-mono text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                    {config.thinkingBudget > 0 ? `${config.thinkingBudget}` : 'Auto'}
                  </span>
              </div>
              <input 
                  type="range"
                  min="0"
                  max={MAX_THINKING_BUDGET}
                  step="1024"
                  value={config.thinkingBudget}
                  onChange={(e) => onConfigChange({...config, thinkingBudget: Number(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          )}

          {/* System Instruction */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Instruction</label>
            <textarea 
              value={config.systemInstruction}
              onChange={(e) => onConfigChange({...config, systemInstruction: e.target.value})}
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
              placeholder="Define AI behavior..."
            />
          </div>

          {/* Temperature */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Thermometer size={14} />
                Creativity
              </label>
              <span className="text-xs font-mono text-gray-600">{config.temperature}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              value={config.temperature}
              onChange={(e) => onConfigChange({...config, temperature: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

        </div>
      </aside>
    </>
  );
};

const SettingsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default Sidebar;