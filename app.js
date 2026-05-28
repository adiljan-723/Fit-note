const storage = require('./utils/storage')

const cloudEnvId = 'ai-native-d2g6w34udacbb193d'

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: cloudEnvId,
        traceUser: true
      })
    }
    storage.ensureDefaults()
  },
  globalData: {
    appName: 'Fit Note',
    version: '0.8.0',
    cloudEnvId
  }
})

