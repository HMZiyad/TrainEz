
import React, { useMemo } from 'react';
import { TrainingSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  sessions: TrainingSession[];
}

const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    const scores = sessions.filter(s => !!s.evaluation).map(s => s.evaluation!.overallScore);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Group by category for average breakdown
    const categories = ['politeness', 'clarity', 'speed', 'empathy', 'problemSolving'];
    const breakdown = categories.map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      score: Math.round(sessions.reduce((acc, s) => acc + (s.evaluation?.[cat as keyof typeof s.evaluation] as number || 0), 0) / sessions.length)
    }));

    // History data
    const history = sessions.slice(-7).map((s, i) => ({
      day: `Session ${i + 1}`,
      score: s.evaluation?.overallScore || 0
    }));

    return { avg, breakdown, history, total: sessions.length };
  }, [sessions]);

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <div className="text-slate-300 mb-4 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Data Yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">Complete a training session to see your performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Training Modules Completed</p>
          <p className="text-4xl font-black text-indigo-600 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Average Performance Score</p>
          <p className="text-4xl font-black text-indigo-600 mt-1">{stats.avg}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Skill Level</p>
          <p className="text-4xl font-black text-indigo-600 mt-1">
            {stats.avg > 90 ? 'Expert' : stats.avg > 75 ? 'Professional' : 'Training'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Competency Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.breakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Sessions</h3>
          <span className="text-xs text-indigo-600 font-bold uppercase cursor-pointer hover:underline">View All</span>
        </div>
        <div className="divide-y divide-slate-100">
          {sessions.slice().reverse().map(session => (
            <div key={session.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-semibold text-slate-800">Session #{session.id.slice(0, 5)}</p>
                <p className="text-xs text-slate-400">{new Date(session.timestamp).toLocaleDateString()} • {session.transcript.length} turns</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{session.evaluation?.overallScore}%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Score</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
