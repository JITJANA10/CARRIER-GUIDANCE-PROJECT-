import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Briefcase, TrendingUp, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const careers = [
  { id: '1', title: 'Data Analyst', match: 92, category: 'Technology', skills: ['Python', 'SQL', 'Stats', 'Viz'], demand: 'High', color: 'brand-cyan' },
  { id: '2', title: 'Product Manager', match: 94, category: 'Business', skills: ['Strategy', 'Leadership', 'Agile', 'UX'], demand: 'High', color: 'brand-blue' },
  { id: '3', title: 'UX Designer', match: 85, category: 'Design', skills: ['Figma', 'Research', 'Prototyping', 'Wireframing'], demand: 'Medium', color: 'brand-violet' },
  { id: '4', title: 'Financial Analyst', match: 78, category: 'Finance', skills: ['Excel', 'Modeling', 'Accounting', 'Valuation'], demand: 'High', color: 'green-500' },
  { id: '5', title: 'Software Engineer', match: 88, category: 'Technology', skills: ['React', 'Node.js', 'System Design', 'Algorithms'], demand: 'Very High', color: 'brand-blue' },
  { id: '6', title: 'Marketing Specialist', match: 72, category: 'Media', skills: ['SEO', 'Content', 'Analytics', 'Social'], demand: 'Medium', color: 'orange-500' },
];

const categories = ['All', 'Technology', 'Business', 'Finance', 'Design', 'Media', 'Science'];

export function CareerExplorer() {
  const { savedCareers, toggleSavedCareer } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCareers = careers.filter(c => 
    (activeCategory === 'All' || c.category === activeCategory) &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Career Explorer</h1>
        <p className="text-slate-400 mt-1 text-lg">Discover your next move.</p>
      </motion.div>

      <motion.div 
        className="flex flex-col md:flex-row gap-4 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search careers, skills, or industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-cyan transition-colors"
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto h-12 border-white/10 hover:bg-white/5">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </motion.div>

      <motion.div 
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCareers.map((career, idx) => {
            const isSaved = savedCareers.includes(career.id);
            return (
              <motion.div
                key={career.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card glass className="h-full border-white/5 hover:border-white/20 transition-all overflow-hidden relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${career.color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardContent className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                        <Briefcase className={`h-6 w-6 text-${career.color}`} />
                      </div>
                      <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">
                        {career.match}% Match
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{career.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{career.category}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {career.skills.map(skill => (
                        <span key={skill} className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <TrendingUp className="h-4 w-4" /> Demand: <span className="text-white">{career.demand}</span>
                      </div>
                      <Button onClick={() => toggleSavedCareer(career.id)} variant="ghost" size="sm" className={isSaved ? `text-${career.color} bg-${career.color}/10` : `text-slate-400 hover:text-${career.color} hover:bg-${career.color}/10`}>
                        {isSaved ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />} {isSaved ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
