
import React, { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Mic, Globe, Clapperboard, Palette, MessageSquare, Calculator, ShieldCheck } from 'lucide-react';
import { Attachment, AppConfig } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, config, onConfigChange, disabled }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Voice Init
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => (prev + " " + transcript).trim());
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || disabled) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Currently only image attachments are supported.");
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        const newAttachment: Attachment = {
          mimeType: file.type,
          data: base64.split(',')[1], // remove data url prefix
          name: file.name
        };
        setAttachments([...attachments, newAttachment]);
      } catch (error) {
        console.error("Error reading file", error);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Mode Helper
  const setMode = (mode: 'chat' | 'image' | 'video' | 'math' | 'checker') => {
      onConfigChange({ ...config, activeMode: mode });
  };

  const toggleWeb = () => {
      onConfigChange({ ...config, webSearch: !config.webSearch });
  };

  return (
    <div className="border-t border-yellow-500/20 bg-neutral-900/95 backdrop-blur-md p-4 md:p-6 sticky bottom-0 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.5)]">
      <div className="max-w-3xl mx-auto">
        
        {/* SMART TOOLBAR */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
            {/* Chat Mode */}
            <button 
                onClick={() => setMode('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.activeMode === 'chat' 
                    ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_-2px_rgba(234,179,8,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-yellow-500/30 hover:text-yellow-200'}
                `}
            >
                <MessageSquare size={14} /> Chat
            </button>

            {/* Math Solver Mode */}
            <button 
                onClick={() => setMode('math')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.activeMode === 'math' 
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_10px_-2px_rgba(99,102,241,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-indigo-500/30 hover:text-indigo-200'}
                `}
            >
                <Calculator size={14} /> Math Solver
            </button>

            {/* Checker Mode */}
            <button 
                onClick={() => setMode('checker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.activeMode === 'checker' 
                    ? 'bg-teal-500 text-white border-teal-500 shadow-[0_0_10px_-2px_rgba(20,184,166,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-teal-500/30 hover:text-teal-200'}
                `}
            >
                <ShieldCheck size={14} /> AI Checker
            </button>

            {/* Web Search Toggle */}
            <button 
                onClick={toggleWeb}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.webSearch
                    ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-blue-500/30 hover:text-blue-200'}
                `}
            >
                <Globe size={14} /> {config.webSearch ? 'Web: ON' : 'Web'}
            </button>

            {/* Image Mode */}
            <button 
                onClick={() => setMode('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.activeMode === 'image' 
                    ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_-2px_rgba(168,85,247,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-purple-500/30 hover:text-purple-200'}
                `}
            >
                <Palette size={14} /> Image
            </button>

            {/* Video Mode */}
            <button 
                onClick={() => setMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0
                  ${config.activeMode === 'video' 
                    ? 'bg-red-500 text-white border-red-500 shadow-[0_0_10px_-2px_rgba(239,68,68,0.5)]' 
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-red-500/30 hover:text-red-200'}
                `}
            >
                <Clapperboard size={14} /> Video
            </button>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group shrink-0">
                <div className="w-16 h-16 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden">
                   <ImageIcon size={24} className="text-neutral-500" />
                </div>
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={12} />
                </button>
                <span className="text-[10px] text-neutral-400 block mt-1 truncate w-16">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className={`relative flex items-end gap-2 bg-neutral-800/50 border rounded-2xl p-2 transition-all shadow-inner 
            ${config.activeMode === 'image' ? 'border-purple-500/30 bg-purple-900/10' : ''}
            ${config.activeMode === 'video' ? 'border-red-500/30 bg-red-900/10' : ''}
            ${config.activeMode === 'math' ? 'border-indigo-500/30 bg-indigo-900/10' : ''}
            ${config.activeMode === 'checker' ? 'border-teal-500/30 bg-teal-900/10' : ''}
            ${config.activeMode === 'chat' ? 'border-neutral-700 focus-within:border-yellow-500/50 focus-within:bg-neutral-800 focus-within:shadow-[0_0_15px_-5px_rgba(234,179,8,0.1)]' : ''}
        `}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || config.activeMode !== 'chat' && config.activeMode !== 'math' && config.activeMode !== 'checker'}
            className="p-3 text-neutral-400 hover:text-yellow-400 transition-colors rounded-xl hover:bg-yellow-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Attach Image"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />

           {/* Voice Button */}
           <button 
            onClick={toggleVoice}
            disabled={disabled}
            className={`p-3 transition-all rounded-xl hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed
              ${isListening ? 'text-red-500 bg-red-900/20 animate-pulse ring-1 ring-red-500/50' : 'text-neutral-400 hover:text-red-400'}
            `}
            title="Voice to Text"
          >
            <Mic size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
                config.activeMode === 'image' ? "Describe image to create..." :
                config.activeMode === 'video' ? "Describe video to generate..." :
                config.activeMode === 'math' ? "Enter math problem (or upload photo)..." :
                config.activeMode === 'checker' ? "Paste text/code to audit..." :
                isListening ? "Listening..." : "Message FredbearAi..."
            }
            className="flex-1 bg-transparent border-none focus:ring-0 text-yellow-100 placeholder-neutral-500 resize-none py-3 max-h-[120px] overflow-y-auto text-base"
            rows={1}
          />

          <button 
            onClick={handleSend}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            className={`p-3 rounded-xl transition-all duration-200 shadow-lg
              ${(!text.trim() && attachments.length === 0) || disabled
                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                : config.activeMode === 'image' ? 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-purple-500/30'
                : config.activeMode === 'video' ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-red-500/30'
                : config.activeMode === 'math' ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/30'
                : config.activeMode === 'checker' ? 'bg-teal-600 text-white hover:bg-teal-500 hover:shadow-teal-500/30'
                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-yellow-500/30'
              }`}
          >
            {config.activeMode === 'image' ? <Palette size={20}/> : 
             config.activeMode === 'video' ? <Clapperboard size={20}/> : 
             config.activeMode === 'math' ? <Calculator size={20} /> :
             config.activeMode === 'checker' ? <ShieldCheck size={20} /> :
             <Send size={20} />}
          </button>
        </div>
        
        {/* Mode Indicator / Disclaimer */}
        <div className="text-center mt-2 flex justify-center gap-2">
            {config.activeMode === 'image' && <span className="text-[10px] text-purple-400 font-bold tracking-wide">IMAGE MODE</span>}
            {config.activeMode === 'video' && <span className="text-[10px] text-red-400 font-bold tracking-wide">VIDEO MODE (SLOW)</span>}
            {config.activeMode === 'math' && <span className="text-[10px] text-indigo-400 font-bold tracking-wide">MATH SOLVER MODE</span>}
            {config.activeMode === 'checker' && <span className="text-[10px] text-teal-400 font-bold tracking-wide">AI CHECKER MODE</span>}
            <p className="text-[10px] text-neutral-600">AI may display inaccurate info. Auto-save enabled.</p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
