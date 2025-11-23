
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import AuthFlow from './components/AuthFlow';
import { AppConfig, ChatMessage, LoadingState, Attachment, UserTier, ModelId, ChatSession } from './types';
import { DEFAULT_CONFIG, MODEL_OPTIONS } from './constants';
import { streamGeminiResponse, generateImage, generateVideo } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userTier, setUserTier] = useState<UserTier>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  // --- SESSION MANAGEMENT PER USER ---
  // When currentUser changes (login), load THEIR sessions
  useEffect(() => {
    if (currentUser) {
        const userSessionKey = `fredbear_sessions_${currentUser}`;
        const savedSessions = localStorage.getItem(userSessionKey);
        const userConfigKey = `fredbear_config_${currentUser}`;
        const savedConfig = localStorage.getItem(userConfigKey);
        
        let loadedSessions = savedSessions ? JSON.parse(savedSessions) : [];
        
        if (loadedSessions.length === 0) {
            const newId = Date.now().toString();
            loadedSessions = [{
                id: newId,
                title: 'New Chat',
                messages: [],
                lastModified: Date.now(),
                preview: 'Empty chat...'
            }];
            setCurrentSessionId(newId);
        } else {
            // Try to restore last active session
            const lastId = localStorage.getItem(`fredbear_last_session_${currentUser}`);
            if (lastId && loadedSessions.some((s: any) => s.id === lastId)) {
                setCurrentSessionId(lastId);
            } else {
                setCurrentSessionId(loadedSessions[0].id);
            }
        }
        
        setSessions(loadedSessions);

        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        } else {
            // Initialize default config based on tier
            setConfig({
                ...DEFAULT_CONFIG,
                model: userTier === 'premium' ? ModelId.PremiumTier : ModelId.FreeTier,
            });
        }
    }
  }, [currentUser, userTier]);

  // Save sessions whenever they change (Specific to Current User)
  useEffect(() => {
      if (currentUser && sessions.length > 0) {
          localStorage.setItem(`fredbear_sessions_${currentUser}`, JSON.stringify(sessions));
      }
  }, [sessions, currentUser]);

  // Save current session ID preference
  useEffect(() => {
      if (currentUser && currentSessionId) {
          localStorage.setItem(`fredbear_last_session_${currentUser}`, currentSessionId);
      }
  }, [currentSessionId, currentUser]);

  // Save config preference
  useEffect(() => {
      if (currentUser) {
           localStorage.setItem(`fredbear_config_${currentUser}`, JSON.stringify(config));
      }
  }, [config, currentUser]);


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

  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              let title = session.title;
              if (session.messages.length === 0 && newMessages.length > 0) {
                  const content = newMessages[0].content || "Media Generation";
                  title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
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

  const handleAuthentication = (tier: UserTier, username: string) => {
    setUserTier(tier);
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
      localStorage.removeItem('fredbear_active_user'); // Clear auto-login
      setIsAuthenticated(false);
      setUserTier(null);
      setCurrentUser('');
      setSessions([]); // Clear current view
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const messages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const updatedMessages = [...messages, userMessage];
    updateCurrentSessionMessages(updatedMessages);
    setLoadingState('streaming');

    const aiMsgId = (Date.now() + 1).toString();
    let aiContent = '';

    // IMAGE GENERATION MODE
    if (config.activeMode === 'image') {
        const placeholder: ChatMessage = {
             id: aiMsgId, role: 'model', content: '🎨 Generating Image...', timestamp: Date.now()
        };
        updateCurrentSessionMessages([...updatedMessages, placeholder]);

        try {
            const base64Image = await generateImage(text);
            if (base64Image.startsWith('Error')) {
                aiContent = base64Image;
            } else {
                aiContent = `Here is your generated image:\n\n![Generated Image](${base64Image})`;
            }
            
            setSessions(prev => prev.map(s => s.id === currentSessionId ? {
                ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: aiContent } : m)
            } : s));
            setLoadingState('idle');
            return;
        } catch (e: any) {
            aiContent = "Image generation failed: " + e.message;
        }
    } 
    // VIDEO GENERATION MODE
    else if (config.activeMode === 'video') {
        const placeholder: ChatMessage = {
             id: aiMsgId, role: 'model', content: '🎥 Generating Video (This may take a minute)...', timestamp: Date.now()
        };
        updateCurrentSessionMessages([...updatedMessages, placeholder]);
        
        try {
            const videoUrl = await generateVideo(text);
             aiContent = `Here is your generated video:\n\n<video controls src="${videoUrl}" width="100%" class="rounded-lg border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20"></video>`;
        } catch (e: any) {
             aiContent = "Video generation failed: " + e.message;
        }
         
         setSessions(prev => prev.map(s => s.id === currentSessionId ? {
                ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: aiContent } : m)
            } : s));
         setLoadingState('idle');
         return;
    }
    // CHAT MODE (Default)
    else {
        const aiMessagePlaceholder: ChatMessage = {
            id: aiMsgId, role: 'model', content: '', timestamp: Date.now()
        };
        updateCurrentSessionMessages([...updatedMessages, aiMessagePlaceholder]);

        try {
            await streamGeminiResponse(
                updatedMessages,
                text,
                attachments,
                config,
                (streamedText) => {
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
        } catch (error) {
            console.error("Generation failed", error);
             setSessions(prev => prev.map(s => s.id === currentSessionId ? {
                ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: "System Error: Connection interrupted." } : m)
            } : s));
        }
    }
    
    setLoadingState('idle');
  }, [config, messages, currentSessionId, currentUser]); // Added currentUser dependency

  if (!isAuthenticated) {
    return <AuthFlow onAuthenticated={handleAuthentication} />;
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-yellow-100 overflow-hidden font-sans selection:bg-yellow-500/30 selection:text-yellow-200">
      <Header toggleSidebar={toggleSidebar} userTier={userTier} onLogout={handleLogout} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          config={config}
          onConfigChange={setConfig}
          userTier={userTier}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSwitchSession={setCurrentSessionId}
          onNewChat={createNewSession}
          onDeleteSession={handleDeleteSession}
        />
        
        <main className="flex-1 flex flex-col relative w-full transition-all duration-300 bg-neutral-950">
          <MessageList 
            messages={messages} 
            isLoading={loadingState === 'streaming'}
            currentModel={MODEL_OPTIONS.find(m => m.id === config.model)?.name || 'Unknown Model'}
          />
          <InputArea 
            onSendMessage={handleSendMessage} 
            config={config}
            onConfigChange={setConfig}
            disabled={loadingState === 'streaming'} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;
