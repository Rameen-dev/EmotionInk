import React from 'react';

interface GuideStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: GuideStep[] = [
  { targetId: 'guide-character-image', position: 'right', title: "It's Alive!", content: "Your character drawing is brought to life with a subtle breathing animation, making them feel like a living part of the world." },
  { targetId: 'guide-character-card', position: 'right', title: "Your Character", content: "This is your character. The AI creates their personality, mood, and traits based on your drawing." },
  { targetId: 'guide-emotion-meters', position: 'right', title: "Emotion Meters", content: "Their feelings change based on your choices and story events. High fear might attract danger, while courage can unlock new paths." },
  { targetId: 'guide-mystery-tracker', position: 'left', title: "The Mystery", content: "Unravel the world's core secret. Your actions reveal clues, increase your understanding (Clarity), and can raise or lower the Threat." },
  { targetId: 'guide-world-display', position: 'top', title: "The Living World", content: "The world itself has a mood and can change locations. The sights and sounds are described here." },
  { targetId: 'guide-chat-log', position: 'top', title: "The Story Unfolds", content: "Follow the narrative here. You'll see your messages, character replies, and key story events." },
  { targetId: 'guide-chat-input', position: 'top', title: "Drive the Story", content: "Interact by typing here. You can talk to your Character, the World, or Both to see how they react." },
];

interface DemoGuideProps {
  step: number;
  onNext: () => void;
  onEnd: () => void;
}

const DemoGuide: React.FC<DemoGuideProps> = ({ step, onNext, onEnd }) => {
  if (step >= STEPS.length) return null;

  const currentStep = STEPS[step];
  const targetElement = document.getElementById(currentStep.targetId);
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const getPositionStyles = (): React.CSSProperties => {
    switch (currentStep.position) {
      case 'right':
        return { top: rect.top, left: rect.right + 16, transform: 'translateY(0)' };
      case 'left':
        return { top: rect.top, right: window.innerWidth - rect.left + 16, transform: 'translateY(0)' };
      case 'bottom':
        return { top: rect.bottom + 16, left: rect.left, transform: 'translateX(0)' };
      case 'top':
      default:
        return { bottom: window.innerHeight - rect.top + 16, left: rect.left, transform: 'translateX(0)'};
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 animate-fade-in">
      <div 
        className="absolute w-72 bg-slate-800 p-4 rounded-lg border border-fuchsia-500 shadow-2xl shadow-fuchsia-500/20"
        style={getPositionStyles()}
      >
        <h3 className="text-lg font-bold text-fuchsia-400 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-slate-300 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{step + 1} / {STEPS.length}</span>
            <button onClick={step < STEPS.length - 1 ? onNext : onEnd} className="px-4 py-2 bg-fuchsia-600 text-white text-sm font-semibold rounded-md hover:bg-fuchsia-700 transition-colors">
                {step < STEPS.length - 1 ? 'Next' : 'Got it!'}
            </button>
        </div>
      </div>
      <div 
        className="absolute border-2 border-dashed border-fuchsia-500 rounded-lg pointer-events-none transition-all duration-300"
        style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
        }}
      />
    </div>
  );
};

export default DemoGuide;