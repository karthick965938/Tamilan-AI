import React, { useState, useEffect } from 'react';
import { AppProvider, ToastProvider, useToast } from './contexts';
import { Sidebar, MainContent, ErrorBoundary, ToastContainer, ApiKeyModal } from './components';
import { GeminiService } from './services';
import { useResponsive } from './hooks';
import './App.css';
import './styles/responsive.css';
import './styles/mobile.css';

// Main app content component
const AppContent: React.FC = () => {
  const responsive = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!responsive.isMobile);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { toasts } = useToast();

  // Check for API key on load
  useEffect(() => {
    const geminiService = GeminiService.getInstance();
    if (!geminiService.hasApiKey()) {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    const geminiService = GeminiService.getInstance();
    geminiService.setApiKey(key);
    setShowApiKeyModal(false);
  };

  // Auto-close sidebar on mobile, auto-open on desktop
  useEffect(() => {
    setIsSidebarOpen(!responsive.isMobile);
  }, [responsive.isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle iOS viewport height issues
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <div className={`app ${responsive.isMobile ? 'app--mobile' : ''} ${responsive.isTouch ? 'app--touch' : ''
      }`}>
      {showApiKeyModal && <ApiKeyModal onSave={handleSaveApiKey} />}
      <div className={`app-layout ${responsive.isMobile ? 'app-layout--mobile' : ''}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        <MainContent
          onToggleSidebar={toggleSidebar}
        />
      </div>
      <ToastContainer toasts={toasts} position="top-right" />
    </div>
  );
};

// Main App component with context providers and error boundary
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;