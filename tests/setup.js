// Mock Chrome APIs for testing
global.chrome = {
  action: {
    onClicked: {
      addListener: jest.fn()
    },
    enable: jest.fn(),
    disable: jest.fn()
  },
  tabs: {
    create: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    onUpdated: {
      addListener: jest.fn()
    },
    onActivated: {
      addListener: jest.fn()
    }
  }
};

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn()
};
