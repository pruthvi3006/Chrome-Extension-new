// Background service worker for the Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    console.log('DBG open sidepanel');
    // Open the side panel only if windowId is defined
    const windowId = sender.tab?.windowId;
    if (typeof windowId === 'number') {
      console.log('open sidepanel', windowId);
      chrome.sidePanel.open({ windowId });
      sendResponse({ success: true });
    } else {
      // Optionally, get the current window and open the side panel there
      chrome.windows.getCurrent({}, (win) => {
        if (win && typeof win.id === 'number') {
          console.log('open sidepanel', win.id);  
          chrome.sidePanel.open({ windowId: win.id });
          sendResponse({ success: true });
        } else {
          console.log('No valid windowId found.');
          sendResponse({ success: false, error: 'No valid windowId found.' });
        }
      });
    }
    return true; // Keep the message channel open for async response
  }
  return false;
});

// Set up side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); 