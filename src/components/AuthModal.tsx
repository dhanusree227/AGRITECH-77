import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sprout, ShoppingCart, ShieldCheck, CheckCircle2, Lock, Mail, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../utils/orderLifecycle';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, switchRole } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('Mandya');
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('10');
  const [businessName, setBusinessName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !termsAccepted) {
      alert('Please accept terms and conditions to proceed.');
      return;
    }
    // Switch active role and close modal
    switchRole(selectedRole);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {isRegister ? 'Create AgriTech Account' : 'Welcome to AgriTech'}
            </h3>
            <p className="text-xs text-emerald-200">
              {isRegister ? 'Select your agricultural role to get started' : 'Sign in to access your customized dashboard'}
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selection Cards */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Choose Account Role
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedRole('farmer')}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedRole === 'farmer'
                  ? 'border-[#10B981] bg-emerald-50 text-[#123D2A] shadow-xs ring-2 ring-[#10B981]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Sprout className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'farmer' ? 'text-[#10B981]' : 'text-slate-400'}`} />
              <div className="text-xs font-bold">Farmer</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Grow & Trade</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('buyer')}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedRole === 'buyer'
                  ? 'border-[#10B981] bg-emerald-50 text-[#123D2A] shadow-xs ring-2 ring-[#10B981]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ShoppingCart className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'buyer' ? 'text-[#10B981]' : 'text-slate-400'}`} />
              <div className="text-xs font-bold">Buyer</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Wholesale & Retail</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedRole === 'admin'
                  ? 'border-[#10B981] bg-emerald-50 text-[#123D2A] shadow-xs ring-2 ring-[#10B981]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ShieldCheck className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'admin' ? 'text-[#10B981]' : 'text-slate-400'}`} />
              <div className="text-xs font-bold">Admin</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Governance</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'farmer'
                      ? 'ramesh.farmer@agritech.org'
                      : selectedRole === 'buyer'
                      ? 'priya.buyer@freshbasket.in'
                      : 'anand.admin@agritech.gov.in'
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role-specific registration fields */}
            {isRegister && selectedRole === 'farmer' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Green Acres Farm"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {isRegister && selectedRole === 'buyer' && (
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Business / Store Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="FreshBasket Agro Logistics"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                />
              </div>
            )}

            {isRegister && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="terms">
                  I agree to AgriTech Terms of Service & Privacy Policy
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#123D2A] text-white rounded-xl text-sm font-bold hover:bg-[#1a553b] transition-colors mt-2 shadow-sm"
            >
              {isRegister ? `Register as ${selectedRole.toUpperCase()}` : `Sign In as ${selectedRole.toUpperCase()}`}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-[#10B981] hover:underline font-semibold"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
