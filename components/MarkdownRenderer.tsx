import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// A simple yet effective markdown parser for code blocks and paragraphs
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedBlockIndex, setCopiedBlockIndex] = React.useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockIndex(index);
    setTimeout(() => setCopiedBlockIndex(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const lines = part.split('\n');
          const language = lines[0].slice(3).trim();
          const code = lines.slice(1, -1).join('\n');
          
          return (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 my-4 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                <span className="text-xs font-mono text-gray-500 uppercase font-bold">{language || 'code'}</span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-700"
                  title="Copy code"
                >
                  {copiedBlockIndex === index ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm text-gray-800 whitespace-pre">
                  {code}
                </pre>
              </div>
            </div>
          );
        } else {
          // Regular text - split by newlines to handle paragraphs strictly
          // Basic formatting for **bold** and `code`
          const paragraphs = part.split('\n\n').filter(p => p.trim());
          
          return (
            <React.Fragment key={index}>
              {paragraphs.map((para, pIndex) => (
                <p key={`${index}-${pIndex}`} className="mb-2 text-gray-800">
                  {para.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((segment, sIndex) => {
                    if (segment.startsWith('`') && segment.endsWith('`')) {
                      return <code key={sIndex} className="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-sm font-mono mx-0.5 border border-gray-200">{segment.slice(1, -1)}</code>;
                    }
                    if (segment.startsWith('**') && segment.endsWith('**')) {
                      return <strong key={sIndex} className="text-black font-bold">{segment.slice(2, -2)}</strong>;
                    }
                    return segment;
                  })}
                </p>
              ))}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;