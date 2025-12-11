import React, { useEffect, useState } from 'react';
import { HistoryService } from '../../services';
import { HistoryItem } from '../../types';
import './HistoryDisplay.css';

export const HistoryDisplay: React.FC = () => {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const history = await HistoryService.getInstance().getAllItems();
            setItems(history);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            try {
                await HistoryService.getInstance().clearHistory();
                setItems([]);
            } catch (error) {
                console.error("Failed to clear history", error);
            }
        }
    };

    const formatFunctionName = (id: string) => {
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) {
        return (
            <div className="history-loader">
                <div className="spinner"></div>
                <p>Loading your creative history...</p>
            </div>
        );
    }

    return (
        <div className="history-display-container">
            <div className="history-header-bar">
                <h2>Project History</h2>
                {items.length > 0 && (
                    <button className="clear-history-button" onClick={clearHistory}>
                        Trash All 🗑️
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="history-empty-state">
                    <span className="empty-icon">📂</span>
                    <h3>No Projects Yet</h3>
                    <p>Start creating amazing content to see your history here.</p>
                </div>
            ) : (
                <div className="history-grid-layout">
                    {items.map((item) => (
                        <div key={item.id} className="history-card-item">
                            <div className="card-header">
                                <h3 className="function-title">{formatFunctionName(item.functionId)}</h3>
                                <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>

                            <div className="card-content">
                                <div className="media-section input-media">
                                    <span className="media-label">Input</span>
                                    <div className="thumbs-row">
                                        {item.inputs.map((input, idx) => (
                                            <div key={idx} className="thumb-wrapper">
                                                <img src={input.data} alt={`Input ${idx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="arrow-divider">↓</div>

                                <div className="media-section output-media">
                                    <span className="media-label">Output</span>
                                    <div className="thumbs-row">
                                        {item.outputs.map((output, idx) => (
                                            <div key={idx} className="thumb-wrapper">
                                                <img src={output.data} alt={`Output ${idx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer-metadata">
                                <div className="meta-row">
                                    <span className="meta-label">Processing Time:</span>
                                    <span className="meta-value">{(item.processingTime / 1000).toFixed(2)}s</span>
                                </div>
                                {Object.entries(item.metadata).map(([key, value]) => {
                                    if (['processingTime', 'timestamp', 'generated', 'functionType'].includes(key)) return null;
                                    return (
                                        <div key={key} className="meta-row">
                                            <span className="meta-label">{formatFunctionName(key)}:</span>
                                            <span className="meta-value">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
