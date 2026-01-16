
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { EvaluationResult, Scenario } from "./types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export async function evaluateSession(
  scenario: Scenario,
  transcript: { sender: 'user' | 'ai'; text: string }[]
): Promise<EvaluationResult> {
  const ai = getGeminiClient();
  const transcriptText = transcript.map(t => `${t.sender}: ${t.text}`).join('\n');

  const prompt = `
    Evaluate the following restaurant staff training session. 
    Scenario: ${scenario.title} - ${scenario.description}
    Transcript:
    ${transcriptText}

    Rate the staff member (user) on a scale of 0-100 for each category.
    Provide constructive feedback.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          politeness: { type: Type.NUMBER },
          clarity: { type: Type.NUMBER },
          speed: { type: Type.NUMBER },
          empathy: { type: Type.NUMBER },
          problemSolving: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
        },
        required: ["politeness", "clarity", "speed", "empathy", "problemSolving", "feedback", "overallScore"],
      }
    }
  });

  console.log("Full Gemini Response:", JSON.stringify(response, null, 2));

  // Robustly extract text
  let text: string | undefined | null;
  // @ts-ignore - Handle potential function vs property differences across SDK versions
  if (typeof response.text === 'function') {
    // @ts-ignore
    text = response.text();
  } else {
    text = response.text;
  }

  console.log("Response text:", text);

  if (!text || text === "undefined") {
    console.error("Gemini returned no text. This might be due to safety filters or an empty response.");
    return {
      politeness: 0,
      clarity: 0,
      speed: 0,
      empathy: 0,
      problemSolving: 0,
      feedback: "Error: No response text received from AI. Please try again.",
      overallScore: 0
    };
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error("Failed to parse JSON:", parseError);
    return {
      politeness: 0,
      clarity: 0,
      speed: 0,
      empathy: 0,
      problemSolving: 0,
      feedback: "Error: Invalid JSON response from AI.",
      overallScore: 0
    };
  }
}

// Audio Utilities for Live API
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeUint8Array(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioBuffer(
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
