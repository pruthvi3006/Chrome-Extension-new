import React from "react";
import { createRoot } from "react-dom/client";
import Launcher from "./Launcher";
import './content.css';

// Create container and inject the component
const createIconContainer = () => {
  const container = document.createElement("div");
  container.id = "chrome-extension-icon-container";
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

const init = () => {
  const container = createIconContainer();
  const iconDiv = document.createElement("div");
  iconDiv.style.pointerEvents = "auto";
  container.appendChild(iconDiv);
  const root = createRoot(iconDiv);
  root.render(<Launcher />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
} 