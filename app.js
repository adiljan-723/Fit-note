const storage = require('./utils/storage')

App({
  onLaunch() {
    storage.ensureDefaults()
  },
  globalData: {
    appName: 'Fit Note',
    version: '0.9.1',
    storageMode: 'local'
  }
})

