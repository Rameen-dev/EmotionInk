import React, { useState, useEffect, useRef } from 'react';
import type { Character, EmotionState, WorldContext, HistoryItem, BlueprintState, AmbientSound, AmbientAnimation, MessageTarget, BlueprintInfo, DemoStatus } from '../types';
import CharacterCard from '../components/CharacterCard';
import EmotionMeter from '../components/EmotionMeter';
import WorldDisplay from '../components/WorldDisplay';
import ChatLog from '../components/ChatLog';
import MysteryTracker from '../components/MysteryTracker';
import StorySummaryPanel from '../components/StorySummaryPanel';
import { SendIcon, UserIcon, SpiralIcon, BookOpenIcon, MicrophoneIcon, KeyboardIcon } from '../components/icons';

interface InteractScreenProps {
  character: Character;
  emotionState: EmotionState;
  blueprintState: BlueprintState;
  worldContext: WorldContext;
  history: HistoryItem[];
  moodLabel: string;
  worldMood: string;
  ambientSound: AmbientSound | null;
  ambientAnimation: AmbientAnimation | null;
  cinematicImageUrl: string | null;
  blueprintInfo: BlueprintInfo;
  onSendMessage: (message: string, target: MessageTarget) => void;
  isLoading: boolean;
  isDemo?: boolean;
  demoStatus?: DemoStatus;
  communicationMode: 'text' | 'voice';
  setCommunicationMode: (mode: 'text' | 'voice') => void;
  isSpeaking: boolean;
}

