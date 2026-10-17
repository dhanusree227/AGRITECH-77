import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { FarmerModule } from './components/farmer/FarmerModule';
import { BuyerModule } from './components/buyer/BuyerModule';
import { AdminModule } from './components/admin/AdminModule';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CloudStatusModal } from './components/CloudStatusModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { currentRoute } = useApp();

  return (
    <div className="min-h-screen bg-[#F7F9F4] text-[#18251E] flex flex-col font-sans selection:bg-[#10B981] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {currentRoute === 'landing' && <LandingPage />}
        {currentRoute === 'farmer' && <FarmerModule />}
        {currentRoute === 'buyer' && <BuyerModule />}
        {currentRoute === 'admin' && <AdminModule />}
      </main>

      {/* Global Interactive Modals */}
      <VoiceAssistantModal />
      <CloudStatusModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
