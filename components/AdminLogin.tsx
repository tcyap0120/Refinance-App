import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication for demo purposes
    if (password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid access key. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-theme-wave">
      
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full fade-in border border-white/50 relative z-10">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 mb-6 flex items-center text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Access</h2>
          <p className="text-slate-500 mt-2">
            Secure gateway for ApexRefi consultants.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Enter admin key"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <Button variant="primary" fullWidth type="submit" className="shadow-lg shadow-indigo-500/20">
            Login to Dashboard
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Hint: Use <span className="font-mono bg-slate-100 px-1 rounded">admin123</span> for this demo.
          </p>
        </div>
      </div>
    </div>
  );
};