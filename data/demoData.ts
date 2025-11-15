import type { Character, HistoryItem, BlueprintInfo } from '../types';

// A simple SVG of a character
export const DEMO_CHARACTER_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0f172a"/><g transform="translate(50 50) scale(0.4)"><circle cx="0" cy="-20" r="20" fill="white" /><path d="M-30 20 C -30 -10, 30 -10, 30 20 L 20 50 L -20 50 Z" fill="white" /><circle cx="-10" cy="-25" r="4" fill="black" /><circle cx="10" cy="-25" r="4" fill="black" /><path d="M-5 -15 a 5 2 0 0 0 10 0" fill="none" stroke="black" stroke-width="1.5" /></g></svg>`)}`;

// An SVG of a breakfast platter with eggs, oatmeal, and a protein shake
export const DEMO_CINEMATIC_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e293b"/><g transform="translate(15 20)"><circle cx="0" cy="0" r="10" fill="white"/><path d="M-7 0 a 7 7 0 0 0 14 0" stroke="#f59e0b" stroke-width="6" fill="none" /></g><g transform="translate(40 20)"><circle cx="0" cy="0" r="10" fill="white"/><path d="M-7 0 a 7 7 0 0 0 14 0" stroke="#f59e0b" stroke-width="6" fill="none" /></g><g transform="translate(25 65)"><path d="M0 0 C 20 -20, 60 -20, 80 0 L 70 20 L 10 20 Z" fill="#d2b48c" stroke="#a0522d" stroke-width="2"/><circle cx="20" cy="5" r="3" fill="#4682b4"/><circle cx="35" cy="-2" r="3" fill="#4682b4"/><circle cx="55" cy="4" r="3" fill="#4682b4"/><circle cx="28" cy="12" r="1.5" fill="#c3a077"/><circle cx="45" cy="10" r="1.5" fill="#c3a077"/><circle cx="60" cy="13" r="1.5" fill="#c3a077"/></g><g transform="translate(75 50)"><rect x="-15" y="0" width="30" height="40" rx="5" fill="#a0aec0" /><rect x="-10" y="5" width="20" height="10" fill="#edf2f7"/><text x="0" y="13" text-anchor="middle" font-size="6" fill="black">SHAKE</text></g></svg>`)}`;


export const DEMO_CHARACTER: Character = {
  name: 'Alex',
  shortTitle: 'the Meticulous Planner',
  description: 'An organized individual who designs every aspect of their day for peak performance, but has misplaced the crucial details of their morning fuel routine.',
  archetype: 'The Strategist',
  traits: ['Focused', 'Disciplined', 'Forgetful', 'Healthy'],
};

export const DEMO_INITIAL_STATE_FINAL = {
  emotionState: { courage: 30, fear: 40, curiosity: 60, happiness: 15 },
  blueprintState: { progress: 0, understanding: 5, complexity: 20 },
  worldContext: {
    worldName: 'The Kitchen Command Center',
    worldDescription: 'A hyper-organized kitchen where every appliance has its place, but the central plan for the morning meal has vanished.',
    currentLocationName: "The Blueprint Desk",
    currentLocationDescription: 'A clean desk in the corner of the kitchen holds a blender, a notepad, and a few key ingredients. The core instructions are missing.',
  },
  moodLabel: 'Focused but Frazzled',
  worldMood: 'Calm and orderly',
  ambientSound: { soundCue: 'static_hum', description: 'A quiet, low hum from the nearby refrigerator.' },
  ambientAnimation: { animationCue: 'ruined_temple:flickering_shadows', description: 'Early morning light streams in, highlighting specs of dust in the air.' },
  blueprintInfo: {
    title: "The Ultimate Breakfast Fuel Blueprint",
    summary: "A precise meal plan designed for optimal morning energy, but the exact ingredient ratios and steps are jumbled.",
    firstFragment: "A note on the counter says 'Protein: 40g target'. How was this achieved?",
  } as BlueprintInfo,
  history: [
      { role: 'user' as const, text: DEMO_CHARACTER_PLACEHOLDER },
      { role: 'event' as const, text: `Alex, the Meticulous Planner, stares at the note on their desk, feeling a sense of unease.` },
      { role: 'world' as const, text: `A note on the counter says 'Protein: 40g target'. How was this achieved?` }
  ]
};


