import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const authSteps = [
  { id: 'request', label: 'Client Request', desc: 'App sends credentials', icon: '📱', side: 'left' },
  { id: 'validate', label: 'Server Validates', desc: 'bcrypt hash comparison', icon: '🔒', side: 'right' },
  { id: 'sign', label: 'JWT Signed', desc: 'HS256 with secret key', icon: '✍️', side: 'right' },
  { id: 'token', label: 'Token Returned', desc: 'Access + Refresh tokens', icon: '🎫', side: 'left' },
  { id: 'refresh', label: 'Auto-Refresh', desc: 'Interceptor renews silently', icon: '♻️', side: 'left' },
];

const jwtParts = [
  { label: 'Header', value: 'eyJhbGciOiJIUzI1NiJ9', color: '#e06c75', desc: 'Algorithm: HS256, Type: JWT' },
  { label: 'Payload', value: 'eyJ1c2VySWQiOiI0MiIsInNjb3BlcyI6WyJtdXNpYyIsInBsYXlsaXN0Il19', color: '#e5c07b', desc: 'userId, scopes, iat, exp' },
  { label: 'Signature', value: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', color: '#61afef', desc: 'HMAC-SHA256 verified' },
];

export const AuthScene: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= authSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePlay = () => {
    setActiveStep(0);
    setIsPlaying(true);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 02</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Auth <span className="text-white">Flow</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">JWT + OAuth2 · Token lifecycle · Auto-refresh interceptor</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Flow diagram */}
          <div className="space-y-1">
            <div className="text-center mb-6">
              <button
                onClick={handlePlay}
                className="font-mono text-xs text-white border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                ▶ Simulate Auth Flow
              </button>
            </div>

            {/* Client / Server labels */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center font-mono text-xs text-brand-textMuted uppercase tracking-widest border-b border-dashed border-white/10 pb-2">📱 Client</div>
              <div className="text-center font-mono text-xs text-brand-textMuted uppercase tracking-widest border-b border-dashed border-white/10 pb-2">⚙️ Server</div>
            </div>

            {authSteps.map((step, i) => (
              <div key={step.id} className="relative">
                <motion.div
                  animate={{
                    opacity: i <= activeStep ? 1 : 0.25,
                    scale: i === activeStep ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`grid grid-cols-2 gap-4 py-3 ${i === activeStep ? 'neon-border rounded-xl px-3' : ''}`}
                >
                  {/* Left cell */}
                  <div className={`${step.side === 'left' ? 'opacity-100' : 'opacity-0'} dev-glass rounded-xl p-3 text-center`}>
                    {step.side === 'left' && (
                      <>
                        <div className="text-lg mb-1">{step.icon}</div>
                        <div className="font-mono text-xs text-white">{step.label}</div>
                        <div className="font-mono text-xs text-brand-textMuted mt-1">{step.desc}</div>
                      </>
                    )}
                  </div>
                  {/* Right cell */}
                  <div className={`${step.side === 'right' ? 'opacity-100' : 'opacity-0'} dev-glass rounded-xl p-3 text-center`}>
                    {step.side === 'right' && (
                      <>
                        <div className="text-lg mb-1">{step.icon}</div>
                        <div className="font-mono text-xs text-white">{step.label}</div>
                        <div className="font-mono text-xs text-brand-textMuted mt-1">{step.desc}</div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Arrow connector */}
                {i < authSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <motion.div
                      animate={{ opacity: i < activeStep ? 0.7 : 0.15 }}
                      className="font-mono text-white text-xs"
                    >
                      ↓
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: JWT token anatomy */}
          <div className="space-y-4">
            <div className="dev-terminal rounded-xl overflow-hidden">
              <div className="dev-terminal-header">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs font-mono text-brand-textMuted">JWT Token Anatomy</span>
              </div>
              <div className="p-5 space-y-4">
                {jwtParts.map((part, i) => (
                  <motion.div
                    key={part.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs" style={{ color: part.color }}>{part.label}</span>
                      <span className="font-mono text-xs text-brand-textMuted">{part.desc}</span>
                    </div>
                    <div
                      className="font-mono text-xs rounded px-3 py-2 break-all"
                      style={{ background: `${part.color}12`, borderLeft: `2px solid ${part.color}` }}
                    >
                      {part.value}
                    </div>
                  </motion.div>
                ))}

                <div className="border-t border-white/5 pt-4 mt-2">
                  <div className="font-mono text-xs text-brand-textMuted mb-2">Retrofit Interceptor</div>
                  <div className="font-mono text-xs leading-relaxed">
                    <span className="token-keyword">class </span>
                    <span className="token-function">AuthInterceptor</span>
                    <span> : Interceptor {'{'}</span>
                    <br />
                    <span className="ml-4 token-keyword">override fun </span>
                    <span className="token-function">intercept</span>
                    <span>(chain: Chain) = chain</span>
                    <br />
                    <span className="ml-6">.request().newBuilder()</span>
                    <br />
                    <span className="ml-6 token-string">.addHeader(</span>
                    <span className="token-string">"Authorization", "Bearer $token")</span>
                    <br />
                    <span className="ml-4 token-green">.build().let(chain::proceed)</span>
                    <br />
                    <span>{'}'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token refresh cycle */}
            <GlassPanel className="p-5">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-3">Token Refresh Cycle</div>
              <div className="flex items-center justify-between gap-2">
                {['Access Token', '15 min', '→', 'Refresh Token', '30 days'].map((item, i) => (
                  <span
                    key={i}
                    className={`font-mono text-xs ${item === '→' ? 'text-white' : item.includes('min') || item.includes('days') ? 'text-yellow-400' : 'text-white'}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-xs font-mono text-brand-textMuted">
                OkHttp Authenticator auto-renews expired tokens transparently
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};
