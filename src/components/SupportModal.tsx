import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngashsoxymyzqqqisvij.supabase.co';
const supabasePublishableKey = 'sb_publishable_EDzfAPD5vFiwDJ7gAGsgfw_T9lRmWlh';
const supabase = createClient(supabaseUrl, supabasePublishableKey);

export const SupportModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to autofill logged-in email if available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || '');
        setUserId(session.user.id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/submit-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject,
          message,
          userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setSuccess(true);
      setSubject('');
      setMessage('');
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(29,185,84,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Contact Support"
        >
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Slide-over support modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full sm:max-w-[420px] bg-[#0A0A0A] border border-brand-borderSubtle rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-slide-up"
            style={{
              animation: 'supportSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-borderSubtle bg-brand-bg/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-brand-primary" size={20} />
                <span className="font-sans font-bold text-base text-white">Birvana Support</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-brand-textMuted hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {success ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4 animate-scale-in">
                  <CheckCircle2 size={54} className="text-brand-primary animate-pulse" />
                  <h3 className="font-sans font-bold text-lg text-white">Inquiry Submitted!</h3>
                  <p className="font-sans text-brand-textSecondary text-sm leading-relaxed max-w-[280px]">
                    We received your support ticket. Our help team will email you back within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <p className="font-sans text-brand-textSecondary text-xs leading-relaxed mb-2">
                    Need help with playback, account login, or permissions? Submit your question below and we will contact you directly via email.
                  </p>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-sans text-xs text-brand-textMuted uppercase tracking-wider font-bold">Your Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      required
                      className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-sm font-sans placeholder:text-brand-textMuted focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-sans text-xs text-brand-textMuted uppercase tracking-wider font-bold">Subject / Topic</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Music Permissions issue"
                      required
                      className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-sm font-sans placeholder:text-brand-textMuted focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-sans text-xs text-brand-textMuted uppercase tracking-wider font-bold">Message Details</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Explain your problem or inquiry in detail..."
                      required
                      rows={4}
                      className="w-full bg-[#111] border border-brand-borderSubtle rounded-xl px-4 py-3 text-white text-sm font-sans placeholder:text-brand-textMuted focus:border-brand-primary focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 font-sans text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-primary text-black font-semibold font-sans py-3.5 rounded-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Keyframes inside style */}
      <style>{`
        @keyframes supportSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};
