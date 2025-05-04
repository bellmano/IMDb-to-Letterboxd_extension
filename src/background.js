// Listen for the extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  // Ensure the tab is an IMDb movie page
  if (tab.url && tab.url.includes("imdb.com/title/")) {
    try {
      // Inject content script to extract movie info
      const [movieInfo] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractMovieInfo
      });

      if (movieInfo && movieInfo.result.title) {
        // Format the title for the Letterboxd URL
        const formattedTitle = movieInfo.result.title
          .toLowerCase() // Convert to lowercase
          .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-"); // Replace spaces with hyphens

        // Construct the Letterboxd URL
        const letterboxdUrl = `https://letterboxd.com/film/${formattedTitle}/`;

        // Open the Letterboxd page in a new tab
        chrome.tabs.create({ url: letterboxdUrl });
      }
    } catch (error) {
      console.error("Error executing script:", error);
    }
  }
});

// Function to extract movie information (runs in the content script context)
function extractMovieInfo() {
  let title = '';

  // Get the movie title
  const titleElement = document.querySelector('h1');
  if (titleElement) {
    title = titleElement.textContent.trim();
  }

  if (!title) {
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      title = metaTitle.getAttribute('content').replace(/ - IMDb$/, '');
    }
  }

  return { title };
}