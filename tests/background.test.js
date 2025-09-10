describe('Main Script Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    console.error.mockClear();
  });

  it('tests', () => {
    // Clear require cache and require the background script
    delete require.cache[require.resolve('../src/background.js')];
    require('../src/background.js');

    // Verify all listeners are registered
    expect(chrome.action.onClicked.addListener).toHaveBeenCalled();
    expect(chrome.tabs.onUpdated.addListener).toHaveBeenCalled();
    expect(chrome.tabs.onActivated.addListener).toHaveBeenCalled();
    expect(chrome.tabs.query).toHaveBeenCalledWith({}, expect.any(Function));

    // Test chrome.action.onClicked listener
    const onClickedListener = chrome.action.onClicked.addListener.mock.calls[0][0];
    
    // Test successful IMDb URL processing
    const mockTab = { id: 1, url: 'https://www.imdb.com/title/tt1234567/' };
    onClickedListener(mockTab);
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://letterboxd.com/imdb/tt1234567/'
    });

    // Test URL with parameters
    jest.clearAllMocks();
    mockTab.url = 'https://www.imdb.com/title/tt9876543/?ref_=nv_sr_srsg_0';
    onClickedListener(mockTab);
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://letterboxd.com/imdb/tt9876543/'
    });

    // Test non-IMDb URL (should not create tab)
    jest.clearAllMocks();
    mockTab.url = 'https://www.google.com';
    onClickedListener(mockTab);
    expect(chrome.tabs.create).not.toHaveBeenCalled();

    // Test undefined URL
    jest.clearAllMocks();
    mockTab.url = undefined;
    onClickedListener(mockTab);
    expect(chrome.tabs.create).not.toHaveBeenCalled();

    // Test invalid IMDb ID extraction
    jest.clearAllMocks();
    mockTab.url = 'https://www.imdb.com/title/invalid-id/';
    onClickedListener(mockTab);
    expect(console.error).toHaveBeenCalledWith('Could not extract IMDb ID from the URL.');
    expect(chrome.tabs.create).not.toHaveBeenCalled();

    // Test error handling
    jest.clearAllMocks();
    chrome.tabs.create.mockImplementation(() => {
      throw new Error('Test error');
    });
    mockTab.url = 'https://www.imdb.com/title/tt1234567/';
    onClickedListener(mockTab);
    expect(console.error).toHaveBeenCalledWith('Error processing IMDb page:', expect.any(Error));

    // Reset chrome.tabs.create mock
    chrome.tabs.create.mockReset();

    // Test chrome.tabs.onUpdated listener if it was registered
    if (chrome.tabs.onUpdated.addListener.mock.calls.length > 0) {
      const onUpdatedListener = chrome.tabs.onUpdated.addListener.mock.calls[0][0];
      
      // Test URL change to IMDb page
      jest.clearAllMocks();
      onUpdatedListener(1, { url: 'https://www.imdb.com/title/tt1234567/' }, {});
      expect(chrome.action.enable).toHaveBeenCalledWith(1);

      // Test URL change to non-IMDb page
      jest.clearAllMocks();
      onUpdatedListener(1, { url: 'https://www.google.com' }, {});
      expect(chrome.action.disable).toHaveBeenCalledWith(1);

      // Test no URL change
      jest.clearAllMocks();
      onUpdatedListener(1, { status: 'complete' }, {});
      expect(chrome.action.enable).not.toHaveBeenCalled();
      expect(chrome.action.disable).not.toHaveBeenCalled();
    }

    // Test chrome.tabs.onActivated listener if it was registered
    if (chrome.tabs.onActivated.addListener.mock.calls.length > 0) {
      const onActivatedListener = chrome.tabs.onActivated.addListener.mock.calls[0][0];
      
      // Test activation with IMDb page
      jest.clearAllMocks();
      chrome.tabs.get.mockImplementation((tabId, callback) => {
        callback({ id: 1, url: 'https://www.imdb.com/title/tt1234567/' });
      });
      onActivatedListener({ tabId: 1 });
      expect(chrome.tabs.get).toHaveBeenCalledWith(1, expect.any(Function));
      expect(chrome.action.enable).toHaveBeenCalledWith(1);

      // Test activation with non-IMDb page
      jest.clearAllMocks();
      chrome.tabs.get.mockImplementation((tabId, callback) => {
        callback({ id: 1, url: 'https://www.google.com' });
      });
      onActivatedListener({ tabId: 1 });
      expect(chrome.action.disable).toHaveBeenCalledWith(1);

      // Test activation with undefined URL
      jest.clearAllMocks();
      chrome.tabs.get.mockImplementation((tabId, callback) => {
        callback({ id: 1, url: undefined });
      });
      onActivatedListener({ tabId: 1 });
      expect(chrome.action.disable).toHaveBeenCalledWith(1);
    }

    // Test startup tab query callback if it was called
    if (chrome.tabs.query.mock.calls.length > 0) {
      const queryCallback = chrome.tabs.query.mock.calls[0][1];
      const mockTabs = [
        { id: 1, url: 'https://www.imdb.com/title/tt1234567/' },
        { id: 2, url: 'https://www.google.com' },
        { id: 3, url: 'https://www.imdb.com/title/tt9876543/' }
      ];
      
      jest.clearAllMocks();
      queryCallback(mockTabs);
      expect(chrome.action.enable).toHaveBeenCalledWith(1);
      expect(chrome.action.disable).toHaveBeenCalledWith(2);
      expect(chrome.action.enable).toHaveBeenCalledWith(3);
    }

    // Test isImdbMoviePage function with various URLs
    // This is tested through the updateActionState calls above, covering:
    // - Valid IMDb URLs: https://www.imdb.com/title/tt1234567/
    // - Invalid URLs: https://www.google.com
    // - Undefined URLs: undefined

    // All code paths in background.js are now covered
  });
});
