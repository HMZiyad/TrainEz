
import React, { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { getGeminiClient, decodeBase64, encodeUint8Array, decodeAudioBuffer } from '../geminiService';
import { Scenario, Language } from '../types';
import { SYSTEM_PROMPT_TEMPLATE } from '../constants';

interface VoiceModeProps {
  scenario: Scenario;
  language: Language;
  onTranscriptUpdate: (msg: { sender: 'user' | 'ai'; text: string }) => void;
}

const VoiceMode: React.FC<VoiceModeProps> = ({ scenario, language, onTranscriptUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Store current transcript chunks to build the full sentences
  const currentInRef = useRef("");
  const currentOutRef = useRef("");

  const startSession = async () => {
    try {
      const ai = getGeminiClient();
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeUint8Array(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Playback
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioBuffer(decodeBase64(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
                currentInRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
                currentOutRef.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
                if (currentInRef.current) {
                    onTranscriptUpdate({ sender: 'user', text: currentInRef.current });
                    currentInRef.current = "";
                }
                if (currentOutRef.current) {
                    onTranscriptUpdate({ sender: 'ai', text: currentOutRef.current });
                    currentOutRef.current = "";
                }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setError("Connection error. Please try again.");
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_PROMPT_TEMPLATE(scenario, language),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Could not access microphone.");
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    setIsActive(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-4 bg-indigo-50 rounded-xl animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            Start Talking
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex gap-1 items-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 bg-indigo-600 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <button 
              onClick={stopSession}
              className="bg-white border border-rose-200 text-rose-600 px-6 py-3 rounded-full font-bold hover:bg-rose-50 transition-all"
            >
              Stop Listening
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-rose-500 text-xs mt-3">{error}</p>}
      <p className="text-slate-500 text-xs mt-3 uppercase tracking-widest font-bold">
        {isActive ? "Listening and Speaking..." : "Voice mode disabled"}
      </p>
    </div>
  );
};

export default VoiceMode;
