import React, { useState, useEffect } from 'react';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Please enter a valid API key');
            return;
        }
        if (!apiKey.startsWith('AIza')) {
            setError('Invalid API key format. Should start with AIza.');
            return;
        }
        onSave(apiKey);
    };

    // Disable context menu
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="api-key-modal-overlay">
            <div className="api-key-modal">
                <div className="modal-header">
                    <a href="https://tamilanai.com" target="_blank" rel="noopener noreferrer" className="modal-logo-link">
                        <img src="/logo.png" alt="Gemini Creative Studio" className="modal-logo" />
                    </a>
                    <h2>Welcome to Gemini Studio</h2>
                    <p>Please enter your API Key to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="api-key-form">
                    <div className="form-group">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setError('');
                            }}
                            placeholder="Paste your Gemini API key here"
                            className={`api-key-input ${error ? 'input-error' : ''}`}
                            autoFocus
                        />
                        {error && <div className="error-message">⚠️ {error}</div>}
                    </div>

                    <button type="submit" className="submit-button">
                        Launch Studio 🚀
                    </button>
                </form>

                <div className="modal-footer">
                    <p>Don't have an API key?</p>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="get-key-link"
                    >
                        Get one for free from Google AI Studio
                    </a>
                    <div className="security-note">
                        <span className="security-icon">🔒</span>
                        <span>Your key is stored locally in your browser session only.</span>
                    </div>

                    <div className="branding-footer">
                        Developed by <a href="https://www.linkedin.com/in/karthick-nagarajan-44800710b/" target="_blank" rel="noopener noreferrer">Karthick</a> | Powered by <a href="https://tamilanai.com" target="_blank" rel="noopener noreferrer">TamilanAI.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
