const { getExerciseDetail, getRelatedExercises } = require('../../utils/exerciseLibrary')
const storage = require('../../utils/storage')

Page({
  data: {
    detail: {},
    related: []
  },

  onLoad(options) {
    const name = options && options.name ? decodeURIComponent(options.name) : '杠铃卧推'
    const bodyPart = options && options.bodyPart ? decodeURIComponent(options.bodyPart) : ''
    this.loadDetail(name, bodyPart)
  },

  loadDetail(name, bodyPart) {
    const detail = getExerciseDetail(name, bodyPart)
    const related = getRelatedExercises(detail.name, detail.bodyPart)
    this.setData({ detail, related })
    wx.setNavigationBarTitle({ title: detail.name })
  },

  openRelatedDetail(event) {
    const name = event.currentTarget.dataset.name
    const bodyPart = event.currentTarget.dataset.bodyPart
    if (!name) return
    this.loadDetail(name, bodyPart)
  },

  startRecord() {
    const detail = this.data.detail
    if (!detail.name) return
    storage.saveTrainingDraft({
      date: storage.getToday(),
      bodyPart: detail.bodyPart,
      exercise: detail.name,
      sets: 3,
      reps: '',
      rest: '90秒',
      note: `来自动作库：${detail.name}`
    })
    wx.switchTab({ url: '/pages/training/training' })
  },

  openLibrary() {
    const bodyPart = this.data.detail.bodyPart || '全部'
    wx.navigateTo({ url: `/pages/exercise-library/exercise-library?bodyPart=${encodeURIComponent(bodyPart)}` })
  }
})
