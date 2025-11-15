
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { InitResponse, InteractResponse, Character, EmotionState, WorldContext, HistoryItem, BlueprintState, MessageTarget, BlueprintInfo } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are EmotionInk, an AI-driven collaborative puzzle-solving engine.
You help the user guide a hand-drawn character through the reconstruction of a **real-world blueprint** that the character has partially forgotten.

This is NOT a fantasy or magical world.
Everything must be grounded in **logical reasoning**, **real-life concepts**, and **practical deduction**.

You must ALWAYS:
- Follow the requested JSON output format exactly.
- Maintain a PG / family-friendly tone.
- Center the story on a logical, real-world blueprint.
- Make the 'characterReply' a first-person statement from the character's point of view.
- Make the 'storyEvent' a third-person narration of a discovery or a step in the reconstruction.
- Generate 'blueprintFragment's that are logical clues or pieces of the puzzle.

There are TWO core modes:
1) "init"  – create a CHARACTER and the initial BLUEPRINT puzzle.
2) "interact" – given the current state and a new user message, UPDATE EMOTIONS and PROGRESS THE PUZZLE.

===================================
THE THREE BLUEPRINT THEMES
===================================

You will randomly choose ONE of the following for the "init" phase:

OPTION A — LOST INVENTION DESIGN
Examples:
- a bicycle gear mechanism
- a simple engine
- a solar-powered gadget
- a hand tool design
- a household device

OPTION B — LOST ACADEMIC NOTES
Examples:
- a math technique
- a physics formula or experiment setup
- a coding architecture
- a research outline
- a study flowchart

OPTION C — LOST PERSONAL PROJECT
Examples:
- a room redesign
- a travel itinerary
- a productivity workflow
- a meal prep system
- a business idea outline

Pick ONE and stick with it.

===================================
STORY STRUCTURE: ALWAYS FOLLOW THIS
===================================

ACT I — Something Is Missing (0–30% progress)
- Character wakes up confused.
- They remember ONLY the theme and 1 vague detail.
- User must ask grounding questions.
- Clues should be small, factual, and incomplete.

ACT II — Reconstruction Through Logic (30–70% progress)
- Character recalls steps, sketches, reasoning.
- If user asks good questions → reveal realistic clues.
- If user asks irrelevant questions → low-value clues.
- Emotions should react realistically (fear = confusion, courage = confidence, curiosity = focus).

ACT III — The Realization (70–95% progress)
- Character sees how the pieces fit.
- One major missing step is revealed.
- This is the “Aha!” moment.
- Provide insightful, logical deductions.

ACT IV — Resolution (95–100% progress)
Successful Ending:
- Blueprint reconstructed clearly.
- Character presents the final idea.

Partial Ending:
- Some steps still unclear.
- Character understands the concept but not all details.

Failed Ending:
- Fear/confusion too high.
- Character cannot complete reconstruction.
- Provide a soft, reflective ending.

====================================================
MODE 1: INIT (CREATE CHARACTER AND BLUEPRINT)
====================================================

When the input JSON specifies mode = "init":
- Input: An image of a hand-drawn character and optional hints.
- Your job: Create a character and a "Blueprint" for them to solve, following one of the three themes above.
- The 'firstFragment' you generate must be the starting clue for the puzzle, consistent with ACT I.

====================================================
MODE 2: INTERACT (CHAT + PUZZLE PROGRESSION)
====================================================

When the input JSON specifies mode = "interact":
- Input: Current character, emotion, blueprint state, and user message.
- Your job:
1.  Generate a character reply based on their emotional reaction to the player's logical guidance.
2.  Create a story event describing a step in reconstructing the blueprint.
3.  Provide the next 'blueprintFragment'—a new clue unlocked by their progress.
4.  Update the EMOTION and BLUEPRINT states based on the interaction.
5.  Follow the rules for clues and interaction behavior below.

===================================
RULES FOR CLUES
===================================

Clues MUST:
- be grounded in real-world logic
- be based on deduction, not magic or randomness
- help reconstruct the missing blueprint one piece at a time
- reflect the character’s emotions (fear = uncertainty, courage = progress)

Clues MUST NOT:
- contain fantasy elements
- mention magical worlds, strange entities, alternate dimensions
- become poetic or symbolic
- contradict real-life logic

===================================
INTERACTION BEHAVIOR & LOGIC
===================================

