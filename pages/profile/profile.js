const storage = require('../../utils/storage')

const genderOptions = ['男', '女', '暂不填写']
const goalOptions = [
  { label: '增肌', value: 'muscle' },
  { label: '减脂', value: 'fatLoss' }
]
const dayOptions = [2, 3, 4, 5, 6]
const durationOptions = [
  { label: '半年以内', experience: '新手' },
  { label: '半年到一年', experience: '入门' },
  { label: '一年以上', experience: '有经验' }
]

Page({
  data: {
    form: {},
    genderOptions,
    goalLabels: goalOptions.map(item => item.label),
    dayLabels: dayOptions.map(item => `每周 ${item} 天`),
    durationLabels: durationOptions.map(item => item.label),
    version: '0.9.1',
    storageModeText: '本地缓存稳定运行',

    genderIndex: 0,

    goalIndex: 0,
    dayIndex: 2,
    durationIndex: 0
  },

  onShow() {
    this.loadProfile()
  },

  loadProfile() {
    const profile = Object.assign({}, storage.getProfile())
    if (!goalOptions.some(item => item.value === profile.goal)) profile.goal = 'muscle'
    const goalIndex = Math.max(0, goalOptions.findIndex(item => item.value === profile.goal))
    const dayIndex = Math.max(0, dayOptions.findIndex(item => item === Number(profile.daysPerWeek)))
    const genderIndex = Math.max(0, genderOptions.indexOf(profile.gender))
    const durationIndex = this.getDurationIndex(profile)

    this.setData({
      form: profile,
      genderIndex,
      goalIndex,
      dayIndex,
      durationIndex
    })
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: event.detail.value
    })
  },

  onGenderChange(event) {
    const index = Number(event.detail.value)
    this.setData({ genderIndex: index, 'form.gender': genderOptions[index] })
  },

  onGoalChange(event) {
    const index = Number(event.detail.value)
    this.setData({ goalIndex: index, 'form.goal': goalOptions[index].value })
  },

  onDayChange(event) {
    const index = Number(event.detail.value)
    this.setData({ dayIndex: index, 'form.daysPerWeek': dayOptions[index] })
  },

  getDurationIndex(profile) {
    const byDuration = durationOptions.findIndex(item => item.label === profile.trainingDuration)
    if (byDuration >= 0) return byDuration
    const byExperience = durationOptions.findIndex(item => item.experience === profile.experience)
    return byExperience >= 0 ? byExperience : 0
  },

  onDurationChange(event) {
    const index = Number(event.detail.value)
    const selected = durationOptions[index]
    this.setData({
      durationIndex: index,
      'form.trainingDuration': selected.label,
      'form.experience': selected.experience
    })
  },

  saveProfile() {
    storage.saveProfile(Object.assign({}, this.data.form, { configured: true }))
    wx.showToast({ title: '已保存', icon: 'success' })
  }
})

