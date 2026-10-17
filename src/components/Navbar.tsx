import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/translations';
import {
  Sprout,
  Mic,
  Database,
  Globe,
  User,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import type { UserRole } from '../utils/orderLifecycle';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    language,
    setLanguage,
    t,
    currentRoute,
    setCurrentRoute,
    setIsVoiceAssistantOpen,
    setIsCloudModalOpen,
    setIsAuthModalOpen,
    isFirebaseLive,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: Array<{ role: UserRole; label: string; icon: any }> = [
    { role: 'farmer', label: 'Farmer Portal', icon: Sprout },
    { role: 'buyer', label: 'Buyer Marketplace', icon: ShoppingBag },
    { role: 'admin', label: 'Admin Directorate', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#123D2A] text-white border-b border-emerald-900/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentRoute('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#C6FF4A] flex items-center justify-center text-[#123D2A] shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-tight">
                AgriTech
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-[#10B981]/20 text-[#C6FF4A] border border-[#10B981]/30">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-emerald-200/80 -mt-1 hidden sm:block">
                Smart Agro Trading & Intelligence
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentRoute('landing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentRoute === 'landing'
                  ? 'text-[#C6FF4A] bg-white/10'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                switchRole('farmer');
                setCurrentRoute('farmer');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentRoute === 'farmer'
                  ? 'text-[#C6FF4A] bg-white/10'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sprout className="w-4 h-4 text-[#10B981]" /> Farmer Hub
            </button>
            <button
              onClick={() => {
                switchRole('buyer');
                setCurrentRoute('buyer');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentRoute === 'buyer'
                  ? 'text-[#C6FF4A] bg-white/10'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#00B8F0]" /> Buyer Market
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                setCurrentRoute('admin');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentRoute === 'admin'
                  ? 'text-[#C6FF4A] bg-white/10'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" /> Admin
            </button>
          </nav>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Assistant Button */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-102"
            title="Open AI Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse text-[#C6FF4A]" />
            <span className="hidden sm:inline">AI Voice Advisor</span>
          </button>

          {/* Cloud Database & Rules Status */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 transition-colors"
            title="Inspect Cloud Database & Security Rules"
          >
            <Database className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden md:inline">
              {isFirebaseLive ? 'Cloud Live' : 'Storage Active'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setRoleMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                      language === l.code ? 'font-bold text-[#10B981] bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-[11px] text-slate-400">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher & Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#10B981] text-[#123D2A] flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.role[0]}
              </div>
              <div className="hidden lg:block text-xs leading-tight">
                <div className="font-semibold text-white truncate max-w-[100px]">{currentUser.fullName}</div>
                <div className="text-[10px] text-emerald-300 uppercase font-medium">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    {currentUser.district}, {currentUser.state}
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Switch Role
                </div>
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setCurrentRoute(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-emerald-50 ${
                        currentUser.role === r.role ? 'font-bold text-[#10B981] bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-[#123D2A] hover:bg-slate-50"
                  >
                    Sign In with Different Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18251E] px-4 pt-3 pb-5 border-t border-emerald-900/60 space-y-2">
          <button
            onClick={() => {
              setCurrentRoute('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:text-white rounded-lg hover:bg-white/5 font-medium"
          >
            Platform Overview
          </button>
          <button
            onClick={() => {
              switchRole('farmer');
              setCurrentRoute('farmer');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:text-white rounded-lg hover:bg-white/5 font-medium flex items-center gap-2"
          >
            <Sprout className="w-4 h-4 text-[#10B981]" /> Farmer Portal
          </button>
          <button
            onClick={() => {
              switchRole('buyer');
              setCurrentRoute('buyer');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:text-white rounded-lg hover:bg-white/5 font-medium flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#00B8F0]" /> Buyer Marketplace
          </button>
          <button
            onClick={() => {
              switchRole('admin');
              setCurrentRoute('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:text-white rounded-lg hover:bg-white/5 font-medium flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-amber-400" /> Admin Directorate
          </button>
        </div>
      )}
    </header>
  );
};