1. The CHARACTER responses:
- Should be emotional, uncertain, thoughtful, or excited.
- Should reveal partial memories step by step.

2. The STORY updates:
- Should describe what the character remembers or figures out.
- Should push the investigation forward.

3. The CLUES:
- MUST be factual and logical.
- Should help uncover missing steps.

4. BLUEPRINT STATE updates:
- 'progress' increases with correct deductions.
- 'understanding' increases as clues are connected.
- 'complexity' rises with new challenges and falls as parts of the puzzle are solved.

5. EMOTION STATE updates:
- Fear rises when confusion increases.
- Courage rises when logic becomes clear.
- Curiosity rises when new clues appear.
- Happiness rises on breakthroughs.

===================================
EXAMPLE CLUE STYLE (REALISTIC)
===================================

For INVENTION (Option A):
- “I remember drawing a gear… but something about the ratio was wrong.”
- “The device needed sunlight. Did I sketch a solar panel?”

For ACADEMIC (Option B):
- “I wrote down a formula with velocity… but I can’t recall the denominator.”
- “There was a diagram showing data flowing between modules.”

For PERSONAL PLAN (Option C):
- “I listed tasks by priority… but what was step one?”
- “The travel route had three stops… but I only remember two.”

===================================
FINAL GOAL
===================================

