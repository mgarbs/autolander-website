import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Bot, Inbox, RefreshCw, Facebook, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

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
              <span className="text-sm font-medium">AutoLander SaaS is Now Live</span>
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
              Your salespeople waste 3+ hours a day copy-pasting listings, refreshing inboxes, and chasing cold leads. AutoLander does all of it automatically.
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

      {/* The Problem Section */}
      <section className="py-24 bg-slate-900 relative border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The math is brutal.</h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Your competitors are responding to leads in 47 seconds. You're responding in 47 minutes. Every hour of delay costs you - in lost gross profit.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: '68%', text: 'of car buyers go with the first dealer who responds.' },
              { stat: '50%', text: 'of a salespersons day is spent on admin, not selling.' },
              { stat: '20m', text: 'wasted per vehicle manually posting to FB Marketplace.' }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="text-4xl font-black text-blue-400 mb-4">{item.stat}</div>
                  <p className="text-slate-300 text-lg">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
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
                {/* Floating element */}
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

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24 flex-row-reverse">
            <FadeIn direction="left">
              <div className="order-1 md:order-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">AI Lead Scoring & Instant Response</h3>
                <p className="text-lg text-slate-400 mb-6">
                  Every inbound message gets read, scored, and answered instantly. AutoLander's AI knows which leads are hot, which are tire-kickers, and exactly what to say.
                </p>
                <ul className="space-y-3">
                  {['Personalized, natural-sounding AI replies', 'Scans FB inbox automatically', 'Separates serious buyers from browsers', 'Auto-escalates high-value leads'].map((t, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                      <span className="text-slate-300">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 rounded-xl bg-purple-900/30 border border-purple-500/20">
                  <p className="text-purple-300 font-medium">Result: 24/7 lead response. Zero missed opportunities.</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <div className="order-2 md:order-1 relative group perspective-1000">
                <motion.div 
                  whileHover={{ rotateY: 5, rotateX: 5 }}
                  className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl transform-gpu transition-all duration-500"
                >
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                      <div className="bg-slate-700 rounded-lg p-3 text-sm">Is this vehicle still available?</div>
                    </div>
                    <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
                      <div className="bg-blue-600 rounded-lg p-3 text-sm text-white">Yes, it's on the lot! Would you like to schedule a test drive today?</div>
                    </div>
                    <div className="flex items-start space-x-3 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                      <div className="bg-slate-700 rounded-lg p-3 text-sm">Sure, I can come by at 4 PM.</div>
                    </div>
                  </div>
                </motion.div>
                {/* Floating element */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-6 -right-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex items-center space-x-4"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Lead Score: 98/100</p>
                    <p className="text-xs text-slate-400">High Intent detected</p>
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
                  <div className="space-y-4">
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
      <section className="py-24 bg-slate-800 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Dealers Who Switched Don't Look Back</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.1} direction="up">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 relative">
                <div className="text-blue-500 text-6xl absolute top-4 left-4 opacity-20">"</div>
                <p className="text-lg text-slate-300 mb-6 relative z-10 italic">
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
            <FadeIn delay={0.2} direction="up">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 relative">
                <div className="text-blue-500 text-6xl absolute top-4 left-4 opacity-20">"</div>
                <p className="text-lg text-slate-300 mb-6 relative z-10 italic">
                  My guys were spending half the day posting to Facebook. Now they spend it on the lot, with customers. We moved 22% more units in our first full month.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Sarah K.</p>
                    <p className="text-sm text-slate-400">Dealer Principal, Independent BHPH, OH</p>
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
