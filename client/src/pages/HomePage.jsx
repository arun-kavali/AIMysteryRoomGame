import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Search, 
  Trophy, 
  FileText, 
  UserCheck, 
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 border border-border p-6 sm:p-10 lg:p-12 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-surface border border-blue-200 text-primary text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Interactive Detective Game
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
              Solve Mysteries <br className="hidden sm:inline" />
              with the <span className="text-primary">Power of AI</span>
            </h1>

            <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              Step into the shoes of a detective. Investigate clues, question suspects and uncover the truth. Can you find the real culprit?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/create" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" fullWidth icon={Sparkles}>
                  Start a Mystery
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth icon={HelpCircle}>
                  How It Works
                </Button>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-secondary border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Original Scenarios
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                3 Difficulty Levels
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Skill-Based Scoring
              </span>
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-slate-900 group">
              {/* Detective atmosphere visual */}
              <div className="relative aspect-[4/3] bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent">
                <img
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800"
                  alt="Detective investigation atmosphere"
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-blue-900/20" />
                
                {/* Overlay floating badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center text-primary flex-shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-900 truncate">The Stolen Diamond</p>
                    <p className="text-[11px] text-secondary">Active Case • 4 Suspects • 7 Clues</p>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Medium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row - 4 Cards matching Image */}
      <section id="features" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            Deductive Gameplay Engineered with AI
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Every case is built with logical consistency, verified alibis, and subtle physical evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-6 text-center flex flex-col items-center hover:border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              AI-Generated Mysteries
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Unique cases every time powered by intelligent narrative generation.
            </p>
          </Card>

          <Card className="p-6 text-center flex flex-col items-center hover:border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              Multiple Difficulty Levels
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Tailor the mystery complexity: Easy, Medium, or Hard investigations.
            </p>
          </Card>

          <Card className="p-6 text-center flex flex-col items-center hover:border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              Interactive Investigation
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Explore evidence, inspect alibis, discover secrets, and unlock hints.
            </p>
          </Card>

          <Card className="p-6 text-center flex flex-col items-center hover:border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              Real Scoring System
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Earn points for clues found, manage hint penalties, and solve the crime.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="space-y-8 bg-white rounded-3xl border border-border p-8 sm:p-12 shadow-card">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            How It Works
          </h2>
          <p className="text-sm text-secondary">
            Four simple steps to unravel the mystery and test your detective reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-surface text-primary font-bold flex items-center justify-center mb-4 border border-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900 mb-1">1. Create</h4>
            <p className="text-xs sm:text-sm text-secondary">
              Enter a custom premise or let AI generate one across 3 difficulty tiers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary font-bold flex items-center justify-center mb-4 border border-blue-200">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900 mb-1">2. Investigate</h4>
            <p className="text-xs sm:text-sm text-secondary">
              Find hidden clues, examine suspect motives, and selectively unlock hints.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center mb-4 border border-amber-200">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900 mb-1">3. Accuse</h4>
            <p className="text-xs sm:text-sm text-secondary">
              Select the suspect you believe is guilty and formulate your final reasoning.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4 border border-emerald-200">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-navy-900 mb-1">4. Get Results</h4>
            <p className="text-xs sm:text-sm text-secondary">
              See the official verdict, full explanation, and detailed scoring breakdown.
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-navy-900">Ready to take on your first case?</h4>
            <p className="text-xs sm:text-sm text-secondary">No registration required. Generate a mystery in seconds.</p>
          </div>
          <Link to="/create">
            <Button size="md" variant="primary" icon={ArrowRight}>
              Start Your Investigation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

