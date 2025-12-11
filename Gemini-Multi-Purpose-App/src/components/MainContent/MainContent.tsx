import React from 'react';
import { useAppState, useResponsive } from '../../hooks';
import { getFunctionalityById } from '../../constants';
import { FunctionalityContainer } from './FunctionalityContainer';
import { Footer } from '../Footer/Footer';
import './MainContent.css';

interface MainContentProps {
  onToggleSidebar: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  onToggleSidebar
}) => {
  const { state } = useAppState();
  const responsive = useResponsive();
  const currentFunctionality = getFunctionalityById(state.currentFunction);

  return (
    <main className={`main-content ${responsive.isMobile ? 'main-content--mobile' : ''} ${responsive.isTouch ? 'main-content--touch' : ''
      }`}>
      <header className="main-header">
        <button
          className={`mobile-menu-toggle ${responsive.isTouch ? 'touch-target' : ''}`}
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          style={{ display: responsive.isMobile ? 'flex' : 'none' }}
        >
          ☰
        </button>
        <div className="header-content">
          {currentFunctionality ? (
            <>
              <span className="functionality-icon">{currentFunctionality.icon}</span>
              <div className="functionality-info">
                <h1>{currentFunctionality.name}</h1>
                <p className="functionality-description">{currentFunctionality.description}</p>
              </div>
            </>
          ) : (
            <h1>Gemini Creative Studio</h1>
          )}
        </div>
      </header>

      <div className="main-body">
        {state.error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{state.error}</span>
          </div>
        )}

        {currentFunctionality ? (
          <FunctionalityContainer
            functionality={currentFunctionality}
          />
        ) : (
          <div className="welcome-message">
            <div className="welcome-content">
              <h2>Welcome to Gemini Creative Studio</h2>
              <p>Select a functionality from the sidebar to get started</p>
              <div className="features-grid">
                <div className="feature-highlight">
                  <span className="feature-icon">💇</span>
                  <h3>Hairstyle Changer</h3>
                  <p>Transform portraits with 9 different hairstyle variations</p>
                </div>
                <div className="feature-highlight">
                  <span className="feature-icon">👗</span>
                  <h3>OOTD Generator</h3>
                  <p>Create realistic outfit combinations</p>
                </div>
                <div className="feature-highlight">
                  <span className="feature-icon">🍔</span>
                  <h3>Food Photography</h3>
                  <p>Generate dramatic promotional food images</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </main>
  );
};