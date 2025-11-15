import React, { useRef, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { SpiralIcon, SparklesIcon } from './icons';
import TypingIndicator from './TypingIndicator';

interface ChatLogProps {
  history: HistoryItem[];
  isSpeaking: boolean;
  isLoading: boolean;
}

const ChatLog: React.FC<ChatLogProps> = ({ history, isSpeaking, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);
  
  const lastCharacterMessageIndex = history.map(item => item.role).lastIndexOf('character');
  const lastMessage = history.length > 0 ? history[history.length - 1] : null;

  const getMessageStyle = (role: HistoryItem['role']) => {
    switch (role) {
      case 'user':
        return 'bg-indigo-500/10 border border-indigo-500/30 self-end';
      case 'character':
        return 'bg-fuchsia-500/10 border border-fuchsia-500/30 self-start';
      case 'event':
      case 'world':
        return 'bg-transparent self-center w-full max-w-xl text-center';
      default:
        return 'bg-slate-800/50 self-start';
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto h-full">
      {history.map((item, index) => {
        if (item.role === 'user' && (item.text.startsWith('data:image') || item.text.startsWith('blob:'))) {
            return null;
        }

        const isLastCharacterMessage = item.role === 'character' && index === lastCharacterMessageIndex;
        const speakingStyle = isSpeaking && isLastCharacterMessage ? 'animate-speaking-pulse' : '';
        
        if (item.role === 'event' || item.role === 'world') {
          const isWorld = item.role === 'world';
          return (
            <div key={index} className={`py-3 ${getMessageStyle(item.role)}`}>
              <div className={`relative flex items-center ${isWorld ? 'justify-center' : ''}`}>
                <div className="flex-grow border-t border-dashed border-slate-700"></div>
                <div className={`flex items-center gap-2 mx-4 text-sm ${isWorld ? 'text-amber-300' : 'text-slate-400'}`}>
                   {isWorld ? <SpiralIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                   <span className={`${isWorld ? 'font-serif italic text-glow-amber' : 'italic'}`}>{item.text}</span>
                </div>
                <div className="flex-grow border-t border-dashed border-slate-700"></div>
              </div>
            </div>
          );
        }

        return (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-lg transition-all backdrop-blur-sm ${getMessageStyle(item.role)} ${speakingStyle}`}
            >
              <p className="text-slate-100 whitespace-pre-wrap font-serif text-base leading-relaxed">{item.text}</p>
            </div>
        );
      })}
      
      {isLoading && !isSpeaking && lastMessage?.role === 'user' && (
        <div className={`p-3 rounded-lg max-w-lg transition-all backdrop-blur-sm ${getMessageStyle('character')}`}>
          <TypingIndicator />
        </div>
      )}

      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatLog;
