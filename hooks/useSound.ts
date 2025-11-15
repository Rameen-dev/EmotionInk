
import { useRef, useCallback, useState } from 'react';
import type { SoundEffect } from '../types';

// Gemini API audio decoding functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const useSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentSpeechSource = useRef<AudioBufferSourceNode | null>(null);

  // For continuous ambient sound
  const ambientSourceRef = useRef<AudioNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const currentAmbientCue = useRef<string | null>(null);
  const AMBIENT_VOLUME = 0.08;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);
  
  const resumeAudioContext = useCallback(() => {
      const audioCtx = getAudioContext();
      if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
      }
  }, [getAudioContext]);
  
  const toggleMute = useCallback(() => {
      setIsMuted(prev => {
          const newMutedState = !prev;
          if (newMutedState && currentSpeechSource.current) {
              currentSpeechSource.current.stop();
              setIsSpeaking(false);
          }
          // Also control ambient sound volume
          if (ambientGainRef.current) {
              const audioCtx = getAudioContext();
              if (audioCtx) {
                  const targetVolume = newMutedState ? 0 : AMBIENT_VOLUME;
                  ambientGainRef.current.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + 0.1);
              }
          }
          return newMutedState;
      });
  }, [getAudioContext]);

  const playSpeech = useCallback(async (base64Audio: string) => {
    if (isMuted) return;
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (currentSpeechSource.current) {
        currentSpeechSource.current.stop();
    }

    setIsSpeaking(true);

    try {
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioCtx,
            24000, // gemini-2.5-flash-preview-tts sample rate
            1,
        );
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        currentSpeechSource.current = source;
        source.onended = () => {
            setIsSpeaking(false);
            currentSpeechSource.current = null;
        };
    } catch (e) {
        console.error("Failed to play speech", e);
        setIsSpeaking(false);
    }

  }, [getAudioContext, isMuted]);

  const playAmbientSound = useCallback((cue: string | null) => {
    const audioCtx = getAudioContext();
    if (!audioCtx || cue === currentAmbientCue.current) return;

    const FADE_TIME = 1.0;
    const now = audioCtx.currentTime;
    currentAmbientCue.current = cue;

    // Fade out the old sound
    if (ambientGainRef.current) {
        ambientGainRef.current.gain.cancelScheduledValues(now);
        ambientGainRef.current.gain.linearRampToValueAtTime(0, now + FADE_TIME);
    }
    if (ambientSourceRef.current) {
        const oldSource = ambientSourceRef.current;
        if ('stop' in oldSource) {
           setTimeout(() => (oldSource as any).stop(), FADE_TIME * 1000);
        }
        setTimeout(() => oldSource.disconnect(), FADE_TIME * 1000);
    }

    ambientGainRef.current = null;
    ambientSourceRef.current = null;

    if (cue === null) return;
    
    // Create new gain node for fading in
    const newGain = audioCtx.createGain();
    newGain.connect(audioCtx.destination);
    const targetVolume = isMuted ? 0 : AMBIENT_VOLUME;
    newGain.gain.setValueAtTime(0, now);
    newGain.gain.linearRampToValueAtTime(targetVolume, now + FADE_TIME);
    ambientGainRef.current = newGain;
    
    let newSource: AudioNode | null = null;
    switch (cue) {
        case 'menu_hum':
        case 'static_hum': {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, now);
            osc.start();
            newSource = osc;
            break;
        }
        case 'data_corruption':
        case 'processor_whirr': {
            const osc1 = audioCtx.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(80, now);
            
            const lfo = audioCtx.createOscillator();
            lfo.type = 'square';
            lfo.frequency.setValueAtTime(5, now);
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.setValueAtTime(10, now);
            lfo.connect(lfoGain);
            lfoGain.connect(osc1.frequency);
            
            osc1.start();
            lfo.start();
            newSource = osc1;
            break;
        }
        case 'system_restore': {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now); // A4
            osc.start();
            newSource = osc;
            break;
        }
        default: { // fallback
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(70, now);
            osc.start();
            newSource = osc;
        }
    }
    
    if (newSource) {
      newSource.connect(newGain);
      ambientSourceRef.current = newSource;
    }

  }, [getAudioContext, isMuted]);

  const playSound = useCallback((type: SoundEffect) => {
    if (isMuted) return;
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    let osc1: OscillatorNode, osc2: OscillatorNode, gainNode: GainNode;

    switch (type) {
      case 'init':
        osc1 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(300, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.5);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);
        break;

      case 'character_reply':
        osc1 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880, now);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);
        break;

      case 'story_event':
        gainNode = audioCtx.createGain();
        const whiteNoise = audioCtx.createBufferSource();
        const bufferSize = audioCtx.sampleRate * 0.3;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        whiteNoise.buffer = buffer;
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        whiteNoise.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        whiteNoise.start(now);
        whiteNoise.stop(now + 0.3);
        break;
        
      case 'world_clue':
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.connect(gainNode);
        osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(528.25, now); // Slightly detuned
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
        break;
        
      case 'cinematic_moment':
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.3, now + 1.0);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
        osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(440, now + 3.0);
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 3.0);
        break;
        
      case 'send_message':
        osc1 = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);
        break;
    }
  }, [getAudioContext, isMuted]);

  return { playSound, resumeAudioContext, isMuted, toggleMute, playSpeech, isSpeaking, playAmbientSound };
};

export default useSound;
