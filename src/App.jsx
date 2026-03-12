import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  ArrowRight, Bot, Inbox, RefreshCw, Facebook, CheckCircle2, 
  ChevronRight, Activity, Calendar, Zap, Brain, BadgeDollarSign, 
  Clock, BarChart3, MessageSquareText 
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const directions = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 },
  };

  return (
    <motion.div
      initial={directions[direction]}
      whileInView={{ y: 0, x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AutoLander
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 mr-8">
             <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
             <a href="#automation" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">AI Automation</a>
             <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Success Stories</a>
          </div>
          <div>
            <button className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8">
              <span className="flex w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium">New: Advanced Reasoning Lead Scoring is Live</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Stop Losing Deals. <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Start Selling Cars on Autopilot.
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              AutoLander uses high-reasoning AI to hunt down buyers, score their intent, and book appointments directly to your calendar. 24/7.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center space-x-2"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <span className="text-sm text-slate-500 mt-4 sm:mt-0">No credit card required. Setup in 10 mins.</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* NEW: AI Intelligence Section (Deep Reasoning) */}
      <section id="automation" className="py-24 bg-slate-950 relative overflow-hidden border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                High-Reasoning AI That <br/>
                <span className="text-blue-400">Thinks Like a Closer.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Sentiment & Intent Analysis</h4>
                    <p className="text-slate-400">Our models don't just "reply"—they reason. AutoLander gauges buyer urgency, detects skepticism, and handles objections with the nuance of a 20-year sales veteran.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <BadgeDollarSign className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Full Data Capture</h4>
                    <p className="text-slate-400">The AI automatically extracts trade-in details, financing preferences (Cash, Finance, Lease), and down payment ability before you even pick up the phone.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Autonomous Booking</h4>
                    <p className="text-slate-400">Once a lead is qualified, AutoLander presents open slots and books the appointment directly into Google Calendar, sending instant SMS/Email reminders to the buyer.</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="bg-slate-900 rounded-3xl border border-slate-700 p-8 shadow-2xl relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">HOT LEAD</div>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">SENTIMENT: 94%</div>
                </div>
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-blue-400" />
                  AI Reasoning Log
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-sm italic text-slate-400 border-l-2 border-blue-500">
                    AI Thought: Buyer mentions 'needing something by Friday'. Urgency is high. Extracting trade info...
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-300">Trade-In:</span>
                    <span className="font-bold text-white">2018 Ford F-150</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="text-slate-300">Payment Type:</span>
                    <span className="font-bold text-white">Finance (Excellent Credit)</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                    <span className="text-green-400 flex items-center gap-2"><Calendar className="w-4 h-4"/> Appt Booked:</span>
                    <span className="font-bold text-green-400 text-right">Tomorrow @ 2:30 PM</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-800">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className=\"w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900\" />)}
                      </div>
                      <p className="text-xs text-slate-500">3 Salespeople notified via SMS</p>
                   </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">One Platform. Every Advantage.</h2>
              <p className="text-xl text-slate-400">Everything you need to automate your dealership's sales pipeline.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <FadeIn direction="right">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <Facebook className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Automated Facebook Marketplace Posting</h3>
                <p className="text-lg text-slate-400 mb-6">
                  Stop babysitting listings. AutoLander takes your inventory feed, generates scroll-stopping descriptions with AI, and posts directly to Facebook Marketplace.
                </p>
                <ul className="space-y-3">
                  {['AI-written listings that actually convert', 'Posts from real FB accounts', 'Real-time progress tracking', 'One click. Every vehicle. Done.'].map((t, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                      <span className="text-slate-300">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 rounded-xl bg-blue-900/30 border border-blue-500/20">
                  <p className="text-blue-300 font-medium">Result: What took your team 4 hours now takes 4 seconds.</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="relative group perspective-1000">
                <motion.div 
                  whileHover={{ rotateY: -5, rotateX: 5 }}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-2 shadow-2xl overflow-hidden transform-gpu transition-all duration-500"
                >
                  <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800" alt="Cars" className="rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex items-center space-x-4"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Post Successful</p>
                    <p className="text-xs text-slate-400">2021 Toyota Camry posted to FB</p>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Inventory Feed Sync</h3>
                <p className="text-lg text-slate-400 mb-6">
                  Connect your CarGurus, Cars.com, AutoTrader, or any dealer feed URL. AutoLander syncs your inventory automatically every 6 hours.
                </p>
                <ul className="space-y-3">
                  {['Supports major feed formats', 'Auto-syncs on schedule or manually', 'Price history tracking', 'VIN-level deduplication'].map((t, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
                      <span className="text-slate-300">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 rounded-xl bg-teal-900/30 border border-teal-500/20">
                  <p className="text-teal-300 font-medium">Result: Your online inventory is always accurate, everywhere.</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="relative group perspective-1000">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl overflow-hidden transform-gpu transition-all duration-500"
                >
                  <div className="space-y-4 text-left">
                     {[1,2,3].map(i => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                         <div className="flex items-center space-x-3">
                           <div className="w-12 h-8 bg-slate-600 rounded"></div>
                           <div>
                             <p className="text-sm font-bold">2019 F-150 Lariat</p>
                             <p className="text-xs text-slate-400">VIN: 1FTFW1E8X...</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-bold text-teal-400">Synced</p>
                           <p className="text-xs text-slate-400">Just now</p>
                         </div>
                       </div>
                     ))}
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-800 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Dealers Who Switched Don't Look Back</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <FadeIn delay={0.1} direction="up">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 relative">
                <div className="text-blue-500 text-6xl absolute top-4 left-4 opacity-20">"</div>
                <p className="text-lg text-slate-300 mb-6 relative z-10 italic leading-relaxed">
                  The AI reasoning is shockingly good. It picked up on a buyer wanting to trade in a specific truck and booked the appointment for 4 PM. My team just walked out and closed the deal. It's a game changer.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 shrink-0" />
                  <div>
                    <p className="font-bold text-white">James T.</p>
                    <p className="text-sm text-slate-400">Internet Director, Honda Dealership, FL</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 relative">
                <div className="text-blue-500 text-6xl absolute top-4 left-4 opacity-20">"</div>
                <p className="text-lg text-slate-300 mb-6 relative z-10 italic leading-relaxed">
                  We went from responding to leads in 2 hours to under 2 minutes. Last month we closed 14 extra units we would have lost. AutoLander paid for itself on day one.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Mike R.</p>
                    <p className="text-sm text-slate-400">Sales Manager, 3-rooftop group, TX</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">How Much Is One Lost Deal Costing You?</h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              The average dealership loses 5–10 deals per month to slow response times alone. At ,000 average front-end gross, that's ,000–,000 walking out the door every single month.
            </p>
            <p className="text-2xl font-bold text-white mb-10">
              AutoLander costs a fraction of one lost deal.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center mx-auto space-x-3"
            >
              <span>See Pricing & Start Free Trial</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
            <p className="text-sm text-slate-400 mt-6">No credit card. No contracts. No risk. Just more cars sold.</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-center text-slate-500">
        <p>© 2026 AutoLander. All rights reserved.</p>
      </footer>
    </div>
  );
}
