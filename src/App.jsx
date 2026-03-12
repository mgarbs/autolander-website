import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Bot, RefreshCw, Facebook, CheckCircle2, 
  Activity, Calendar, Brain, BadgeDollarSign, 
  MessageSquareText, CarFront, ShieldCheck, Sparkles, TrendingUp,
  MapPin, Gauge, Fuel, Zap, Clock, Trophy, Users, BarChart
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

export default function App() {
  const vehicles = [
    { name: '2022 Ford F-150 Lariat', vin: '1FTFW1E8X...', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400', price: ',900' },
    { name: '2021 Toyota Camry SE', vin: '4T1B11HK5...', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400', price: ',500' },
    { name: '2023 Tesla Model 3', vin: '5YJ3E1EB8...', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400', price: ',900' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <CarFront className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase italic">
              Auto<span className="text-blue-500">Lander</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-10">
             <a href="#automation" className="text-sm font-semibold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]">AI Intelligence</a>
             <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]">Features</a>
             <a href="#testimonials" className="text-sm font-semibold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]">Case Studies</a>
          </div>
          <button
            onClick={() => window.open("https://calendar.app.google/RU6wbUCbgEGjvxEF8", "_blank")}
            className="px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">
            Book a Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-16 lg:pt-60 lg:pb-32 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left">
            <FadeIn direction="right">
              <div className="inline-flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-500/5 text-blue-400 border border-blue-500/20 mb-6 sm:mb-8 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-left text-left">Next-Gen Dealer Intelligence</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1} direction="right">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 leading-[0.9] text-white text-left">
                STOP LOSING DEALS.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600 drop-shadow-sm">
                  SELL ON AUTOPILOT.
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="right">
              <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-8 sm:mb-10 max-w-xl leading-relaxed font-medium">
                The world's first high-reasoning AI platform built exclusively for car dealerships. Hunt leads, score intent, and book closers while you sleep.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3} direction="right">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-left">
                <motion.button
                  whileHover={{ y: -4, shadow: "0 20px 40px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open("https://calendar.app.google/RU6wbUCbgEGjvxEF8", "_blank")}
                  className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-black text-base sm:text-lg transition-all flex items-center justify-center space-x-3"
                >
                  <span>SEE IT ON YOUR LEADS</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} direction="left">
            <div className="relative group text-left mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-blue-600/30 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
              <div className="relative rounded-3xl sm:rounded-[40px] overflow-hidden border border-white/10 shadow-3xl bg-black transform group-hover:scale-[1.02] transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200" 
                  alt="Luxury Performance Car" 
                  className="w-full h-64 sm:h-[500px] object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Floating Metric */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 sm:mb-1">Response Guarantee</p>
                    <p className="text-sm sm:text-xl font-black text-white italic tracking-tighter leading-none text-left">UNDER 5 MINUTES</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* AI Reasoning Section */}
      <section id="automation" className="py-20 sm:py-32 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="right">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-8 sm:mb-10 tracking-tight leading-none text-white">
                AI THAT THINKS <br/>
                <span className="text-blue-500 uppercase italic text-left text-left">LIKE A CLOSER.</span>
              </h2>
              <div className="grid gap-4 sm:gap-6">
                {[
                  { icon: Brain, title: "Sentiment Analysis", desc: "Our models reason through buyer skepticism and urgency with 20-year sales veteran nuance." },
                  { icon: BadgeDollarSign, title: "Full Deal Capture", desc: "Automatically extracts trade-in, financing, and down payment details before you call." },
                  { icon: Calendar, title: "Autonomous Booking", desc: "Syncs directly to Google Calendar and fires SMS reminders to ensure buyer show-ups." }
                ].map((item, i) => (
                  <div key={i} className="group p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 text-left">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform text-left">
                        <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                      </div>
                      <div className="text-left text-left">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white text-left">{item.title}</h4>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium text-left text-left">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative bg-[#0A0A0A] rounded-3xl sm:rounded-[40px] border border-white/10 p-6 sm:p-10 shadow-3xl overflow-hidden">
                  <div className="flex justify-between items-center mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-slate-500">Live Agent Intelligence</span>
                    </div>
                    <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-green-500/10 text-green-400 text-[8px] sm:text-[10px] font-black tracking-widest border border-green-500/20 uppercase">SENTIMENT: 98%</div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-blue-400 text-[10px] sm:text-xs font-black uppercase mb-1.5 sm:mb-2 flex items-center gap-2">
                        <MessageSquareText className="w-3 h-3" /> AI Reasoning
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-300 italic text-left">"Detected buyer urgency due to lease expiring Friday. Initiating trade-in appraisal workflow."</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-0.5 sm:gap-1 text-left">
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Trade-In</span>
                        <span className="font-bold text-xs sm:text-base text-white uppercase italic text-left leading-none">2018 Ford F-150</span>
                      </div>
                      <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-0.5 sm:gap-1 text-left">
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-left text-left">Payment</span>
                        <span className="font-bold text-xs sm:text-base text-white uppercase italic text-left leading-none">Finance (Tier 1)</span>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex justify-between items-center text-left">
                      <div className="flex items-center gap-3 sm:gap-4 text-left text-left">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        <div className="flex flex-col text-left">
                           <span className="text-[8px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest underline decoration-2 underline-offset-4 text-left">Appt Booked</span>
                           <span className="font-black text-white text-sm sm:text-lg text-left leading-none mt-1">Tomorrow @ 2:30 PM</span>
                        </div>
                      </div>
                      <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-50 text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Case Studies / Results Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-[#050505] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 sm:mb-24 text-left">
            <FadeIn>
               <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 tracking-tighter uppercase italic leading-none text-white">
                 BATTLE TESTED. <br/><span className="text-blue-500 uppercase">MARKET DOMINANT.</span>
               </h2>
               <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium italic leading-relaxed">Real rooftops. Real closings. Absolute dominance.</p>
            </FadeIn>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {[
               {
                 title: "14 Extra Units / Mo",
                 dealer: "Mike R., Sales Manager",
                 loc: "3-Rooftop Group, TX",
                 desc: "We went from responding to leads in 2 hours to under 2 minutes. AutoLander paid for itself on day one.",
                 stat: "+22% Sales Volume"
               },
               {
                 title: "40+ Appts on Autopilot",
                 dealer: "James T., Internet Director",
                 loc: "Honda Dealership, FL",
                 desc: "The AI reasoning is shockingly good. Customers don't even know they're talking to a bot until my closer picks up.",
                 stat: "98% Lead Quality"
               },
               {
                 title: "Zero Admin Waste",
                 dealer: "Sarah K., Dealer Principal",
                 loc: "Independent BHPH, OH",
                 desc: "My guys were spending half the day posting to Facebook. Now they spend it on the lot, with customers.",
                 stat: "300+ Man Hours Saved"
               }
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="p-8 sm:p-10 rounded-3xl sm:rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col h-full hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-2 mb-6 sm:mb-8 text-blue-500">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{card.stat}</span>
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter mb-4 sm:mb-6">{card.title}</h4>
                  <p className="text-slate-400 font-medium mb-8 sm:mb-10 flex-grow italic leading-relaxed text-sm">"{card.desc}"</p>
                  <div className="pt-6 sm:pt-8 border-t border-white/5">
                    <p className="font-black text-white text-sm sm:text-base uppercase italic">{card.dealer}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{card.loc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory Sync Section */}
      <section id="features" className="py-20 sm:py-32 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 sm:mb-24 text-left">
            <FadeIn>
               <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 tracking-tighter uppercase italic leading-none text-white text-left">
                 Your Lot. Every Marketplace. <br/><span className="text-blue-500">Zero Effort.</span>
               </h2>
               <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium italic">Plug in your DMS or inventory feed once. Every listing stays live, priced right, and up to date—automatically.</p>
            </FadeIn>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="right">
              <div className="space-y-8 sm:space-y-12 text-left">
                {[
                  { icon: Facebook, title: "Facebook Marketplace on Autopilot", desc: "Your full inventory posted from real salesperson profiles—not a business page. AI-written listings that sound human and sell hard, running 24/7." },
                  { icon: RefreshCw, title: "Always-Accurate Listings", desc: "Your inventory feed syncs to every marketplace. Prices, photos, and availability are always ready—your team just reviews and hits publish." },
                  { icon: TrendingUp, title: "Built-In Quality Control", desc: "Every listing is prepped by AI and queued for your team to approve. Human eyes on every post—so nothing goes live that shouldn't." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-8 group cursor-default text-left">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white uppercase italic tracking-tight text-left">{item.title}</h4>
                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium text-left">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="left">
               <div className="grid gap-4 sm:gap-6 text-left">
                  {vehicles.map((v, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-[24px] bg-white/[0.02] border border-white/5 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-4 sm:gap-6 text-left">
                        <img src={v.img} className="w-16 h-12 sm:w-24 sm:h-16 object-cover rounded-lg sm:rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 shadow-2xl" alt={v.name} />
                        <div className="flex flex-col text-left">
                           <p className="text-sm sm:text-lg font-black text-white italic tracking-tighter leading-none mb-1 text-left text-left">{v.name}</p>
                           <p className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest text-left text-left">{v.vin}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[8px] sm:text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 text-left">
                           <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse text-left text-left" /> AUTOMATED
                        </span>
                        <p className="text-white font-black text-sm sm:text-lg mt-1">{v.price}</p>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 sm:py-48 relative overflow-hidden text-center border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-8 sm:mb-12 tracking-tighter leading-[0.8] uppercase italic text-white text-center">
              LEADS DON'T WAIT. <br/><span className="text-blue-500 uppercase italic">NEITHER SHOULD YOU.</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 sm:mb-16 max-w-2xl mx-auto font-medium leading-relaxed italic text-center">
              AutoLander dealers close <span className="text-blue-500 font-black">3–5 extra units/month</span> from the same traffic. That's up to <span className="text-blue-500 font-black">$75,000+ in added gross</span>—without hiring anyone.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open("https://calendar.app.google/RU6wbUCbgEGjvxEF8", "_blank")}
              className="w-full sm:w-auto px-8 sm:px-12 py-4.5 sm:py-6 rounded-xl sm:rounded-[24px] bg-white text-black font-black text-lg sm:text-2xl transition-all transform shadow-3xl shadow-white/5 uppercase italic tracking-tighter"
            >
              Book a 15-Min Demo →
            </motion.button>
            <p className="mt-6 sm:mt-8 text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">No Contracts • No Credit Card • Live in 10 Mins</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 border-t border-white/5 text-center bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-6 sm:mb-10 opacity-50 grayscale group cursor-pointer hover:opacity-100 hover:grayscale-0 transition-all text-center">
              <CarFront className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-base sm:text-lg font-bold tracking-tight uppercase italic text-white">AutoLander</span>
           </div>
           <p className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">© 2026 AutoLander Intelligence. Built for closers.</p>
        </div>
      </footer>
    </div>
  );
}
