import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { blogPosts } from '../data/blogs';
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';

export const BlogList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive categories
  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-brand-bg min-h-screen text-white flex flex-col overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 md:px-8 border-b border-brand-borderSubtle overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1280px] mx-auto relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block"
          >
            Insights & Guides
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans font-black text-4xl md:text-6xl text-white tracking-tight leading-tight max-w-3xl mx-auto"
          >
            The Birvana <span className="text-stroke-green text-brand-primary">Blog</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-brand-textSecondary text-base md:text-lg max-w-xl mx-auto mt-6 leading-relaxed"
          >
            Stay updated with audiophile tech guides, playback engineering insights, and optimization tips for the ultimate music app.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-8 py-12 flex flex-col gap-10">
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-borderSubtle">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`font-sans text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-brand-primary text-black border-brand-primary shadow-[0_4px_12px_rgba(29,185,84,0.2)]'
                    : 'bg-[#0f0f0f] text-brand-textSecondary border-white/5 hover:border-brand-primary/30 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-md w-full order-1 md:order-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textMuted" />
            <input
              type="text"
              placeholder="Search articles, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-white/5 focus:border-brand-primary/45 rounded-full pl-11 pr-5 py-2.5 text-sm text-white placeholder-brand-textMuted outline-none transition-all"
            />
          </div>

        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-[#090909] border border-white/5 hover:border-brand-primary/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Visual accent line hover glow */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/10 transition-all duration-500" />
                
                <div>
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-brand-primary font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                      {post.category}
                    </span>
                    <span className="text-white/10">•</span>
                    <div className="flex items-center gap-1.5 text-brand-textMuted text-xs font-mono">
                      <Clock size={12} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link to={`/blog/${post.slug}`} className="block group/title">
                    <h2 className="font-sans font-black text-xl md:text-2xl text-white group-hover/title:text-brand-primary transition-colors duration-300 leading-tight">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p className="font-sans text-brand-textSecondary text-sm mt-4 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="border-t border-white/5 pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Date & Author */}
                  <div className="flex items-center gap-4 text-xs font-mono text-brand-textMuted">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{post.date}</span>
                    </div>
                    <span>•</span>
                    <span>By {post.author}</span>
                  </div>

                  {/* CTA link */}
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="flex items-center gap-1.5 font-sans font-bold text-xs text-brand-primary hover:text-white transition-colors duration-300"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl">
            <p className="font-sans text-brand-textSecondary">No articles found matching your search parameters.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="font-sans text-xs text-brand-primary font-bold mt-4 underline hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
