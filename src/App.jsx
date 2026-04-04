import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Bot, RefreshCw, Facebook, CheckCircle2, 
  Activity, Calendar, Brain, BadgeDollarSign, 
  MessageSquareText, CarFront, ShieldCheck, Sparkles, TrendingUp,
  MapPin, Gauge, Fuel, Zap, Clock, Trophy, Users, BarChart,
  Layers, Wand2, Image as ImageIcon, Layout, Zap as Fast,
  ArrowDownCircle, HelpCircle, Check, X
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const directions = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 30, opacity: 0 },
    right: { x: -30, opacity: 0 },
  };

  return (
    <motion.div
      initial={directions[direction]}
      whileInView={{ y: 0, x: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500">
    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-blue-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="relative flex flex-col items-center text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white mb-6 shadow-xl shadow-blue-500/20">
      {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm font-medium">{desc}</p>
  </div>
);

export default function App() {
  const [isAnnual, setIsAnnual] = useState(true);

  const demoUrl = "https://calendar.app.google/RU6wbUCbgEGjvxEF8";
  const downloadUrl = "https://github.com/mgarbs/autolander-releases/releases/latest/download/AutoLander-Setup.exe";

  const pricing = [
    {
      name: "Starter",
      monthly: 75,
      annual: 59,
      posts: "5 Posts / Day",
      features: ["Instant Inventory Sync", "AI Photo Studio", "Auto Queue", "Standard AI Descriptions", "Feed Sync (CarGurus/Cars.com)"]
    },
    {
      name: "Growth",
      monthly: 100,
      annual: 79,
      posts: "10 Posts / Day",
      popular: true,
      features: ["Everything in Starter", "Premium AI Backgrounds", "Custom Studio Backgrounds", "Advanced SEO Descriptions", "Priority Syncing"]
    },
    {
      name: "Pro",
      monthly: 125,
      annual: 99,
      posts: "20 Posts / Day",
      features: ["Everything in Growth", "Unlimited Marketplace Support", "Multi-Agent Queueing", "Concierge Setup", "Dedicated Support Agent"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <CarFront className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <img src="/autolander-logo.png" alt="AutoLander" className="h-8 sm:h-14 w-auto group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
             <a href="#how-it-works" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">How It Works</a>
             <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Features</a>
             <a href="#studio" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">AI Studio</a>
             <a href="#pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Pricing</a>
          </div>
          <div className="flex items-center shrink-0">
            <button
              onClick={() => window.open(demoUrl, "_blank")}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-52 pb-20 lg:pb-40 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <FadeIn direction="right">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">AI-Powered Inventory Dominance</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1} direction="right">
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-white">
                SELL 10-15 MORE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600">
                  CARS PER MONTH.
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="right">
              <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-medium italic">
                Dominate Facebook Marketplace with professional listings that convert. Our AI turns your inventory into a high-performance sales machine that drives more leads and closes more deals.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3} direction="right">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.button
                  whileHover={{ y: -4, shadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(downloadUrl, "_blank")}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg transition-all flex items-center justify-center space-x-3 uppercase italic"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
                <button 
                  onClick={() => window.open(demoUrl, "_blank")}
                  className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white/5 text-white font-bold text-lg hover:bg-white/10 border border-white/10 transition-all uppercase italic"
                >
                  Book a Demo
                </button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} direction="left">
            <div className="relative group mt-12 lg:mt-0">
              <div className="absolute inset-0 bg-blue-600/30 blur-[120px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
              
              {/* Fake Posting Queue UI */}
              <div className="relative rounded-[40px] border border-white/10 shadow-3xl bg-black/80 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase">
                    Live Revenue Queue
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: '2022 BMW M4 Competition', status: 'Generating Lead Traffic...', progress: 90, color: 'bg-green-500' },
                    { name: '2021 Ford F-150 Lariat', status: 'Optimizing for Search...', progress: 45, color: 'bg-blue-500' },
                    { name: '2023 Tesla Model Y', status: 'AI Conversion Tuning...', progress: 15, color: 'bg-indigo-500' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white italic">{item.name}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.status}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Growth</p>
                      <p className="text-lg font-black text-white italic">12 EXTRA SALES/MO</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Sales Growth', value: '+12 UNITS' },
              { label: 'Lead Volume', value: '3X MORE' },
              { label: 'Listing Quality', value: 'PRO STUDIO' },
              { label: 'Market Reach', value: 'UNLIMITED' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                MANUAL VS. <span className="text-blue-500">AUTOLANDER</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg italic">Stop burning time on grunt work. Focus on closing deals while AI handles the rest.</p>
            </FadeIn>
          </div>

          <FadeIn direction="up" delay={0.2}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 md:py-6 px-2 md:px-4 text-left text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest"></th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">Manual</th>
                    <th className="py-4 md:py-6 px-2 md:px-4 text-center text-blue-500 text-[10px] md:text-xs font-black uppercase tracking-widest bg-blue-500/5 rounded-t-3xl">AutoLander</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Listing Quality', manual: 'Amateur', auto: 'Pro Studio' },
                    { label: 'Lead Gen', manual: 'Inconsistent', auto: 'High-Convert AI' },
                    { label: 'Inventory Sync', manual: 'Manual Entry', auto: 'Automatic' },
                    { label: 'Form Filling', manual: 'Click-by-Click', auto: '100% Auto' },
                    { label: 'Descriptions', manual: 'Copy-Paste', auto: 'AI Optimized' },
                    { label: 'Monthly Results', manual: 'Varies', auto: '+12 Units Avg' }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 group">
                      <td className="py-4 md:py-6 px-2 md:px-4 text-white font-bold italic uppercase tracking-tight text-xs md:text-base">{row.label}</td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-center text-slate-500 font-medium text-xs md:text-base">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <X className="w-3 h-3 md:w-4 md:h-4 text-red-500/50 shrink-0" /> {row.manual}
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 md:px-4 text-center text-white font-black italic bg-blue-500/5 group-last:rounded-b-3xl text-xs md:text-base">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <Check className="w-3 h-3 md:w-5 md:h-5 text-blue-500 shrink-0" /> {row.auto}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 lg:mb-32">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                3 STEPS TO <span className="text-blue-500">DOMINANCE.</span>
              </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <FadeIn delay={0.1}>
              <Step 
                number="01" 
                title="Connect Feed" 
                desc="Paste your CarGurus or Cars.com feed URL. Your entire inventory (100-200+ units) syncs automatically with all specs and features."
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <Step 
                number="02" 
                title="Enhance Visuals" 
                desc="Select from our AI Studio backdrops—Showroom, Outdoor, or Luxury—to make your lot photos look like a professional shoot."
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <Step 
                number="03" 
                title="Start Auto Sales" 
                desc="Hit 'Start' and watch as AutoLander AI removes backgrounds and publishes listings designed to rank higher and sell faster."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <FadeIn delay={0.1} direction="up">
              <FeatureCard 
                icon={RefreshCw}
                title="Automatic Sync"
                desc="Sync hundreds of vehicles from CarGurus or Cars.com automatically. VIN, price, trim, and specs are always 100% accurate."
              />
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <FeatureCard 
                icon={Wand2}
                title="Smart AI Posting"
                desc="Our AI autonomously fetches photos, generates descriptions, and fills out complex Facebook Marketplace forms."
              />
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <FeatureCard 
                icon={Layers}
                title="AI Photo Studio"
                desc="Instantly remove messy lot backgrounds and replace them with high-end showroom or scenic backdrops."
              />
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <FeatureCard 
                icon={Activity}
                title="Continuous Queue"
                desc="Set it and forget it. AutoLander posts your inventory one-by-one with intelligent logic to maximize visibility."
              />
            </FadeIn>
            <FadeIn delay={0.5} direction="up">
              <FeatureCard 
                icon={Layout}
                title="Zero Setup"
                desc="No complex integrations. Just paste a URL, log into Facebook, and start selling more cars today."
              />
            </FadeIn>
            <FadeIn delay={0.6} direction="up">
              <FeatureCard 
                icon={TrendingUp}
                title="Lead Acceleration"
                desc="Our AI-optimized listings are designed to rank higher and generate 30% more Messenger inquiries."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* AI Photo Studio Section */}
      <section id="studio" className="py-24 lg:py-40 bg-[#080808] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <FadeIn direction="right">
              <h2 className="text-4xl lg:text-7xl font-black mb-8 tracking-tighter leading-none uppercase italic">
                AI PHOTO <br/><span className="text-blue-500">STUDIO.</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium italic mb-10 leading-relaxed">
                Turn messy lot photos into professional studio shots in one click. Our AI removes backgrounds and composites your vehicle onto premium backdrops.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                {['Showroom White', 'Outdoor Sunset', 'Luxury Showroom', 'Industrial Grey', 'Mountain View', 'Custom Upload'].map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-300 font-bold text-sm italic">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    {opt}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(demoUrl, "_blank")}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black text-lg transition-all uppercase italic"
              >
                See the Studio in Action
              </motion.button>
            </FadeIn>

            <FadeIn direction="left">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600/20 blur-[100px] opacity-40" />
                <div className="relative space-y-6">
                   {/* Before */}
                   <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                      <img
                        src="/studio-before.jpg"
                        alt="Original Dealer Lot Photo"
                        className="w-full object-cover"
                      />
                      <div className="absolute top-5 left-5 px-5 py-2 bg-red-600/90 backdrop-blur-md rounded-xl text-xs font-black text-white uppercase tracking-widest">
                        Before — Original Lot Photo
                      </div>
                   </div>
                   {/* After */}
                   <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/10">
                      <img
                        src="/studio-after.jpg"
                        alt="AI Studio — Outdoor Clean Background"
                        className="w-full object-cover"
                      />
                      <div className="absolute top-5 right-5 px-5 py-2 bg-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/30">
                        After — AI Studio
                      </div>
                   </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                PLANS FOR <span className="text-blue-500">GROWTH.</span>
              </h2>
              
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={`text-sm font-bold uppercase italic ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-14 h-7 rounded-full bg-white/10 border border-white/10 p-1 flex items-center transition-all"
                >
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold uppercase italic ${isAnnual ? 'text-white' : 'text-slate-500'}`}>Annual</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest">Save 20%</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className={`relative p-10 rounded-[40px] h-full flex flex-col transition-all duration-500 ${plan.popular ? 'bg-blue-600 text-white scale-105 shadow-2xl shadow-blue-500/20 z-10' : 'bg-white/[0.03] border border-white/5 text-slate-50 hover:bg-white/[0.05]'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-xl">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl lg:text-5xl font-black italic tracking-tighter">${isAnnual ? plan.annual : plan.monthly}</span>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">/ Month</span>
                    </div>
                    <p className={`mt-4 text-sm font-bold italic tracking-tight ${plan.popular ? 'text-blue-100' : 'text-blue-500'}`}>{plan.posts}</p>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-white' : 'text-blue-500'}`} />
                        <span className="text-sm font-medium opacity-90">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(downloadUrl, "_blank")}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase italic tracking-tighter transition-all ${plan.popular ? 'bg-white text-blue-600 hover:bg-slate-100' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'}`}
                  >
                    Start Free Trial
                  </motion.button>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-center opacity-40 italic">First 5 posts are free</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none text-white">
                 DEALER <span className="text-blue-500">VOICES.</span>
               </h2>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "AutoLander is a game changer. Our lead volume has tripled since we started using the AI Studio backgrounds. The professional look really matters.",
                author: "Mike Thompson",
                role: "General Manager, City Ford"
              },
              {
                quote: "I used to spend my entire morning manual posting to Facebook. Now it's all automated. It's the best investment we make for our digital presence.",
                author: "Sarah Jenkins",
                role: "Internet Director, Elite Motors"
              },
              {
                quote: "The background removal is magic. Our lot is crowded, but our listings look like they were shot in a $10M showroom. Highly recommend.",
                author: "David Chen",
                role: "Owner, DC Auto Group"
              }
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col h-full italic">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-3 h-3 text-blue-500" />)}
                  </div>
                  <p className="text-slate-400 font-medium mb-8 flex-grow leading-relaxed">"{t.quote}"</p>
                  <div>
                    <p className="text-white font-black uppercase tracking-tight">{t.author}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-40 relative">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <FadeIn>
              <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                 ANY <span className="text-blue-500">QUESTIONS?</span>
               </h2>
            </FadeIn>
          </div>

          <div className="space-y-6">
            {[
              { q: "Which inventory feeds do you work with?", a: "We work seamlessly with CarGurus and Cars.com feeds. Simply paste your public feed URL, and our system will extract all vehicle data, photos, and specs automatically." },
              { q: "How does this help me sell more cars?", a: "AutoLander creates high-quality, professional listings that stand out in the Marketplace. By using AI to optimize photos and descriptions, dealers typically see a 3x increase in lead volume and sell an average of 12 extra units per month." },
              { q: "Do I need any technical skills?", a: "Zero. If you can copy and paste a URL and click a button, you can use AutoLander. It's designed for busy sales teams who want to sell cars, not manage software." },
              { q: "Is there a limit on how many cars I can post?", a: "Limits are based on your plan (5, 10, or 20 per day). This ensures your Facebook account stays safe and compliant with Marketplace algorithms." }
            ].map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-lg font-black text-white uppercase italic tracking-tight mb-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500" /> {faq.q}
                  </h4>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed italic">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 lg:py-48 relative overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.8] uppercase italic text-white">
              STOP POSTING.<br/><span className="text-blue-500">START SELLING.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium italic">
              Join 500+ dealerships using AutoLander to automate their Marketplace dominance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(downloadUrl, "_blank")}
                className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-white text-black font-black text-xl transition-all shadow-3xl shadow-white/5 uppercase italic tracking-tighter"
              >
                Start Your Free Trial
              </motion.button>
              <button 
                onClick={() => window.open(demoUrl, "_blank")}
                className="w-full sm:w-auto px-10 py-6 rounded-2xl bg-white/5 text-white font-bold text-xl hover:bg-white/10 border border-white/10 transition-all uppercase italic"
              >
                Book a Live Demo
              </button>
            </div>
            <p className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">No Credit Card Required • Instant Setup</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <CarFront className="w-6 h-6 text-white" />
              </div>
              <img src="/autolander-logo.png" alt="AutoLander" className="h-14 w-auto" />
            </div>
            
            <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
              <a href="mailto:support@autolander.app" className="hover:text-blue-500 transition-colors">Support</a>
            </div>

            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">© 2026 AutoLander. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
