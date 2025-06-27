import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './sidepanel.css';

interface SidepanelProps {}

const Sidepanel: React.FC<SidepanelProps> = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');

  useEffect(() => {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentUrl(tabs[0].url || '');
        setPageTitle(tabs[0].title || '');
      }
    });
  }, []);

  const handleRefresh = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  };

  const handleGoBack = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.goBack(tabs[0].id);
      }
    });
  };

  const handleGoForward = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.goForward(tabs[0].id);
      }
    });
  };

  return (
    <div className="sidepanel">
      <header className="sidepanel-header">
        <h1>Extension Panel</h1>
        <p className="subtitle">Your custom sidepanel</p>
      </header>

      <div className="content-section">
        <h2>Current Page</h2>
        <div className="page-info">
          <div className="info-item">
            <label>Title:</label>
            <span className="truncate">{pageTitle}</span>
          </div>
          <div className="info-item">
            <label>URL:</label>
            <span className="truncate">{currentUrl}</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={handleRefresh} className="action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
          <button onClick={handleGoBack} className="action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>
          <button onClick={handleGoForward} className="action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
            Forward
          </button>
        </div>
      </div>

      <div className="content-section">
        <h2>Features</h2>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-text">
              <h3>Draggable Icon</h3>
              <p>Move the icon anywhere on the page</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div className="feature-text">
              <h3>Side Panel</h3>
              <p>Access your tools without leaving the page</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h3>Quick Actions</h3>
              <p>Navigate and refresh with ease</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="sidepanel-footer">
        <p>Built with React & TypeScript</p>
      </footer>
    </div>
  );
};

// Render the sidepanel
ReactDOM.render(<Sidepanel />, document.getElementById('root')); 