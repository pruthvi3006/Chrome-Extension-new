import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './content.css';

interface DraggableIconProps {
  onIconClick: () => void;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ onIconClick }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newY = e.clientY - dragOffset.y;
        // Constrain to window height
        const constrainedY = Math.max(0, Math.min(window.innerHeight - 60, newY));
        setPosition(prev => ({ ...prev, y: constrainedY }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onIconClick();
    }
  };

  return (
    <div
      ref={iconRef}
      className="draggable-icon"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      title="Click to open sidepanel"
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    </div>
  );
};

// Main content script component
const ContentScript: React.FC = () => {
  const handleIconClick = () => {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  };

  return <DraggableIcon onIconClick={handleIconClick} />;
};

// Create container and inject the component
const createIconContainer = () => {
  const container = document.createElement('div');
  container.id = 'chrome-extension-icon-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `;
  document.body.appendChild(container);
  return container;
};

// Initialize the content script
const init = () => {
  const container = createIconContainer();
  ReactDOM.render(<ContentScript />, container);
};

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 