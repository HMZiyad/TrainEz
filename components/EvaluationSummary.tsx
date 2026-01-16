
import React from 'react';
import { EvaluationResult, Scenario } from '../types';

interface EvaluationSummaryProps {
  evaluation: EvaluationResult;
  scenario: Scenario;
  onReset: () => void;
}

const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({ evaluation, scenario, onReset }) => {
  const categories = [
    { label: 'Politeness', value: evaluation.politeness, color: 'bg-orange-500' },
    { label: 'Clarity', value: evaluation.clarity, color: 'bg-amber-500' },
    { label: 'Speed', value: evaluation.speed, color: 'bg-amber-500' },
    { label: 'Empathy', value: evaluation.empathy, color: 'bg-rose-500' },
    { label: 'Problem Solving', value: evaluation.problemSolving, color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Training Complete!</h2>
        <p className="text-stone-500">Here's how you performed in: <span className="font-semibold">{scenario.title}</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-10">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-stone-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5V2a1 1 0 112 0v5a1 1 0 01-1 1h-6z" clipRule="evenodd" />
              <path d="M3 18a1 1 0 01-1-1V4a1 1 0 112 0v5h4V4a1 1 0 112 0v5h4V4a1 1 0 112 0v13a1 1 0 01-1 1H3z" />
            </svg>
            Score Breakdown
          </h3>
          {categories.map((cat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-stone-600">{cat.label}</span>
                <span className="text-stone-900">{cat.value}%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${cat.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.68a1 1 0 10-1.404-1.424l-.707.707a1 1 0 101.414 1.414l.707-.707zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zM12.93 14.33a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM6.343 17.657a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM3.343 8.243a1 1 0 101.414 1.414l.707-.707a1 1 0 10-1.414-1.414l-.707.707zM16.657 8.243a1 1 0 10-1.414-1.414l.707.707a1 1 0 101.414 1.414l.707-.707zM14.116 6.68a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707z" />
            </svg>
            AI Feedback
          </h3>
          <p className="text-orange-800 text-sm leading-relaxed whitespace-pre-line">
            {evaluation.feedback}
          </p>
          <div className="mt-6 pt-6 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-orange-900 font-bold">Overall Rating</span>
              <span className="text-3xl font-black text-orange-600">{evaluation.overallScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onReset}
          className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-md transition-all active:scale-95"
        >
          Try Another Scenario
        </button>
      </div>
    </div>
  );
};

export default EvaluationSummary;
