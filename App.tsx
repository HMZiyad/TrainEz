
import React, { useState, useEffect } from 'react';
import { SCENARIOS } from './constants';
import { Scenario, Language, TrainingSession, EvaluationResult } from './types';
import ScenarioCard from './components/ScenarioCard';
import ChatInterface from './components/ChatInterface';
import EvaluationSummary from './components/EvaluationSummary';
import Dashboard from './components/Dashboard';
import { evaluateSession } from './geminiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'training' | 'evaluation' | 'dashboard'>('home');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trainez_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setActiveView('training');
  };

  const handleFinishTraining = async (transcript: { sender: 'user' | 'ai'; text: string }[]) => {
    if (!selectedScenario) return;
    setIsEvaluating(true);
    
    try {
      const evaluation = await evaluateSession(selectedScenario, transcript);
      
      const newSession: TrainingSession = {
        id: Math.random().toString(36).substring(7),
        scenarioId: selectedScenario.id,
        timestamp: Date.now(),
        transcript,
        evaluation
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      localStorage.setItem('trainez_sessions', JSON.stringify(updatedSessions));
      
      setCurrentEvaluation(evaluation);
      setActiveView('evaluation');
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("Something went wrong during evaluation. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const reset = () => {
    setSelectedScenario(null);
    setCurrentEvaluation(null);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={reset}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">TrainEZ</h1>
          </div>

          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setActiveView('home')}
              className={`text-sm font-semibold transition-colors ${activeView === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Training Scenarios
            </button>
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`text-sm font-semibold transition-colors ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              My Dashboard
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setLanguage(Language.ENGLISH)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === Language.ENGLISH ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage(Language.SPANISH)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === Language.SPANISH ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                ES
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {activeView === 'home' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-800 mb-4">Master Every Shift.</h2>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                Choose a scenario below to start your AI-powered training session. Learn how to handle difficult customers, upsell items, and manage team dynamics.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCENARIOS.map(s => (
                <ScenarioCard 
                  key={s.id} 
                  scenario={s} 
                  onSelect={handleSelectScenario} 
                />
              ))}
            </div>
          </div>
        )}

        {activeView === 'training' && selectedScenario && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="mb-6 flex items-center gap-4">
              <button 
                onClick={reset}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-slate-800">Training Session</h2>
            </div>
            <ChatInterface 
              scenario={selectedScenario} 
              language={language}
              onFinish={handleFinishTraining}
            />
          </div>
        )}

        {activeView === 'evaluation' && currentEvaluation && selectedScenario && (
          <div className="max-w-4xl mx-auto">
            <EvaluationSummary 
              evaluation={currentEvaluation} 
              scenario={selectedScenario}
              onReset={reset}
            />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-800">Your Progress</h2>
              <p className="text-slate-500">Analytics and history from your recent training modules.</p>
            </div>
            <Dashboard sessions={sessions} />
          </div>
        )}

        {isEvaluating && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-black">AI</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Evaluating Performance</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Gemini is analyzing your conversation for politeness, empathy, and clarity...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistence Notification (Footer Tip) */}
      {activeView === 'home' && (
        <footer className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
            <div className="bg-amber-400 text-slate-900 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-tight">Try the "Angry Diner" scenario for Host training!</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