const InteractScreen: React.FC<InteractScreenProps> = ({
  character,
  emotionState,
  blueprintState,
  worldContext,
  history,
  moodLabel,
  worldMood,
  ambientSound,
  ambientAnimation,
  cinematicImageUrl,
  blueprintInfo,
  onSendMessage,
  isLoading,
  isDemo,
  demoStatus,
  communicationMode,
  setCommunicationMode,
  isSpeaking,
}) => {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<MessageTarget>('both');
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const speechRecognition = useRef<any>(null);

  useEffect(() => {
    const userUploadEvent = history.find(item => item.role === 'user' && (item.text.startsWith('data:image') || item.text.startsWith('blob:')));
    if (userUploadEvent) {
      setCharacterImage(userUploadEvent.text);
    }
  }, [history]);

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        console.warn('Speech Recognition not supported by this browser.');
        if (communicationMode === 'voice') setCommunicationMode('text');
        return;
    }

    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    speechRecognition.current = new Recognition();
    const recognition = speechRecognition.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
            onSendMessage(transcript.trim(), target);
        }
        setMessage('');
    };
  }, [communicationMode, setCommunicationMode, onSendMessage, target]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), target);
      setMessage('');
    }
  };

  const handleToggleListening = () => {
    if (!speechRecognition.current) return;
    if (isListening) {
        speechRecognition.current.stop();
    } else {
        setMessage('');
        speechRecognition.current.start();
    }
  };

  const getTargetButtonClass = (buttonTarget: MessageTarget) => {
    const baseClass = "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 border";
    if (target === buttonTarget) {
      return `${baseClass} bg-indigo-600 text-white border-indigo-500`;
    }
    return `${baseClass} bg-slate-800/60 hover:bg-slate-700 text-slate-300 border-slate-700`;
  }
  
  const knownClues = history.filter(item => item.role === 'world').map(item => item.text);
  const currentGoal = knownClues.length > 0 ? knownClues[knownClues.length - 1] : blueprintInfo.firstFragment;

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-transparent animate-fade-in">
      <aside className="w-full md:w-[380px] h-full flex flex-col p-4 gap-4 bg-black/40 backdrop-blur-lg border-r border-slate-700/50 overflow-y-auto">
        <div id="guide-character-card">
            <CharacterCard 
                character={character} 
                moodLabel={moodLabel} 
                characterImage={characterImage} 
            />
        </div>
        <div id="guide-emotion-meters" className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4 backdrop-blur-sm">
            <EmotionMeter label="Courage" value={emotionState.courage} color="#34D399" />
            <EmotionMeter label="Fear" value={emotionState.fear} color="#F87171" />
            <EmotionMeter label="Curiosity" value={emotionState.curiosity} color="#60A5FA" />
            <EmotionMeter label="Happiness" value={emotionState.happiness} color="#FBBF24" />
        </div>
        <div id="guide-mystery-tracker">
            <MysteryTracker blueprintState={blueprintState} />
        </div>
        <div id="guide-world-display">
            <WorldDisplay worldContext={worldContext} worldMood={worldMood} ambientSound={ambientSound} ambientAnimation={ambientAnimation} />
        </div>
      </aside>

      <main className="w-full md:flex-1 h-full flex flex-col bg-transparent">
        <div id="guide-chat-log" className="flex-grow overflow-hidden relative">
            <ChatLog history={history} isSpeaking={isSpeaking} isLoading={isLoading} />
            {cinematicImageUrl && (
                <div className="absolute bottom-20 right-4 md:bottom-24 md:right-8 w-48 h-48 border-4 border-amber-300 rounded-lg shadow-2xl shadow-amber-500/20 animate-fade-in">
                    <img src={cinematicImageUrl} alt="Cinematic Moment" className="w-full h-full object-cover rounded-md"/>
                    <div className="absolute -top-3 -left-3 bg-amber-300 text-slate-900 text-xs font-bold px-2 py-1 rounded font-display tracking-wider">CINEMATIC</div>
                </div>
            )}
        </div>
        <div id="guide-chat-input" className="p-4 bg-black/40 backdrop-blur-lg border-t border-slate-700/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
                <button onClick={() => setTarget('character')} className={getTargetButtonClass('character')} disabled={isLoading} title="Talk to Character">
                    <UserIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setTarget('world')} className={getTargetButtonClass('world')} disabled={isLoading} title="Interact with World">
                    <SpiralIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setTarget('both')} className={getTargetButtonClass('both')} disabled={isLoading} title="Talk to Both">
                    All
                </button>
            </div>
            <div className="flex items-center gap-4">
                 <button
                    onClick={() => setIsSummaryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                    title="View Story Codex"
                >
                    <BookOpenIcon className="w-4 h-4" />
                    Codex
                </button>
                 <div className="flex items-center gap-1 p-0.5 bg-slate-800/60 rounded-md border border-slate-700">
                    <button 
                        onClick={() => setCommunicationMode('text')}
                        className={`p-1.5 rounded-md transition-colors ${communicationMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Text Input"
                    >
                        <KeyboardIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setCommunicationMode('voice')}
                        className={`p-1.5 rounded-md transition-colors ${communicationMode === 'voice' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Voice Input"
                    >
                        <MicrophoneIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isDemo && demoStatus === 'ended' ? "The demo has concluded." :
                isDemo ? "Ask a question to continue the story..." :
                (isLoading || isSpeaking) ? "Thinking..." :
                isListening ? "Listening..." :
                communicationMode === 'voice' ? 'Click the mic to speak...' :
                `Send a message...`
              }
              disabled={isLoading || isListening || isSpeaking || communicationMode === 'voice' || (isDemo && demoStatus === 'ended')}
              className="bg-slate-800 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 disabled:bg-slate-800/50 disabled:cursor-not-allowed"
            />
            {communicationMode === 'text' ? (
                <button
                  type="submit"
                  disabled={isLoading || isSpeaking || !message.trim() || (isDemo && demoStatus === 'ended')}
                  className="p-3 text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-lg hover:from-indigo-700 hover:to-fuchsia-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all transform hover:scale-110"
                >
                  <SendIcon className="w-6 h-6" />
                </button>
             ) : (
                <button
                  type="button"
                  onClick={handleToggleListening}
                  disabled={isLoading || isSpeaking || (isDemo && demoStatus === 'ended')}
                  className={`p-3 text-white rounded-lg transition-all transform hover:scale-110 ${
                      isListening 
                      ? 'bg-red-600 animate-pulse' 
                      : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700'
                  } focus:ring-4 focus:outline-none focus:ring-indigo-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
            )}
          </form>
        </div>
      </main>
      
      {isSummaryOpen && (
        <StorySummaryPanel
            blueprintTitle={blueprintInfo.title}
            currentGoal={currentGoal}
            knownClues={knownClues}
            currentLocation={worldContext.currentLocationName}
            emotionalStatus={moodLabel}
            worldCondition={worldMood}
            progress={blueprintState.progress}
            onClose={() => setIsSummaryOpen(false)}
        />
      )}
    </div>
  );
};

export default InteractScreen;