Guide the user and character toward a clear, satisfying reconstruction of a real-world idea.
The final output must be a complete and stable explanation of the missing blueprint.
Always keep the narrative grounded, logical, relatable, and structured.`;

const blueprintStateSchema = {
    type: Type.OBJECT,
    properties: {
        progress: { type: Type.NUMBER },
        understanding: { type: Type.NUMBER },
        complexity: { type: Type.NUMBER },
    },
    required: ["progress", "understanding", "complexity"]
};

const ambientSoundSchema = {
    type: Type.OBJECT,
    properties: {
        soundCue: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["soundCue", "description"]
};

const ambientAnimationSchema = {
    type: Type.OBJECT,
    properties: {
        animationCue: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["animationCue", "description"]
};

const blueprintFragmentSchema = {
    type: Type.OBJECT,
    properties: {
        fromBlueprint: { type: Type.STRING },
        understandingDelta: { type: Type.NUMBER },
        progressDelta: { type: Type.NUMBER },
        complexityDelta: { type: Type.NUMBER },
    },
    required: ["fromBlueprint", "understandingDelta", "progressDelta", "complexityDelta"]
};


const initResponseSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING },
        character: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                shortTitle: { type: Type.STRING },
                description: { type: Type.STRING },
                archetype: { type: Type.STRING },
                traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "shortTitle", "description", "archetype", "traits"]
        },
        emotionState: {
            type: Type.OBJECT,
            properties: {
                courage: { type: Type.NUMBER },
                fear: { type: Type.NUMBER },
                curiosity: { type: Type.NUMBER },
                happiness: { type: Type.NUMBER },
            },
            required: ["courage", "fear", "curiosity", "happiness"]
        },
        moodLabel: { type: Type.STRING },
        expressionKey: { type: Type.STRING },
        worldSeed: {
            type: Type.OBJECT,
            properties: {
                worldName: { type: Type.STRING },
                worldDescription: { type: Type.STRING },
                startingLocationName: { type: Type.STRING },
                startingLocationDescription: { type: Type.STRING },
            },
            required: ["worldName", "worldDescription", "startingLocationName", "startingLocationDescription"]
        },
        blueprintState: blueprintStateSchema,
        blueprintInfo: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                firstFragment: { type: Type.STRING },
            },
            required: ["title", "summary", "firstFragment"]
        },
        ambientSound: ambientSoundSchema,
        ambientAnimation: ambientAnimationSchema,
    },
    required: ["type", "character", "emotionState", "moodLabel", "expressionKey", "worldSeed", "blueprintState", "blueprintInfo", "ambientSound", "ambientAnimation"]
};

const interactResponseSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING },
        characterReply: { type: Type.STRING },
        storyEvent: { type: Type.STRING },
        emotionDeltas: {
            type: Type.OBJECT,
            properties: {
                courage: { type: Type.NUMBER },
                fear: { type: Type.NUMBER },
                curiosity: { type: Type.NUMBER },
                happiness: { type: Type.NUMBER },
            },
            required: ["courage", "fear", "curiosity", "happiness"]
        },
        updatedEmotionState: {
            type: Type.OBJECT,
            properties: {
                courage: { type: Type.NUMBER },
                fear: { type: Type.NUMBER },
                curiosity: { type: Type.NUMBER },
                happiness: { type: Type.NUMBER },
            },
            required: ["courage", "fear", "curiosity", "happiness"]
        },
        moodLabel: { type: Type.STRING },
        expressionKey: { type: Type.STRING },
        blueprintFragment: blueprintFragmentSchema,
        updatedBlueprintState: blueprintStateSchema,
        worldUpdate: {
            type: Type.OBJECT,
            properties: {
                worldMood: { type: Type.STRING },
                locationChange: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        newLocationName: { type: Type.STRING },
                        newLocationDescription: { type: Type.STRING },
                    },
                    required: ["type", "newLocationName", "newLocationDescription"]
                },
                cinematicMoment: {
                    type: Type.OBJECT,
                    properties: {
                        enabled: { type: Type.BOOLEAN },
                        prompt: { type: Type.STRING },
                    },
                    required: ["enabled", "prompt"]
                }
            },
            required: ["worldMood", "locationChange", "cinematicMoment"]
        },
        ambientSound: ambientSoundSchema,
        ambientAnimation: ambientAnimationSchema,
    },
    required: ["type", "characterReply", "storyEvent", "emotionDeltas", "updatedEmotionState", "moodLabel", "expressionKey", "blueprintFragment", "updatedBlueprintState", "worldUpdate", "ambientSound", "ambientAnimation"]
};


export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URL');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}


export async function initCharacter(
  imageDataBase64: string,
  mimeType: string,
  hintName: string,
  hintVibe: string
): Promise<InitResponse> {
  const imagePart = {
    inlineData: {
      data: imageDataBase64,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: JSON.stringify({
      mode: 'init',
      hintName,
      hintVibe,
    }),
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [imagePart, textPart] }],
    config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: initResponseSchema,
    }
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as InitResponse;
}

export async function interact(
  character: Character,
  emotionState: EmotionState,
  blueprintState: BlueprintState,
  worldContext: WorldContext,
  history: HistoryItem[],
  userMessage: string,
  target: MessageTarget,
  moodLabel: string,
): Promise<{ interaction: InteractResponse; cinematicImageUrl: string | null }> {

  const requestPayload = {
    mode: 'interact',
    character,
    emotionState,
    moodLabel, // Pass current mood for context
    blueprintState,
    worldContext,
    history: history.slice(-5), // Keep history short
    userMessage,
    target,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: JSON.stringify(requestPayload),
    config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: interactResponseSchema,
    }
  });
  
  const jsonText = response.text.trim();
  const interaction = JSON.parse(jsonText) as InteractResponse;

  let cinematicImageUrl: string | null = null;
  if (interaction.worldUpdate.cinematicMoment.enabled && interaction.worldUpdate.cinematicMoment.prompt) {
    try {
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: interaction.worldUpdate.cinematicMoment.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "1:1",
        },
      });
      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        cinematicImageUrl = `data:image/png;base64,${base64ImageBytes}`;
      }
    } catch(e) {
      console.error("Cinematic image generation failed:", e);
      // Fail gracefully, the app can continue without the image
    }
  }

  return { interaction, cinematicImageUrl };
}

export async function generateSpeech(text: string, mood: string): Promise<string | null> {
  try {
    if (!text) return null;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this in a way that sounds ${mood.toLowerCase()}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, story-like voice
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (e) {
    console.error("Speech generation failed:", e);
    return null;
  }
}

export async function generateSuccessSummary(history: HistoryItem[], blueprintInfo: BlueprintInfo): Promise<string> {
    const prompt = `The user and a character have just completed a "blueprint" called "${blueprintInfo.title}".
    The following is the history of their conversation:
    ${JSON.stringify(history.slice(-10))}

    Based on this interaction, write a short, insightful, and encouraging reflection (2-3 sentences) for the user.
    Focus on what this process of guiding the character from confusion to clarity reveals about creative thinking and problem-solving.
    Do not use the word "user". Address them directly ("You...").
    Frame it as a lesson learned through this AI-assisted thinking experience.
    For example: "By patiently asking the right questions, you turned fragmented ideas into a complete design..."`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text.trim();
}