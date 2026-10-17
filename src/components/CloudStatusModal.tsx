import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CloudCheck, Shield, Database, Key, RefreshCw, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { repository } from '../firebase/repository';

export const CloudStatusModal: React.FC = () => {
  const { isCloudModalOpen, setIsCloudModalOpen, isFirebaseLive, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<'status' | 'rules' | 'env'>('status');
  const [copied, setCopied] = useState(false);

  if (!isCloudModalOpen) return null;

  const handleResetData = async () => {
    if (window.confirm('Reset all demo crops, listings, and orders back to baseline sample data?')) {
      repository.resetDemoData();
      await refreshData();
      alert('AgriTech platform data reset to initial baseline.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Role-based access control (RBAC)
    function isAuthenticated() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function isAdmin() { return isAuthenticated() && getUserData().role == 'admin'; }
    function isFarmer() { return isAuthenticated() && getUserData().role == 'farmer'; }
    function isBuyer() { return isAuthenticated() && getUserData().role == 'buyer'; }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    match /crops/{cropId} {
      allow read: if isAuthenticated();
      allow write: if (isFarmer() && resource.data.farmerId == request.auth.uid) || isAdmin();
    }
    match /productListings/{listingId} {
      allow read: if true;
      allow write: if (isFarmer() && resource.data.farmerId == request.auth.uid) || isAdmin();
    }
    match /orders/{orderId} {
      allow read, write: if isAuthenticated() && (
        resource.data.buyerId == request.auth.uid ||
        resource.data.farmerId == request.auth.uid ||
        isAdmin()
      );
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#C6FF4A]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Cloud Infrastructure & Security</h3>
              <p className="text-xs text-emerald-200">Firebase Firestore, Authentication, Rules & State</p>
            </div>
          </div>
          <button
            onClick={() => setIsCloudModalOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-[#10B981] text-[#123D2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-[#10B981] text-[#123D2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Firestore Rules
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'env'
                ? 'border-[#10B981] text-[#123D2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Setup Guide (.env)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isFirebaseLive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {isFirebaseLive ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {isFirebaseLive ? 'Firebase Live Connected' : 'Hybrid Local Reactive Storage Active'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed text-slate-600">
                    {isFirebaseLive
                      ? 'The application is securely reading and writing to production Google Cloud Firestore with active rules enforcement.'
                      : 'All actions (adding crops, publishing marketplace listings, orders, state transitions, expenses, audit logs) are persistently saved to browser storage with zero latency. Real-time APIs for Open-Meteo Weather and Mandi Prices are operational.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Authentication</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#10B981]" /> Role-Based Access Control
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Farmer · Buyer · Admin</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Database Layer</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#10B981]" /> Cloud Firestore
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Collections: 8 active</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">AI Intelligence</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#10B981]" /> Google Gemini 2.5 Flash
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Multimodal Vision & Voice</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Meteorology</div>
                  <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <CloudCheck className="w-4 h-4 text-[#10B981]" /> Open-Meteo Integration
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Real-time WMO live data</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                <span className="text-xs text-slate-500">Need to reset demo records?</span>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Seed Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">firestore.rules (Production RBAC)</span>
                <button
                  onClick={() => copyToClipboard(firestoreRulesSnippet)}
                  className="text-xs font-medium text-[#10B981] hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy Rules'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60 leading-relaxed">
                {firestoreRulesSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                To connect to a live Firebase project, set the following environment variables in your deployment environment or project settings:
              </p>
              <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto">
{`VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="my-agritech.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="my-agritech-project"
VITE_FIREBASE_STORAGE_BUCKET="my-agritech.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`}
              </pre>
              <p className="text-slate-500">
                When these variables are detected, AgriTech automatically switches from local storage mode to production Cloud Firestore and Cloud Storage.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsCloudModalOpen(false)}
            className="px-4 py-2 bg-[#123D2A] text-white rounded-lg text-sm font-semibold hover:bg-[#1a553b] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
