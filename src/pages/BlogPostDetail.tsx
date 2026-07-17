import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { blogPosts } from '../data/blogs';
import type { BlogPost } from '../data/blogs';
import { ArrowLeft, Calendar, Clock, Share2, Check, User, ChevronRight } from 'lucide-react';

export const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Find post
  const post = blogPosts.find(p => p.slug === slug);

  // Redirect to blog home if not found
  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
  }, [post, navigate]);

  if (!post) return null;

  // Find other posts for recommendations
  const recommendedPosts = blogPosts
    .filter(p => p.slug !== post.slug)
    .slice(0, 2);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-bg min-h-screen text-white flex flex-col overflow-x-hidden">
      <Navigation />

      {/* Structured Schema for Google (JSON-LD Article) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Birvana",
            "logo": {
              "@type": "ImageObject",
              "url": "https://birvana.indevs.in/assets/birvana-mark.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://birvana.indevs.in/blog/${post.slug}`
          }
        })}
      </script>

      {/* Hero Header */}
      <header className="relative pt-36 pb-16 px-6 md:px-8 border-b border-brand-borderSubtle overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[850px] mx-auto relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-brand-textMuted text-xs font-mono mb-8">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link to="/blog" className="hover:text-brand-primary transition-colors">Blog</Link>
            <ChevronRight size={10} />
            <span className="text-brand-textSecondary truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
          </nav>

          {/* Category & Stats */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-primary font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
              {post.category}
            </span>
            <span className="text-white/10 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-brand-textMuted text-xs font-mono">
              <Calendar size={12} />
              <span>{post.date}</span>
            </div>
            <span className="text-white/10 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-brand-textMuted text-xs font-mono">
              <Clock size={12} />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-sans font-black text-3xl md:text-5xl text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <User size={18} />
              </div>
              <div>
                <div className="font-sans text-sm font-semibold text-white">{post.author}</div>
                <div className="font-mono text-[10px] text-brand-textMuted">Contributor</div>
              </div>
            </div>

            {/* Share link button */}
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 font-sans font-semibold text-xs text-brand-textSecondary hover:text-white bg-[#0f0f0f] border border-white/5 hover:border-brand-primary/30 px-4 py-2.5 rounded-full transition-all duration-300 active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-brand-primary animate-pulse" />
                  <span className="text-brand-primary">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Article</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-[850px] mx-auto w-full px-6 md:px-8 py-12 flex-1">
        
        {/* Back Link */}
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs text-brand-textMuted hover:text-brand-primary transition-colors duration-300 mb-10"
        >
          <ArrowLeft size={12} />
          <span>Back to Articles</span>
        </Link>

        {/* Dynamic HTML Content Render */}
        <article 
          className="blog-content-body font-sans text-brand-textSecondary text-base md:text-lg leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Article tags */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-brand-textMuted flex items-center gap-1.5 mr-2">
            <span className="text-brand-primary">#</span> Tags:
          </span>
          {post.tags.map(tag => (
            <span 
              key={tag} 
              className="font-mono text-xs bg-[#0f0f0f] border border-white/5 text-brand-textSecondary px-3 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Recommended Reads */}
        <div className="mt-20 pt-12 border-t border-white/5">
          <h3 className="font-sans font-black text-xl text-white mb-8 tracking-tight">
            Recommended Reading
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedPosts.map(recPost => (
              <Link 
                key={recPost.slug}
                to={`/blog/${recPost.slug}`}
                className="group block bg-[#090909] border border-white/5 hover:border-brand-primary/10 rounded-2xl p-6 transition-all duration-300 h-full flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] text-brand-primary uppercase tracking-wider mb-3 block">
                    {recPost.category}
                  </span>
                  <h4 className="font-sans font-bold text-base text-white group-hover:text-brand-primary transition-colors duration-300 line-clamp-2 leading-snug">
                    {recPost.title}
                  </h4>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-mono text-brand-textMuted">
                  <span>{recPost.date}</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300 text-brand-primary font-bold">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* Styled scoping for blog HTML tags */}
      <style>{`
        .blog-content-body h2 {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 1.5rem;
          color: #ffffff;
          margin-top: 2.25rem;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        @media (min-width: 768px) {
          .blog-content-body h2 {
            font-size: 1.75rem;
          }
        }
        .blog-content-body h3 {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          color: #ffffff;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }
        .blog-content-body p {
          margin-bottom: 1.25rem;
          font-size: 0.975rem;
          line-height: 1.75;
          color: #aaaaaa;
        }
        @media (min-width: 768px) {
          .blog-content-body p {
            font-size: 1.0625rem;
          }
        }
        .blog-content-body strong {
          color: #ffffff;
          font-weight: 600;
        }
        .blog-content-body em {
          color: #1DB954;
          font-style: normal;
        }
        .blog-content-body ul {
          list-style-type: square;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #aaaaaa;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .blog-content-body ul {
            font-size: 1rem;
          }
        }
        .blog-content-body ul li {
          margin-bottom: 0.5rem;
        }
        .blog-content-body ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #aaaaaa;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .blog-content-body ol {
            font-size: 1rem;
          }
        }
        .blog-content-body ol li {
          margin-bottom: 0.5rem;
        }
        .blog-content-body pre {
          background-color: #030303;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .blog-content-body code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          color: #1DB954;
          background-color: #030303;
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
        }
        .blog-content-body pre code {
          color: #e5c07b;
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.825rem;
          line-height: 1.5;
        }
        /* Custom callout block styled like a premium box */
        .blog-content-body .blog-cta-box {
          background-color: #090909;
          border: 1px solid rgba(29, 185, 84, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin: 2.5rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .blog-content-body .blog-cta-box::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #1DB954;
        }
        .blog-content-body .blog-cta-box h3 {
          font-size: 1.35rem;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        .blog-content-body .blog-cta-box p {
          font-size: 0.9rem;
          color: #aaaaaa;
          margin-bottom: 1.5rem;
          max-w-md;
          margin-left: auto;
          margin-right: auto;
        }
        .blog-content-body .blog-cta-button {
          display: inline-block;
          background-color: #1DB954;
          color: #000000;
          font-weight: 800;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1rem 2rem;
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(29, 185, 84, 0.25);
          transition: all 0.3s ease;
        }
        .blog-content-body .blog-cta-button:hover {
          background-color: #30e36b;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(29, 185, 84, 0.4);
        }
      `}</style>

      <Footer />
    </div>
  );
};
