import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MagneticButton } from './MagneticButton';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always the same nav links regardless of which page we're on
  const navLinks = [
    { name: 'Overview',  href: '/#hero' },
    { name: 'Features',  href: '/#features' },
    { name: 'Gallery',   href: '/#gallery' },
    { name: 'Downloads', href: '/#download' },
  ];

  // On the landing page, hash links scroll smoothly.
  // On the developer page, they navigate to /#hash (full route change).
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLandingPage) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const hash = href.replace('/', '');
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Let the browser navigate to the landing page hash
      setIsMobileMenuOpen(false);
    }
  };

  const linkBaseClass =
    'font-sans font-medium text-sm text-brand-textSecondary hover:text-white transition-colors duration-300 relative py-1 ' +
    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-brand-primary ' +
    'after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent ${
          isScrolled
            ? 'bg-brand-bg/85 backdrop-blur-xl border-brand-borderSubtle py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex items-center justify-between">

          {/* Logo — always links to home */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/birvana-mark.png"
              alt="Birvana Logo"
              className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-[360deg]"
            />
            <span className="font-sans font-bold text-3xl tracking-tight text-white">Birvana</span>
          </Link>

          {/* Desktop nav — identical on every page */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={linkBaseClass}
              >
                {link.name}
              </a>
            ))}

            {/* Developer link — same style as other links, no green */}
            <Link
              to="/developer"
              className={linkBaseClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Developer
            </Link>

            {session?.user?.email?.toLowerCase() === 'birvana.official.in@gmail.com' && (
              <Link
                to="/admin"
                className={linkBaseClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to={session ? "/profile" : "/login"}
              className="text-brand-textSecondary hover:text-white transition-colors duration-300 font-sans text-sm font-semibold flex items-center gap-2"
            >
              <User size={16} />
              {session ? 'Profile' : 'Log In'}
            </Link>

            <MagneticButton
              variant="primary"
              className="!px-6 !h-12 !text-sm !flex !items-center"
              href={isLandingPage ? '#download' : '/#download'}
              onClick={(e: any) => {
                if (isLandingPage) {
                  e.preventDefault();
                  document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Download
            </MagneticButton>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-textSecondary hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — identical on every page */}
      <div
        className={`fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-2xl transition-all duration-500 md:hidden flex flex-col justify-center items-center gap-8 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className="font-sans font-semibold text-2xl text-brand-textSecondary hover:text-brand-primary transition-colors duration-300"
          >
            {link.name}
          </a>
        ))}

        <Link
          to="/developer"
          onClick={() => setIsMobileMenuOpen(false)}
          className="font-sans font-semibold text-2xl text-brand-textSecondary hover:text-brand-primary transition-colors duration-300"
        >
          Developer
        </Link>

        {session?.user?.email?.toLowerCase() === 'birvana.official.in@gmail.com' && (
          <Link
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-sans font-semibold text-2xl text-brand-textSecondary hover:text-brand-primary transition-colors duration-300"
          >
            Admin Panel
          </Link>
        )}

        <Link
          to={session ? "/profile" : "/login"}
          onClick={() => setIsMobileMenuOpen(false)}
          className="font-sans font-semibold text-2xl text-brand-textSecondary hover:text-brand-primary transition-colors duration-300 flex items-center gap-2"
        >
          <User size={24} />
          {session ? 'Profile' : 'Log In'}
        </Link>

        <div className="mt-4">
          <MagneticButton
            variant="primary"
            className="!px-8 !py-4 !text-sm"
            href={isLandingPage ? '#download' : '/#download'}
            onClick={(e: any) => {
              if (isLandingPage) {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' });
              }
              setIsMobileMenuOpen(false);
            }}
          >
            Download APK
          </MagneticButton>
        </div>
      </div>
    </>
  );
};
