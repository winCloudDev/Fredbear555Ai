
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import AuthFlow from './components/AuthFlow';
import LoadingScreen from './components/LoadingScreen';
import { AppConfig, ChatMessage, LoadingState, Attachment, UserTier, ModelId, ChatSession } from './types';
import { DEFAULT_CONFIG, MODEL_OPTIONS } from './constants';
import { streamGeminiResponse } from './services/geminiService';

const STORAGE_KEY_SESSIONS = 'fredbear_sessions_v1';
const STORAGE_KEY_CONFIG = 'fredbear_config';
const STORAGE_KEY_TIER = 'fredbear_tier';
const STORAGE_KEY_CURRENT_ID = 'fredbear_current_id';

const App: React.FC = () => {
  // App State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  // Derived State: Messages for current session
  const messages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  // 1. INITIALIZATION (Persistent Login & Load Data)
  useEffect(() => {
    const initializeApp = async () => {
        // Simulate "System Boot" for effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Load Auth
        const savedTier = localStorage.getItem(STORAGE_KEY_TIER) as UserTier;
        if (savedTier) {
            setUserTier(savedTier);
            setIsAuthenticated(true);
        }

        // Load Config
        const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) { console.error("Config load error", e); }
        }

        // Load Sessions (The "Folder/Save" System)
        const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
        const lastSessionId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
        
        if (savedSessions) {
            try {
                const parsedSessions = JSON.parse(savedSessions);
                setSessions(parsedSessions);
                
                if (parsedSessions.length > 0) {
                    // Restore last session or first one
                    if (lastSessionId && parsedSessions.find((s: ChatSession) => s.id === lastSessionId)) {
                        setCurrentSessionId(lastSessionId);
                    } else {
                        setCurrentSessionId(parsedSessions[0].id);
                    }
                } else {
                    createNewSession();
                }
            } catch (e) { 
                console.error("Sessions load error", e); 
                createNewSession();
            }
        } else {
            createNewSession();
        }

        setIsAppLoading(false);
    };

    initializeApp();
  }, []);

  // 2. AUTO-SAVE LOGIC (Persistent Device Storage)
  useEffect(() => {
      if (!isAppLoading && sessions.length > 0) {
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      }
  }, [sessions, isAppLoading]);

  useEffect(() => {
      if (currentSessionId) {
          localStorage.setItem(STORAGE_KEY_CURRENT_ID, currentSessionId);
      }
  }, [currentSessionId]);

  useEffect(() => {
      if (!isAppLoading) {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      }
  }, [config, isAppLoading]);


  // Helper: Create New Session (Folder)
  const createNewSession = () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: 'New Chat',
          messages: [],
          lastModified: Date.now(),
          preview: 'Empty chat...'
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      return newId;
  };

  // Helper: Update Current Session Messages
  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              // Generate a smart title if it's the first message
              let title = session.title;
              if (session.messages.length === 0 && newMessages.length > 0) {
                  title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '');
              }
              
              return {
                  ...session,
                  messages: newMessages,
                  lastModified: Date.now(),
                  title: title,
                  preview: newMessages[newMessages.length - 1]?.content.slice(0, 50) || ''
              };
          }
          return session;
      }));
  };

  // Sidebar Actions
  const handleDeleteSession = (id: string) => {
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      
      if (currentSessionId === id) {
          if (newSessions.length > 0) {
              setCurrentSessionId(newSessions[0].id);
          } else {
              createNewSession();
          }
      }
  };

  const handleAuthentication = (tier: UserTier) => {
    setUserTier(tier);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEY_TIER, tier as string);
    
    // Set default config based on tier if no saved config
    if (!localStorage.getItem(STORAGE_KEY_CONFIG)) {
        if (tier === 'premium') {
           setConfig({
               ...DEFAULT_CONFIG,
               model: ModelId.PremiumTier,
           });
        } else {
            setConfig({
                ...DEFAULT_CONFIG,
                model: ModelId.FreeTier,
            });
        }
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setUserTier(null);
      localStorage.removeItem(STORAGE_KEY_TIER);
      // We keep history on device unless explicitly cleared, but reset view
      // To do a full wipe: localStorage.removeItem(STORAGE_KEY_SESSIONS);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    // Optimistic Update
    const updatedMessages = [...messages, userMessage];
    updateCurrentSessionMessages(updatedMessages);
    
    setLoadingState('streaming');

    // Placeholder for AI
    const aiMsgId = (Date.now() + 1).toString();
    const aiMessagePlaceholder: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      content: '', 
      timestamp: Date.now()
    };
    
    // Add placeholder to session
    updateCurrentSessionMessages([...updatedMessages, aiMessagePlaceholder]);

    try {
      await streamGeminiResponse(
        updatedMessages,
        text,
        attachments,
        config,
        (streamedText) => {
          // Update specific message in session
          setSessions(prev => prev.map(session => {
              if (session.id === currentSessionId) {
                  const msgs = session.messages.map(msg => 
                      msg.id === aiMsgId ? { ...msg, content: streamedText } : msg
                  );
                  return { ...session, messages: msgs, lastModified: Date.now() };
              }
              return session;
          }));
        }
      );
      
      setLoadingState('idle');
    } catch (error) {
      console.error("Generation failed", error);
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              const msgs = session.messages.map(msg => 
                  msg.id === aiMsgId ? { ...msg, content: "System Error: Connection interrupted. Auto-save protected your request." } : msg
              );
              return { ...session, messages: msgs };
          }
          return session;
      }));
      setLoadingState('error');
    }
  }, [config, messages, currentSessionId]);

  // RENDER

  if (isAppLoading) {
      return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthFlow onAuthenticated={handleAuthentication} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 overflow-hidden">
      <Header toggleSidebar={toggleSidebar} userTier={userTier} onLogout={handleLogout} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          config={config}
          onConfigChange={setConfig}
          userTier={userTier}
          // Session Props
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSwitchSession={setCurrentSessionId}
          onNewChat={createNewSession}
          onDeleteSession={handleDeleteSession}
        />
        
        <main className="flex-1 flex flex-col relative w-full transition-all duration-300">
          <MessageList 
            messages={messages} 
            isLoading={loadingState === 'streaming'}
            currentModel={MODEL_OPTIONS.find(m => m.id === config.model)?.name || 'Unknown Model'}
          />
          <InputArea 
            onSendMessage={handleSendMessage} 
            disabled={loadingState === 'streaming'} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;
