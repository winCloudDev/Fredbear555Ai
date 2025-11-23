
import React, { useRef, useState, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Mic, Globe, Clapperboard, Palette, MessageSquare } from 'lucide-react';
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
      
      // Reset input
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
  const setMode = (mode: 'chat' | 'image' | 'video') => {
      onConfigChange({ ...config, activeMode: mode });
  };

  const toggleWeb = () => {
      onConfigChange({ ...config, webSearch: !config.webSearch });
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 md:p-6 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-3xl mx-auto">
        
        {/* SMART TOOLBAR */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
            {/* Chat Mode */}
            <button 
                onClick={() => setMode('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                  ${config.activeMode === 'chat' 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
            >
                <MessageSquare size={14} /> Chat
            </button>

            {/* Web Search Toggle */}
            <button 
                onClick={toggleWeb}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                  ${config.webSearch
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
            >
                <Globe size={14} /> {config.webSearch ? 'Web: ON' : 'Web Search'}
            </button>

            {/* Image Mode */}
            <button 
                onClick={() => setMode('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                  ${config.activeMode === 'image' 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
            >
                <Palette size={14} /> Make Image
            </button>

            {/* Video Mode */}
            <button 
                onClick={() => setMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                  ${config.activeMode === 'video' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
            >
                <Clapperboard size={14} /> Make Video
            </button>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group shrink-0">
                <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                   <ImageIcon size={24} className="text-gray-400" />
                </div>
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={12} />
                </button>
                <span className="text-[10px] text-gray-500 block mt-1 truncate w-16">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className={`relative flex items-end gap-2 bg-gray-50 border rounded-2xl p-2 transition-all shadow-inner 
            ${config.activeMode === 'image' ? 'border-purple-200 bg-purple-50/30' : ''}
            ${config.activeMode === 'video' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 focus-within:border-orange-400 focus-within:bg-white'}
        `}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || config.activeMode !== 'chat'}
            className="p-3 text-gray-400 hover:text-orange-500 transition-colors rounded-xl hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
            className={`p-3 transition-all rounded-xl hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed
              ${isListening ? 'text-red-600 bg-red-50 animate-pulse ring-2 ring-red-200' : 'text-gray-400 hover:text-red-500'}
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
                config.activeMode === 'image' ? "Describe the image you want to create..." :
                config.activeMode === 'video' ? "Describe the video you want to generate..." :
                isListening ? "Listening..." : "Message FredbearAi..."
            }
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 resize-none py-3 max-h-[120px] overflow-y-auto text-base"
            rows={1}
          />

          <button 
            onClick={handleSend}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            className={`p-3 rounded-xl transition-all duration-200
              ${(!text.trim() && attachments.length === 0) || disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : config.activeMode === 'image' ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-500/20'
                : config.activeMode === 'video' ? 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-500/20'
                : 'bg-orange-600 text-white hover:bg-orange-500 shadow-md shadow-orange-500/20'
              }`}
          >
            {config.activeMode === 'image' ? <Palette size={20}/> : config.activeMode === 'video' ? <Clapperboard size={20}/> : <Send size={20} />}
          </button>
        </div>
        
        {/* Mode Indicator / Disclaimer */}
        <div className="text-center mt-2 flex justify-center gap-2">
            {config.activeMode === 'image' && <span className="text-[10px] text-purple-600 font-bold">IMAGE GENERATION MODE</span>}
            {config.activeMode === 'video' && <span className="text-[10px] text-red-600 font-bold">VIDEO GENERATION MODE (SLOW)</span>}
            <p className="text-[10px] text-gray-400">AI may display inaccurate info. Auto-save enabled.</p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
