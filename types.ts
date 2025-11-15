export interface Character {
  name: string;
  shortTitle: string;
  description: string;
  archetype: string;
  traits: string[];
}

export interface EmotionState {
  courage: number;
  fear: number;
  curiosity: number;
  happiness: number;
}

export interface WorldSeed {
  worldName: string;
  worldDescription: string;
  startingLocationName: string;
  startingLocationDescription: string;
}

export interface BlueprintState {
    progress: number;
    understanding: number;
    complexity: number;
}

export interface BlueprintInfo {
    title: string;
    summary: string;
    firstFragment: string;
}

export interface AmbientSound {
    soundCue: string;
    description: string;
}

export interface AmbientAnimation {
    animationCue: string;
    description: string;
}

export interface InitResponse {
  type: 'initCharacter';
  character: Character;
  emotionState: EmotionState;
  moodLabel: string;
  expressionKey: string;
  worldSeed: WorldSeed;
  blueprintState: BlueprintState;
  blueprintInfo: BlueprintInfo;
  ambientSound: AmbientSound;
  ambientAnimation: AmbientAnimation;
}

export interface EmotionDeltas {
  courage: number;
  fear: number;
  curiosity: number;
  happiness: number;
}

export interface WorldUpdate {
  worldMood: string;
  locationChange: {
    type: 'none' | 'move' | 'transform';
    newLocationName: string;
    newLocationDescription: string;
  };
  cinematicMoment: {
    enabled: boolean;
    prompt: string;
  };
}

export interface BlueprintFragment {
    fromBlueprint: string;
    understandingDelta: number;
    progressDelta: number;
    complexityDelta: number;
}

export interface InteractResponse {
  type: 'interaction';
  characterReply: string;
  storyEvent: string;
  emotionDeltas: EmotionDeltas;
  updatedEmotionState: EmotionState;
  moodLabel: string;
  expressionKey: string;
  worldUpdate: WorldUpdate;
  blueprintFragment: BlueprintFragment;
  updatedBlueprintState: BlueprintState;
  ambientSound: AmbientSound;
  ambientAnimation: AmbientAnimation;
}

export interface WorldContext {
  worldName: string;
  worldDescription: string;
  currentLocationName: string;
  currentLocationDescription: string;
}

export interface HistoryItem {
  role: 'user' | 'character' | 'event' | 'world';
  text: string;
}

export type MessageTarget = 'character' | 'world' | 'both';

export type GameState = 'init' | 'loading' | 'interact' | 'error' | 'demo' | 'success';

export type DemoStatus = 'guide' | 'story' | 'ended';

export type SoundEffect = 'init' | 'character_reply' | 'story_event' | 'world_clue' | 'cinematic_moment' | 'send_message';