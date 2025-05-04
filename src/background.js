// Listen for the extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Ensure the tab is an IMDb movie page
  if (tab.url && tab.url.includes("imdb.com/title/")) {
    try {
      // Extract the IMDb ID from the URL
      const imdbIdMatch = tab.url.match(/\/title\/(tt\d+)/);
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