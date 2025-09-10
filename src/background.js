// Listen for the extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Ensure the tab is an IMDb movie page
  if (tab.url?.includes("imdb.com/title/")) {
    try {
      // Extract the IMDb ID from the URL
      const imdbIdMatch = tab.url?.match(/\/title\/(tt\d+)/);
      if (imdbIdMatch && imdbIdMatch[1]) {
        const imdbId = imdbIdMatch[1];

        // Construct the Letterboxd URL using the IMDb ID
        const letterboxdUrl = `https://letterboxd.com/imdb/${imdbId}/`;

        // Open the Letterboxd page in a new tab
        chrome.tabs.create({ url: letterboxdUrl });
      } else {
        console.error("Could not extract IMDb ID from the URL.");
      }
    } catch (error) {
      console.error("Error processing IMDb page:", error);
    }
  }
});

// Helper function to check if a URL is an IMDb movie page
function isImdbMoviePage(url) {
  return url?.match(/^https:\/\/www\.imdb\.com\/title\/tt\d+/);
}

// Enable or disable the action button based on the tab's URL
function updateActionState(tabId, url) {
  if (isImdbMoviePage(url)) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
}

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateActionState(tabId, changeInfo.url);
  }
});

// Listen for tab activation (when user switches tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateActionState(activeInfo.tabId, tab?.url);
  });
});

// On extension startup, check all tabs
chrome.tabs.query({}, (tabs) => {
  for (const tab of tabs) {
    updateActionState(tab.id, tab.url);
  }
});