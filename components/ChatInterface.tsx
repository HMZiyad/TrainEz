
import React, { useState, useEffect, useRef } from 'react';
import { Scenario, Language } from '../types';
import { getGeminiClient } from '../geminiService';
import { SYSTEM_PROMPT_TEMPLATE } from '../constants';
import VoiceMode from './VoiceMode';

interface ChatInterfaceProps {
  scenario: Scenario;
  language: Language;
  onFinish: (transcript: { sender: 'user' | 'ai'; text: string }[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ scenario, language, onFinish }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const initChat = async () => {
      const ai = getGeminiClient();
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_PROMPT_TEMPLATE(scenario, language),
        }
      });

      // Start with the scenario's initial prompt
      setMessages([{ sender: 'ai', text: scenario.initialPrompt }]);
    };
    initChat();
  }, [scenario, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { sender: 'ai', text: result.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I'm having trouble responding. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-stone-800">{scenario.title}</h2>
          <p className="text-xs text-stone-500">Live Simulation: {scenario.role}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`p-2 rounded-lg transition-colors ${isVoiceMode ? 'bg-orange-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
            title="Toggle Voice Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          <button
            onClick={() => onFinish(messages)}
            className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors"
          >
            Finish & Evaluate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user'
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-tr-none'
                : 'bg-white text-stone-800 rounded-tl-none border border-stone-100'
              }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-stone-100 animate-pulse">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-stone-400 rounded-full"></div>
                <div className="h-2 w-2 bg-stone-400 rounded-full"></div>
                <div className="h-2 w-2 bg-stone-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        {isVoiceMode ? (
          <VoiceMode scenario={scenario} language={language} onTranscriptUpdate={(msg) => setMessages(prev => [...prev, msg])} />
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
