import React, { useEffect, useRef } from 'react';
import { useAppState, useResponsive, useTouchGestures } from '../../hooks';
import { FUNCTIONALITIES } from '../../constants';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { state, setCurrentFunction } = useAppState();
  const responsive = useResponsive();
  const sidebarRef = useRef<HTMLElement>(null);

  const handleFunctionSelect = (functionId: string) => {
    setCurrentFunction(functionId);

    // Auto-close sidebar on mobile after selection
    if (responsive.isMobile && isOpen) {
      onToggle();
    }
  };

  // Handle swipe gestures on mobile
  const { attachGestures } = useTouchGestures({
    onSwipe: (gesture) => {
      if (responsive.isMobile && gesture.direction === 'left' && isOpen) {
        onToggle();
      }
    },
  });

  // Attach touch gestures to sidebar
  useEffect(() => {
    if (responsive.isMobile && sidebarRef.current) {
      const cleanup = attachGestures(sidebarRef.current);
      return cleanup;
    }
  }, [responsive.isMobile, attachGestures]);

  // Handle click outside to close on mobile
  useEffect(() => {
    if (!responsive.isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [responsive.isMobile, isOpen, onToggle]);

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'} ${responsive.isMobile ? 'sidebar--mobile' : ''
        } ${responsive.isTouch ? 'sidebar--touch' : ''}`}
    >
      <div className="sidebar-header">
        <button
          className="sidebar-toggle sidebar-toggle-top"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '←' : '→'}
        </button>
        <div className="sidebar-header-content">
          <img src="/logo.png" alt="Gemini Creative Studio" className="sidebar-logo" />
          <h2>Gemini Creative Studio</h2>
        </div>

      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {FUNCTIONALITIES.map((functionality) => (
            <li key={functionality.id} className="nav-item">
              <button
                className={`nav-button ${state.currentFunction === functionality.id ? 'nav-button--active' : ''
                  }`}
                onClick={() => handleFunctionSelect(functionality.id)}
                title={functionality.name}
              >
                <span className="nav-icon">{functionality.icon}</span>
                <span className="nav-text">{functionality.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>


    </aside>
  );
};