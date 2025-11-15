import React, { useState, useEffect } from 'react';
import type { GameState, Character, EmotionState, WorldContext, HistoryItem, BlueprintState, AmbientSound, AmbientAnimation, MessageTarget, BlueprintInfo, DemoStatus } from './types';
import { initCharacter, interact, fileToBase64, generateSpeech, generateSuccessSummary } from './services/geminiService';
import InitScreen from './screens/InitScreen';
import InteractScreen from './screens/InteractScreen';
import SuccessScreen from './screens/SuccessScreen';
import { RestartIcon, SpeakerOnIcon, SpeakerOffIcon, SparklesIcon } from './components/icons';
import useSound from './hooks/useSound';
import CinematicBackground from './components/CinematicBackground';
import DemoGuide from './components/DemoGuide';
import { DEMO_CHARACTER, DEMO_INITIAL_STATE_FINAL, DEMO_SCRIPT, DEMO_CINEMATIC_PLACEHOLDER } from './data/demoData';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('init');
  const [character, setCharacter] = useState<Character | null>(null);
  const [emotionState, setEmotionState] = useState<EmotionState | null>(null);
  const [blueprintState, setBlueprintState] = useState<BlueprintState | null>(null);
  const [worldContext, setWorldContext] = useState<WorldContext | null>(null);
  const [blueprintInfo, setBlueprintInfo] = useState<BlueprintInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [moodLabel, setMoodLabel] = useState('');
  const [worldMood, setWorldMood] = useState('');
  const [ambientSound, setAmbientSound] = useState<AmbientSound | null>(null);
  const [ambientAnimation, setAmbientAnimation] = useState<AmbientAnimation | null>(null);
  const [cinematicImageUrl, setCinematicImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [communicationMode, setCommunicationMode] = useState<'text' | 'voice'>('text');
  const [successSummary, setSuccessSummary] = useState<string | null>(null);

  // Demo specific states
  const [demoStep, setDemoStep] = useState(0); // For both guide and story
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('guide');

  const { playSound, resumeAudioContext, isMuted, toggleMute, playSpeech, isSpeaking, playAmbientSound } = useSound();
  
  const clamp = (value: number) => Math.max(0, Math.min(100, value));

  // Effect to manage continuous ambient sound
  useEffect(() => {
    if (gameState === 'loading' && !character) { // Loading from init screen
      playAmbientSound('menu_hum');
    } else if ((gameState === 'interact' || gameState === 'demo') && ambientSound) {
      playAmbientSound(ambientSound.soundCue);
    } else if (gameState === 'init' || gameState === 'error' || gameState === 'success') {
      playAmbientSound(null); // Stop sound on restart, error, or success
    }
  }, [gameState, ambientSound, character, playAmbientSound]);

  const handleCharacterCreate = async (file: File, name: string, vibe: string) => {
    setGameState('loading');
    setError(null);
    resumeAudioContext(); // Resume audio context on first user interaction
    try {
      const base64Image = await fileToBase64(file);
      const mimeType = file.type;
      const response = await initCharacter(base64Image, mimeType, name, vibe);
      
      setCharacter(response.character);
      setEmotionState(response.emotionState);
      setBlueprintState(response.blueprintState);
      setAmbientSound(response.ambientSound);
      setAmbientAnimation(response.ambientAnimation);
      setBlueprintInfo(response.blueprintInfo);

      const newWorldContext = {
        worldName: response.worldSeed.worldName,
        worldDescription: response.worldSeed.worldDescription,
        currentLocationName: response.worldSeed.startingLocationName,
        currentLocationDescription: response.worldSeed.startingLocationDescription,
      };
      setWorldContext(newWorldContext);
      setMoodLabel(response.moodLabel);
      setWorldMood('calm and quiet'); // Initial mood
      playSound('init');

      // Store image in history and add first events
      const imagePreviewUrl = URL.createObjectURL(file);
      setHistory([
          { role: 'user', text: imagePreviewUrl }, // Use object URL for display
          { role: 'event', text: `${response.character.name} comes to life in ${newWorldContext.currentLocationName}!` },
          { role: 'world', text: response.blueprintInfo.firstFragment }
      ]);
      setGameState('interact');
    } catch (e) {
      console.error(e);
      setError('Failed to bring character to life. The AI may be experiencing heavy load. Please try again.');
      setGameState('error');
    }
  };

  const handleDemoInteraction = (userMessage: string) => {
    // Find the next response in the script, starting from the current step
    const nextResponseIndex = DEMO_SCRIPT.findIndex((item, index) => index >= demoStep && item.type === 'response');

    if (nextResponseIndex === -1) {
        setDemoStatus('ended');
        setHistory(prev => [
            ...prev,
            { role: 'user', text: userMessage },
            { role: 'event', text: "This concludes the demo! Click the restart icon to create your own character." }
        ]);
        return;
    }

    setGameState('loading');
    
    // 1. Add the real user message to history
    const updatedHistory = [...history, { role: 'user' as const, text: userMessage }];
    setHistory(updatedHistory);
    playSound('send_message');

    // 2. Get the scripted response
    const responseEvent = DEMO_SCRIPT[nextResponseIndex];
    const { payload } = responseEvent;

    // 3. Simulate thinking and apply the response
    setTimeout(() => {
        const clampedEmotionState = {
            courage: clamp(payload.updatedEmotionState.courage),
            fear: clamp(payload.updatedEmotionState.fear),
            curiosity: clamp(payload.updatedEmotionState.curiosity),
            happiness: clamp(payload.updatedEmotionState.happiness),
        };
        setEmotionState(clampedEmotionState);
        setBlueprintState(payload.updatedBlueprintState);
        setMoodLabel(payload.moodLabel);
        setWorldMood(payload.worldUpdate.worldMood);
        setAmbientSound(payload.ambientSound);
        setAmbientAnimation(payload.ambientAnimation);
        
        if (payload.worldUpdate.locationChange.type !== 'none' && worldContext) {
            setWorldContext({
                ...worldContext,
                currentLocationName: payload.worldUpdate.locationChange.newLocationName,
                currentLocationDescription: payload.worldUpdate.locationChange.newLocationDescription,
            });
        }

        if (payload.cinematic) {
            setCinematicImageUrl(DEMO_CINEMATIC_PLACEHOLDER);
            playSound('cinematic_moment');
        } else {
            setCinematicImageUrl(null);
        }

        const newHistoryItems: HistoryItem[] = [];
        if (payload.characterReply) {
            newHistoryItems.push({ role: 'character', text: payload.characterReply });
            playSound('character_reply');
        }
        if (payload.storyEvent) {
            newHistoryItems.push({ role: 'event', text: payload.storyEvent });
            setTimeout(() => playSound('story_event'), 300);
        }
        if (payload.blueprintFragment && payload.blueprintFragment.fromBlueprint) {
            newHistoryItems.push({ role: 'world', text: payload.blueprintFragment.fromBlueprint });
            setTimeout(() => playSound('world_clue'), 600);
        }
        setHistory(prev => [...prev, ...newHistoryItems]);

        if (payload.updatedBlueprintState.progress >= 100) {
            setSuccessSummary("Through logical questioning and empathy, you guided Ada from a state of confusion to a moment of brilliant insight. This journey shows how breaking down a complex problem into smaller, manageable questions can pave the way for a creative breakthrough.");
            setGameState('success');
            return;
        }

        setGameState('demo'); // Re-enable input
    }, 1000); // 1 second delay

    // Update demoStep to be after the response we just used.
    setDemoStep(nextResponseIndex + 1);
};


  const handleSendMessage = async (message: string, target: MessageTarget) => {
    if (gameState === 'demo') {
        handleDemoInteraction(message);
        return;
    }
    
    if (!character || !emotionState || !worldContext || !blueprintState || !blueprintInfo) return;
    setGameState('loading');
    setError(null);
    setCinematicImageUrl(null);

    const updatedHistory = [...history, { role: 'user' as const, text: message }];
    setHistory(updatedHistory);
    playSound('send_message');

    try {
      const { interaction: response, cinematicImageUrl: newCinematicUrl } = await interact(
        character,
        emotionState,
        blueprintState,
        worldContext,
        updatedHistory,
        message,
        target,
        moodLabel // Pass mood for better TTS
      );
      
      const clampedEmotionState = {
          courage: clamp(response.updatedEmotionState.courage),
          fear: clamp(response.updatedEmotionState.fear),
          curiosity: clamp(response.updatedEmotionState.curiosity),
          happiness: clamp(response.updatedEmotionState.happiness),
      };
      setEmotionState(clampedEmotionState);

      setBlueprintState(response.updatedBlueprintState);
      setMoodLabel(response.moodLabel);
      setWorldMood(response.worldUpdate.worldMood);
      setAmbientSound(response.ambientSound);
      setAmbientAnimation(response.ambientAnimation);
      
      if(newCinematicUrl) {
        setCinematicImageUrl(newCinematicUrl);
        playSound('cinematic_moment');
      }

      if (response.worldUpdate.locationChange.type !== 'none') {
        setWorldContext(prev => ({
            ...(prev as WorldContext),
            currentLocationName: response.worldUpdate.locationChange.newLocationName,
            currentLocationDescription: response.worldUpdate.locationChange.newLocationDescription,
        }));
      }

      const newHistoryItems: HistoryItem[] = [];
      if (response.characterReply) {
        newHistoryItems.push({ role: 'character', text: response.characterReply });
        playSound('character_reply');
        if (communicationMode === 'voice') {
            const audioData = await generateSpeech(response.characterReply, response.moodLabel);
            if (audioData) {
                playSpeech(audioData);
            }
        }
      }
      if (response.storyEvent) {
        newHistoryItems.push({ role: 'event', text: response.storyEvent });
        setTimeout(() => playSound('story_event'), 300);
      }
       if (response.blueprintFragment && response.blueprintFragment.fromBlueprint) {
        newHistoryItems.push({ role: 'world', text: response.blueprintFragment.fromBlueprint });
        setTimeout(() => playSound('world_clue'), 600);
      }
      const finalHistory = [...updatedHistory, ...newHistoryItems];
      setHistory(prev => [...prev, ...newHistoryItems]);

      if (response.updatedBlueprintState.progress >= 100) {
        setGameState('loading'); // Show loading while generating summary
        const summary = await generateSuccessSummary(finalHistory, blueprintInfo);
        setSuccessSummary(summary);
        setGameState('success');
      } else {
        setGameState('interact');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected event occurred. The story is paused.');
      setGameState('error');
    }
  };

  const handleStartDemo = () => {
    resumeAudioContext();
    setCharacter(DEMO_CHARACTER);
    setEmotionState(DEMO_INITIAL_STATE_FINAL.emotionState);
    setBlueprintState(DEMO_INITIAL_STATE_FINAL.blueprintState);
    setWorldContext(DEMO_INITIAL_STATE_FINAL.worldContext);
    setBlueprintInfo(DEMO_INITIAL_STATE_FINAL.blueprintInfo);
    setHistory(DEMO_INITIAL_STATE_FINAL.history);
    setMoodLabel(DEMO_INITIAL_STATE_FINAL.moodLabel);
    setWorldMood(DEMO_INITIAL_STATE_FINAL.worldMood);
    setAmbientSound(DEMO_INITIAL_STATE_FINAL.ambientSound);
    setAmbientAnimation(DEMO_INITIAL_STATE_FINAL.ambientAnimation);
    setCinematicImageUrl(null);
    setError(null);
    setDemoStep(0);
    setDemoStatus('guide');
    setGameState('demo');
    setCommunicationMode('text'); // Voice is disabled in demo
    playSound('init');
  };

  const handleDemoGuideNext = () => {
    setDemoStep(prev => prev + 1);
  };

  const handleDemoGuideEnd = () => {
    setDemoStatus('story');
    setDemoStep(0); // Reset step for story progression
  };
  
  const handleRestart = () => {
    setGameState('init');
    setCharacter(null);
    setEmotionState(null);
    setBlueprintState(null);
    setWorldContext(null);
    setBlueprintInfo(null);
    setHistory([]);
    setMoodLabel('');
    setWorldMood('');
    setAmbientSound(null);
    setAmbientAnimation(null);
    setCinematicImageUrl(null);
    setError(null);
    setSuccessSummary(null);
    setDemoStatus('guide');
    setDemoStep(0);
    setCommunicationMode('text');
  };
  
  const renderContent = () => {
    switch (gameState) {
      case 'init':
        return <InitScreen onCharacterCreate={handleCharacterCreate} isLoading={false} onStartDemo={handleStartDemo} />;
      case 'loading':
         if (!character) {
             return <InitScreen onCharacterCreate={handleCharacterCreate} isLoading={true} onStartDemo={handleStartDemo} />;
         }
      case 'interact':
      case 'demo':
        if (character && emotionState && worldContext && history && blueprintState && blueprintInfo) {
          const isDemo = gameState === 'demo';
          return (
            <>
              <InteractScreen
                character={character}
                emotionState={emotionState}
                blueprintState={blueprintState}
                worldContext={worldContext}
                history={history}
                moodLabel={moodLabel}
                worldMood={worldMood}
                ambientSound={ambientSound}
                ambientAnimation={ambientAnimation}
                cinematicImageUrl={cinematicImageUrl}
                blueprintInfo={blueprintInfo}
                onSendMessage={handleSendMessage}
                isLoading={gameState === 'loading' || isSpeaking}
                isDemo={isDemo}
                demoStatus={demoStatus}
                communicationMode={communicationMode}
                setCommunicationMode={setCommunicationMode}
                isSpeaking={isSpeaking}
              />
              {isDemo && demoStatus === 'guide' && (
                  <DemoGuide
                      step={demoStep}
                      onNext={handleDemoGuideNext}
                      onEnd={handleDemoGuideEnd}
                  />
              )}
            </>
          );
        }
        handleRestart();
        return null;
      
      case 'success':
        if (blueprintInfo && successSummary) {
          return <SuccessScreen
            blueprintInfo={blueprintInfo}
            summary={successSummary}
            cinematicImageUrl={cinematicImageUrl}
            onRestart={handleRestart}
          />
        }
        // Fallback if state is not ready
        handleRestart();
        return null;

      case 'error':
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-center animate-fade-in">
                <SparklesIcon className="w-16 h-16 text-red-500 mb-4"/>
                <h2 className="text-3xl font-bold font-display text-red-400 mb-4">A Glitch in the Ink</h2>
                <p className="text-slate-400 mb-6 max-w-md font-serif">{error}</p>
                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                    <RestartIcon className="w-5 h-5"/>
                    Start Over
                </button>
            </div>
        );
    }
  };

  return (
    <>
        <CinematicBackground 
            animationCue={ambientAnimation?.animationCue ?? null}
        />
        {renderContent()}
        {(gameState === 'interact' || gameState === 'demo' || gameState === 'error' || gameState === 'success') && (
             <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
                <button
                    onClick={toggleMute}
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    className="p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-full text-slate-300 hover:text-white transition-colors backdrop-blur-sm border border-slate-700"
                >
                    {isMuted ? <SpeakerOffIcon className="w-6 h-6" /> : <SpeakerOnIcon className="w-6 h-6" />}
                </button>
                <button
                    onClick={handleRestart}
                    title="Start a new story"
                    className="p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-full text-slate-300 hover:text-white transition-colors backdrop-blur-sm border border-slate-700"
                >
                    <RestartIcon className="w-6 h-6" />
                </button>
             </div>
        )}
    </>
  );
};

export default App;