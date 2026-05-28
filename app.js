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
    storage.initCloudSync({ pullFirst: true }).then(user => {
      this.globalData.cloudUser = user
      this.globalData.cloudSyncStatus = storage.getCloudSyncStatus()
    })
  },
  globalData: {
    appName: 'Fit Note',
    version: '0.9.0',
    cloudEnvId,
    cloudUser: null,
    cloudSyncStatus: storage.getCloudSyncStatus()
  }
})

