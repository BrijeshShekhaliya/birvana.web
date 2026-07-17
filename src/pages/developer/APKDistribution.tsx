import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './components/GlassPanel';

const buildSteps = [
  { id: 'source', label: 'Source Code', icon: '📝', desc: 'Kotlin + Compose', color: '#61afef' },
  { id: 'compile', label: 'Compile', icon: '⚙️', desc: 'Gradle + R8', color: '#e5c07b' },
  { id: 'test', label: 'Test', icon: '✅', desc: 'JUnit + Espresso', color: '#1DB954' },
  { id: 'sign', label: 'Sign', icon: '🔏', desc: 'Keystore SHA-256', color: '#c678dd' },
  { id: 'package', label: 'Package', icon: '📦', desc: 'APK / AAB', color: '#e06c75' },
  { id: 'release', label: 'Release', icon: '🚀', desc: 'GitHub Releases', color: '#1DB954' },
];

const ciSteps = [
  { name: 'Checkout', status: 'pass', time: '2s' },
  { name: 'Setup JDK 17', status: 'pass', time: '8s' },
  { name: 'Cache Gradle', status: 'pass', time: '1s' },
  { name: 'Run Unit Tests', status: 'pass', time: '45s' },
  { name: 'Assemble Release', status: 'pass', time: '3m 12s' },
  { name: 'Sign APK', status: 'pass', time: '4s' },
  { name: 'Upload Artifact', status: 'pass', time: '12s' },
  { name: 'Create Release', status: 'run', time: '...' },
];

export const APKDistribution: React.FC = () => {
  const [activePipeline, setActivePipeline] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const runPipeline = () => {
    setActivePipeline(true);
    setActiveStep(0);
    buildSteps.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * 600);
    });
    setTimeout(() => {
      setActiveStep(buildSteps.length);
    }, buildSteps.length * 600 + 300);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="scene-badge mb-4 block">Scene 15</span>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white mb-3">
            APK <span className="text-white">Distribution</span>
          </h2>
          <p className="font-mono text-brand-textMuted text-sm">Gradle · GitHub Actions CI/CD · Signed Release · Direct APK</p>
        </div>

        {/* Build pipeline */}
        <GlassPanel className="p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-brand-textMuted uppercase tracking-widest">Build Pipeline</span>
            <button
              onClick={runPipeline}
              className="font-mono text-xs text-white border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
            >
              ▶ Run Build
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {buildSteps.map((step, i) => (
              <React.Fragment key={step.id}>
                <motion.div
                  animate={{
                    borderColor: i <= activeStep ? `${step.color}80` : 'rgba(255,255,255,0.08)',
                    backgroundColor: i <= activeStep ? `${step.color}10` : 'rgba(255,255,255,0.02)',
                    scale: i === activeStep ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className="border rounded-xl px-5 py-4 text-center min-w-[90px]"
                >
                  <div className="text-xl mb-2">{step.icon}</div>
                  <div className="font-mono text-xs text-white">{step.label}</div>
                  <div className="font-mono text-xs text-brand-textMuted mt-1">{step.desc}</div>
                  {i < activeStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2 mx-auto w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center text-black text-[8px] font-bold"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
                {i < buildSteps.length - 1 && (
                  <motion.span
                    animate={{ color: i < activeStep ? '#1DB954' : '#333' }}
                    className="text-lg font-mono"
                  >
                    →
                  </motion.span>
                )}
              </React.Fragment>
            ))}
          </div>
        </GlassPanel>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* CI/CD Steps */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-mono text-xs text-brand-textMuted">github-actions · build.yml</span>
            </div>
            <div className="space-y-2">
              {ciSteps.map((step, i) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                      step.status === 'pass' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                      step.status === 'run' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 animate-pulse' :
                      'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {step.status === 'pass' ? '✓' : step.status === 'run' ? '●' : '✕'}
                  </div>
                  <span className="font-mono text-xs text-white flex-1">{step.name}</span>
                  <span className="font-mono text-xs text-brand-textMuted">{step.time}</span>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          {/* APK info + download */}
          <div className="space-y-4">
            <GlassPanel className="p-6">
              <div className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-4">Release Package</div>
              <div className="space-y-3">
                {[
                  { label: 'APK Size', value: '22.4 MB', icon: '📦' },
                  { label: 'Min SDK', value: 'Android 7 (API 24)', icon: '📱' },
                  { label: 'Target SDK', value: 'Android 15 (API 35)', icon: '🎯' },
                  { label: 'Architecture', value: 'arm64-v8a, x86_64', icon: '⚙️' },
                  { label: 'Signature', value: 'V1 + V2 + V3 schemes', icon: '🔏' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-mono text-xs text-brand-textMuted flex-1">{item.label}</span>
                    <span className="font-mono text-xs text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <motion.a
              href="https://play.google.com/store/apps/details?id=com.birvana.mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="block dev-glass rounded-2xl p-6 text-center border border-white/10 hover:border-white/30 transition-all group cursor-pointer neon-border"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">🛍️</div>
              <div className="font-mono font-bold text-sm text-white group-hover:text-white transition-colors">Get App on Play Store</div>
              <div className="font-mono text-xs text-brand-textMuted mt-1">Official verified store release</div>
            </motion.a>

            <motion.a
              href="https://share.google/TaEYXWGNY0E8ojLbO"
              target="_blank"
              rel="noopener noreferrer"
              className="block dev-glass rounded-2xl p-6 text-center border border-brand-primary/20 hover:border-brand-primary/45 transition-all group cursor-pointer neon-border bg-brand-accentDim/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">🔗</div>
              <div className="font-mono font-bold text-sm text-white group-hover:text-brand-primary transition-colors">Get via Google Share Link</div>
              <div className="font-mono text-xs text-brand-textMuted mt-1">Official shared application index</div>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};
