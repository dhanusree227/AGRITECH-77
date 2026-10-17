import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  ShoppingBag,
  Shield,
  TrendingUp,
  CloudSun,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle,
  FileText,
  AlertTriangle,
  BarChart3,
  Globe2,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchRole, setCurrentRoute, t, mandiPrices, weather, setIsVoiceAssistantOpen, setIsCloudModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#F7F9F4] text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#123D2A] via-[#164a34] to-[#123D2A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C6FF4A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#C6FF4A] font-semibold">
                <Sparkles className="w-4 h-4" /> Next-Gen AI Agricultural Trading & Support
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Grow Smarter. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#C6FF4A] to-[#00B8F0]">
                  Trade Better.
                </span> <br />
                Farm the Future.
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                One intelligent platform connecting farmers, buyers, and agricultural administrators through Gemini 2.5 Flash insights, transparent APMC trading, and calibrated yield & price predictions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    switchRole('farmer');
                    setCurrentRoute('farmer');
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#123D2A] font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/30 transition-all hover:scale-102 flex items-center gap-2"
                >
                  <Sprout className="w-5 h-5 text-[#123D2A]" /> Launch Farmer Hub
                </button>

                <button
                  onClick={() => {
                    switchRole('buyer');
                    setCurrentRoute('buyer');
                  }}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-[#00B8F0]" /> Explore Marketplace
                </button>

                <button
                  onClick={() => setIsVoiceAssistantOpen(true)}
                  className="px-4 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-[#C6FF4A] font-medium rounded-xl text-sm border border-emerald-800 transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" /> Ask AI Voice
                </button>
              </div>

              {/* Clean Metadata stats (Anti-slop clean typography) */}
              <div className="pt-6 flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 border-t border-emerald-900/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" /> Verified APMC Mandi Data
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" /> Open-Meteo Agro Weather
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" /> 8 Indian Languages
                </span>
              </div>
            </div>

            {/* Right Interactive Dashboard Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 text-slate-800 rounded-2xl shadow-2xl p-5 border border-white/20 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm text-slate-800">Live Agriculture Pulse</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {weather?.district || 'Mandya'}, {weather?.state || 'Karnataka'}
                  </span>
                </div>

                {/* Weather Preview */}
                <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CloudSun className="w-8 h-8 text-amber-500" />
                    <div>
                      <div className="text-xl font-bold text-slate-900">
                        {weather?.current.temperature ?? 28}°C
                      </div>
                      <div className="text-xs text-slate-600">
                        Humidity: {weather?.current.humidity ?? 65}% · Wind: {weather?.current.windSpeedKmh ?? 12} km/h
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md">
                    WMO Certified
                  </span>
                </div>

                {/* Mandi Price Samples */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Today's APMC Mandi Benchmark
                  </div>
                  {mandiPrices.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.cropName}</div>
                        <div className="text-[11px] text-slate-500">{item.mandiName} · {item.variety}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-700">₹{item.modalPrice.toLocaleString()} / q</div>
                        <div className={`text-[10px] font-semibold ${item.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.changePercent >= 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Advisory Teaser */}
                <div className="mt-4 p-3 bg-[#123D2A] text-white rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-semibold text-[#C6FF4A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 Agro Advisor
                    </div>
                    <div className="text-[11px] text-emerald-200 mt-0.5 truncate max-w-[220px]">
                      Optimal evening drip fertigation window active.
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVoiceAssistantOpen(true)}
                    className="px-2.5 py-1 text-xs font-bold bg-[#10B981] text-[#123D2A] rounded-lg hover:bg-[#C6FF4A] transition-colors"
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Navigation Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
            Role-Based Modules
          </div>
          <h2 className="text-3xl font-extrabold text-[#123D2A]">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Switch between farmer, buyer, and administrator roles to explore full end-to-end functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Farmer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#123D2A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Farmer Module</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Record crop plots, calculate yield and cultivation break-even prices, view APMC mandi trends, get Gemini disease diagnosis, and list produce for direct buyer sale.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Full Crop CRUD & plot management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Calibrated yield & profit prediction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Direct marketplace listing & orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Expense tracker & break-even calculation
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                switchRole('farmer');
                setCurrentRoute('farmer');
              }}
              className="w-full py-2.5 px-4 bg-[#123D2A] hover:bg-[#1a553b] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              Enter Farmer Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Buyer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#123D2A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6 text-[#00B8F0]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Buyer Marketplace</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Search verified farmer listings, filter by crop grade and district, submit purchase requests with custom quantities, and track orders from harvest to delivery.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" /> Direct-from-farmer trade (Zero commission)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" /> Quality grades A+, A, B+ verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" /> Real-time order state machine lifecycle
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" /> AI sourcing & demand forecasting
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                switchRole('buyer');
                setCurrentRoute('buyer');
              }}
              className="w-full py-2.5 px-4 bg-[#00B8F0] hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Enter Buyer Marketplace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#123D2A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Directorate</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Oversee platform compliance, verify 7/12 land records and trader licenses, audit orders and disputes, and monitor Gemini AI API health and Firestore security rules.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> User verification & role governance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> Listing moderation & fraud prevention
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> Immutable audit logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> AI latency & API telemetry
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                switchRole('admin');
                setCurrentRoute('admin');
              }}
              className="w-full py-2.5 px-4 bg-[#123D2A] hover:bg-[#1a553b] text-[#C6FF4A] border border-[#10B981]/40 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              Enter Admin Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* AI Intelligence Showcase */}
      <section className="py-16 bg-[#123D2A] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#C6FF4A] uppercase tracking-wider">
              Gemini & Agronomic Models
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Transparent, Multi-Factor Agricultural Intelligence
            </h2>
            <p className="text-xs text-emerald-200 mt-2">
              We never fabricate predictions. Every yield forecast and price trajectory is derived from empirical agronomics, APMC historical data, and WMO weather parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-xs">
              <BarChart3 className="w-8 h-8 text-[#C6FF4A] mb-3" />
              <h3 className="font-bold text-base mb-1">Crop Yield Regression</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Evaluates soil nitrogen retention, irrigation efficiency (Drip +25% vs Rainfed -28%), seasonal rainfall factors, and historical yields to output calibrated bounds.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-xs">
              <TrendingUp className="w-8 h-8 text-[#10B981] mb-3" />
              <h3 className="font-bold text-base mb-1">Mandi Price Forecasting</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Analyzes arrivals volume, state APMC modal quotes, and seasonal demand surges to provide 30-day price trajectories and recommended selling windows.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-xs">
              <Bot className="w-8 h-8 text-[#00B8F0] mb-3" />
              <h3 className="font-bold text-base mb-1">Multilingual Voice & Vision</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Talk in your mother tongue (Kannada, Hindi, Tamil, Telugu, etc.) or upload a crop leaf image for instant symptom identification and KVK-certified IPM recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
            Workflow Architecture
          </div>
          <h2 className="text-3xl font-extrabold text-[#123D2A]">
            Direct Farm-to-Buyer Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Register & Verify', desc: 'Farmer or Buyer onboarded with regional details.' },
            { step: '02', title: 'Add Crops & Plot', desc: 'Track plot lifecycle, soil, and harvest timelines.' },
            { step: '03', title: 'AI Prediction', desc: 'Forecast yield, costs, and break-even selling prices.' },
            { step: '04', title: 'List Produce', desc: 'Publish direct listing with Grade A/A+ specifications.' },
            { step: '05', title: 'Buyer Orders', desc: 'Buyers discover produce, agree on price, and order.' },
            { step: '06', title: 'Fulfill & Settle', desc: 'Transparent status progression to completion.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#10B981] font-extrabold text-xs flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                {item.step}
              </div>
              <div className="font-bold text-xs text-slate-800">{item.title}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#123D2A] text-emerald-100/80 py-12 border-t border-emerald-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#10B981] flex items-center justify-center text-[#123D2A] font-bold">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">AgriTech Platform</div>
              <div className="text-[10px] text-emerald-300">Empowering Indian Agriculture with Artificial Intelligence</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <button onClick={() => setIsCloudModalOpen(true)} className="hover:text-white transition-colors">
              Security Rules & Architecture
            </button>
            <span aria-hidden="true">·</span>
            <span>Data Sources: AGMARKNET, Open-Meteo, ICAR Agronomy</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 2.5 Flash SDK Integration</span>
          </div>

          <div className="text-[11px] text-emerald-300/80">
            © 2026 AgriTech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
