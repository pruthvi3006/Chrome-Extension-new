# Chrome Extension with Draggable Icon and Sidepanel

A modern Chrome extension built with React and TypeScript that provides a draggable icon on every webpage and opens a beautiful sidepanel when clicked.

## Features

- 🎯 **Draggable Icon**: A beautiful, draggable icon that appears on the right side of every webpage
- 📱 **Side Panel**: Modern sidepanel built using Chrome's Side Panel API
- ⚡ **Quick Actions**: Navigate back/forward and refresh pages directly from the panel
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📊 **Page Info**: Display current page title and URL
- 🔧 **TypeScript**: Fully typed for better development experience

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Chrome browser

### Setup

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

### Development mode with hot reload
```bash
npm run dev
```

### Clean build
```bash
npm run clean
npm run build
```

## Usage

1. **Icon Interaction**: 
   - The extension icon appears on the right side of every webpage
   - Click the icon to open the sidepanel
   - Drag the icon vertically to reposition it

2. **Sidepanel Features**:
   - View current page information (title and URL)
   - Use quick action buttons (Refresh, Back, Forward)
   - Explore the feature showcase

## Project Structure

```
├── src/
│   ├── background.ts          # Service worker for extension logic
│   ├── content.tsx            # Content script with draggable icon
│   ├── content.css            # Styles for the draggable icon
│   ├── sidepanel.tsx          # React component for the sidepanel
│   ├── sidepanel.css          # Styles for the sidepanel
│   └── sidepanel.html         # HTML template for sidepanel
├── manifest.json              # Chrome extension manifest
├── package.json               # Dependencies and scripts
├── webpack.config.js          # Webpack configuration
└── tsconfig.json              # TypeScript configuration
```

## Technical Details

### Chrome APIs Used
- `chrome.sidePanel` - For the sidepanel functionality
- `chrome.tabs` - For tab manipulation and information
- `chrome.runtime` - For message passing between components

### Key Features
- **Draggable Icon**: Uses React state and mouse events for smooth dragging
- **Side Panel**: Leverages Chrome's new Side Panel API (Manifest V3)
- **Content Script**: Injects React components into web pages
- **Background Script**: Handles extension-wide logic and messaging

## Browser Compatibility

- Chrome 114+ (for Side Panel API support)
- Other Chromium-based browsers (Edge, Brave, etc.)

## Customization

### Styling
- Modify `src/content.css` to change the draggable icon appearance
- Modify `src/sidepanel.css` to customize the sidepanel design

### Functionality
- Add new features in `src/sidepanel.tsx`
- Extend the background script in `src/background.ts`
- Modify the content script in `src/content.tsx`

## Troubleshooting

### Common Issues

1. **Extension not loading**: Make sure you're using Chrome 114+ and have enabled Developer mode
2. **Sidepanel not opening**: Check that the `sidePanel` permission is included in manifest.json
3. **Icon not appearing**: Verify the content script is properly injected and check browser console for errors

### Debug Mode
- Open Chrome DevTools for the extension background script
- Check the console for any error messages
- Use `chrome://extensions/` to view extension logs

## License

MIT License - feel free to use this project for your own extensions!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ using React, TypeScript, and Chrome Extension APIs 