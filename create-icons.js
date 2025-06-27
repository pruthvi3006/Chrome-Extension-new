const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#grad)"/>
  <path d="M30 40h68v8H30v-8zm0 20h68v8H30v-8zm0 20h68v8H30v-8z" fill="white"/>
</svg>`;

// Create a simple PNG-like file (actually SVG with PNG extension for demo)
const pngContent = svgIcon;

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write icon files
fs.writeFileSync(path.join(distDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(distDir, 'icon16.png'), pngContent);
fs.writeFileSync(path.join(distDir, 'icon48.png'), pngContent);
fs.writeFileSync(path.join(distDir, 'icon128.png'), pngContent);

console.log('Icon files created in dist/ directory');
console.log('Note: PNG files are actually SVG files with .png extension for demo purposes');
console.log('For production, replace with actual PNG files of the correct sizes'); 