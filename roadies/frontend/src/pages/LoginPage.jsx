import React from 'react';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLogin }) {
  return (
    <div className="flex h-screen bg-white">
      {/* Hero Section */}
      <div className="hidden md:flex flex-1 bg-ink relative overflow-hidden flex-col justify-end p-12">
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent opacity-90"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Your city,<br />
            one <span className="text-amber-400">tap</span> away.
          </h1>
          <p className="text-lg text-white/50 mb-8 max-w-sm leading-relaxed">
            Predicted fares for Uber, Ola & Rapido — real tariffs, live surge. One screen, best price always.
          </p>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-white"></span>Uber
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>Ola
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>Rapido
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <LoginForm onLogin={onLogin} />
    </div>
  );
}

export default LoginPage;