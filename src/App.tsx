/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginView } from "./components/LoginView";
import { DashboardView } from "./components/DashboardView";
import { GeneratorView } from "./components/GeneratorView";
import { HistoryView } from "./components/HistoryView";
import { ClientsView } from "./components/ClientsView";
import { ConfigView } from "./components/ConfigView";
import { ReceiptModal } from "./components/ReceiptModal";
import { Receipt } from "./types";
import {
  TrendingUp,
  FileText,
  Users,
  Settings,
  LogOut,
  UserCheck,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Navigation: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab
}) => {
  const { logout, user } = useApp();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "generator", label: "Emitir Comprobante", icon: PlusCircle },
    { id: "history", label: "Historial", icon: FileText },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "config", label: "Configuración", icon: Settings }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base tracking-tighter">
              I
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900 hidden sm:block">
              ImpulsaNet
            </span>
          </div>

          {/* Core Tabs Navigation */}
          <nav className="flex space-x-1 md:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Status & Log Out */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-150">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-32 font-mono font-medium">{user?.email}</span>
            </div>
            <button
              id="btn-logout"
              onClick={logout}
              title="Cerrar Sesión"
              className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainLayout: React.FC = () => {
  const { loadingData, businessConfig } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-black animate-spin" />
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          Sincronizando con Firebase...
        </span>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onViewChange={setActiveTab} />;
      case "generator":
        return <GeneratorView onReceiptGenerated={setSelectedReceipt} />;
      case "history":
        return <HistoryView onSelectReceipt={setSelectedReceipt} />;
      case "clients":
        return <ClientsView onSelectReceipt={setSelectedReceipt} />;
      case "config":
        return <ConfigView />;
      default:
        return <DashboardView onViewChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* View Wrapper */}
      <main className="flex-1 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Receipt Viewing Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          businessName={businessConfig.businessName}
          whatsapp={businessConfig.whatsapp}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loadingAuth } = useApp();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-black animate-spin" />
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          Verificando credenciales...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
