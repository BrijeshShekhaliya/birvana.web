import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const securityLayers = [
  { label: 'TLS 1.3', desc: 'All network traffic encrypted in transit', icon: '🔐', color: '#1DB954' },
  { label: 'Certificate Pinning', desc: 'Prevent MITM via pinned SHA-256 fingerprints', icon: '📌', color: '#61afef' },
  { label: 'Encrypted Storage', desc: 'Room DB + DataStore encrypted with AES-256', icon: '🗄️', color: '#c678dd' },
  { label: 'Obfuscated APK', desc: 'R8 full-mode + ProGuard obfuscation', icon: '🧩', color: '#e5c07b' },
  { label: 'Root Detection', desc: 'SafetyNet + runtime integrity checks', icon: '🛡️', color: '#e06c75' },
  { label: 'No API Keys in APK', desc: 'Keys resolved server-side via secure proxy', icon: '🔑', color: '#98c379' },
];

const ScrambleText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

  useEffect(() => {
    let iteration = 0;
    const maxIter = text.length * 3;
    const interval = setInterval(() => {
      setDisplayed(
        text.split('').map((ch, i) => {
          if (i < Math.floor(iteration / 3)) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      iteration++;
      if (iteration > maxIter) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="font-mono text-xs text-white">{displayed}</span>;
};

const TLSHandshake: React.FC<{ running: boolean }> = ({ running }) => {
  const steps = [
    { from: 'Client', to: 'Server', msg: 'ClientHello (TLS 1.3)' },
    { from: 'Server', to: 'Client', msg: 'ServerHello + Certificate' },
    { from: 'Client', to: 'Server', msg: 'Certificate Verify' },
    { from: 'Server', to: 'Client', msg: 'Finished (Encrypted)' },
    { from: 'Client', to: 'Server', msg: 'Application Data ✓' },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          className={`flex items-center gap-3 text-xs font-mono ${step.from === 'Client' ? 'flex-row' : 'flex-row-reverse'}`}
          initial={{ opacity: 0, x: step.from === 'Client' ? -20 : 20 }}
          animate={running ? { opacity: 1, x: 0 } : { opacity: 0.2, x: step.from === 'Client' ? -20 : 20 }}
          transition={{ delay: i * 0.4, duration: 0.4 }}
        >
          <span className="text-brand-textMuted w-10 text-center shrink-0">{step.from}</span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-px bg-brand-primary/40 relative">
              {running && (
                <motion.div
                  className="absolute top-0 bottom-0 w-2 h-2 bg-brand-primary rounded-full -mt-0.5"
                  initial={{ left: step.from === 'Client' ? '0%' : '100%' }}
                  animate={{ left: step.from === 'Client' ? '100%' : '0%' }}
                  transition={{ delay: i * 0.4, duration: 0.35 }}
                />
              )}
            </div>
            <span className="text-brand-textMuted text-xs shrink-0">{step.msg}</span>
            <div className="flex-1 h-px bg-brand-primary/40" />
          </div>
          <span className="text-brand-textMuted w-10 text-center shrink-0">{step.to}</span>
        </motion.div>
      ))}
    </div>
  );
};

export const SecurityScene: React.FC = () => {
  const [handshakeRunning, setHandshakeRunning] = useState(false);

  const runHandshake = () => {
    setHandshakeRunning(false);
    setTimeout(() => setHandshakeRunning(true), 50);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 13</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            Security <span className="text-white">Layers</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Defence-in-depth · TLS 1.3 · AES-256 · Zero API keys in APK</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Security layers */}
          <div className="space-y-3">
            {securityLayers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassPanel className="p-4 flex items-center gap-4" glowColor={`${layer.color}15`}>
                  <div className="text-2xl">{layer.icon}</div>
                  <div className="flex-1">
                    <div className="font-mono font-bold text-sm" style={{ color: layer.color }}>{layer.label}</div>
                    <div className="font-mono text-xs text-brand-textMuted mt-0.5">{layer.desc}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          {/* Right: TLS handshake + Token scramble */}
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-brand-textMuted uppercase tracking-widest">TLS 1.3 Handshake</span>
                <button
                  onClick={runHandshake}
                  className="font-mono text-xs text-white border border-white/10 px-3 py-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  ▶ Simulate
                </button>
              </div>
              <TLSHandshake running={handshakeRunning} />
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Token Obfuscation</div>
              <div className="space-y-3">
                {[
                  'eyJhbGciOiJIUzI1NiJ9',
                  'eyJ1c2VySWQiOiI0MiJ9',
                  'SflKxwRJSMeKKF2QT4fw',
                ].map((token, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-brand-textMuted w-8">P{i + 1}</span>
                    <div
                      className="flex-1 rounded px-3 py-2"
                      style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.15)' }}
                    >
                      <ScrambleText text={token} />
                    </div>
                  </div>
                ))}
                <p className="font-mono text-xs text-brand-textMuted mt-2">
                  JWT parts are scrambled in logs; only verified signatures are trusted
                </p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};