export const DEMO_SCRIPT: Array<{ type: 'user' | 'response', payload: any }> = [
  {
    type: 'user',
    payload: { role: 'user', text: "40 grams of protein is a lot. What were the components of the breakfast?" },
  },
  {
    type: 'response',
    payload: {
      characterReply: "I know it was a three-part system. Eggs were definitely involved... something about 'H.B. x2'. And there was a shake, that was the main source.",
      storyEvent: "Alex glances at an egg carton and then at a large tub of protein powder. The memory feels disjointed, but the pieces are there.",
      blueprintFragment: { fromBlueprint: "A faded sticky note is found: 'H.B. x2 = 12g protein'. The code is cracked: two hard-boiled eggs." },
      updatedEmotionState: { courage: 45, fear: 25, curiosity: 75, happiness: 30 },
      updatedBlueprintState: { progress: 30, understanding: 35, complexity: 30 },
      worldUpdate: { worldMood: 'Intriguing', locationChange: { type: 'none' } },
      moodLabel: 'Puzzling it out',
      cinematic: false,
      ambientSound: { soundCue: 'processor_whirr', description: 'The soft rustle of a notepad page turning.' },
      ambientAnimation: { animationCue: 'ruined_temple:flickering_shadows', description: 'The light catches the smooth surface of the eggs.' },
    }
  },
  {
    type: 'user',
    payload: { role: 'user', text: "Okay, 2 hard-boiled eggs for 12g. What about the protein shake? What was in it?" },
  },
  {
    type: 'response',
    payload: {
      characterReply: "The shake... right. It was one scoop of whey protein. The liquid wasn't milk... it was almond milk! Unsweetened. To keep the calories controlled.",
      storyEvent: "With a surge of confidence, Alex finds the protein scoop inside the tub and measures out a perfect, level scoop. This feels correct.",
      blueprintFragment: { fromBlueprint: "A calculation on the notepad becomes clear: '1 scoop whey = 25g protein'. This plus the eggs makes 37g. Almost there." },
      updatedEmotionState: { courage: 70, fear: 10, curiosity: 65, happiness: 60 },
      updatedBlueprintState: { progress: 80, understanding: 85, complexity: 15 },
      worldUpdate: { worldMood: 'Clarifying', locationChange: { type: 'none' } },
      moodLabel: 'Recalling',
      cinematic: true,
      ambientSound: { soundCue: 'system_restore', description: 'The satisfying click of the blender lid locking into place.' },
      ambientAnimation: { animationCue: 'glowing_cave', description: 'The kitchen seems to brighten as the plan solidifies.' },
    }
  },
  {
    type: 'user',
    payload: { role: 'user', text: "37g of protein so far. There must be one last component. What about carbs for energy?" },
  },
  {
    type: 'response',
    payload: {
      characterReply: "Of course! The energy source. It was oatmeal! A small bowl. Topped with... blueberries for antioxidants, and sliced almonds for fats and the last bit of protein. That's it!",
      storyEvent: "Alex pulls the oats, blueberries, and almonds from the pantry and fridge, arranging them neatly next to the other ingredients. The full breakfast blueprint is visible.",
      blueprintFragment: { fromBlueprint: "PROJECT COMPLETE: The blueprint for 'The Ultimate Breakfast Fuel' (2 H.B. Eggs, 1 Whey Shake, Oatmeal w/ Berries & Almonds) is restored." },
      updatedEmotionState: { courage: 95, fear: 5, curiosity: 20, happiness: 95 },
      updatedBlueprintState: { progress: 100, understanding: 100, complexity: 0 },
      worldUpdate: { worldMood: 'Triumphant', locationChange: { type: 'none' } },
      moodLabel: 'Accomplished',
      cinematic: false,
      ambientSound: { soundCue: 'system_restore', description: 'A confident hum replaces the silence.' },
      ambientAnimation: { animationCue: 'starry_night:fireflies', description: 'The kitchen is filled with the bright potential of a perfectly planned meal.' },
    }
  }
];
