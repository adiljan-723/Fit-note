const { getExerciseCategories, getAllExercises } = require('../../utils/exerciseLibrary')

Page({
  data: {
    keyword: '',
    activeBodyPart: '全部',
    categories: [],
    allExercises: [],
    exercises: [],
    totalCount: 0
  },

  onLoad(options) {
    const targetBodyPart = options && options.bodyPart ? decodeURIComponent(options.bodyPart) : '全部'
    this.loadLibrary(targetBodyPart)
  },

  loadLibrary(targetBodyPart) {
    const allExercises = getAllExercises()
    const categories = [{ bodyPart: '全部', count: allExercises.length, target: '全身动作', focus: '按部位筛选动作，快速查看动作要点。' }].concat(getExerciseCategories())
    const activeBodyPart = categories.some(item => item.bodyPart === targetBodyPart) ? targetBodyPart : '全部'
    this.setData({ categories, allExercises, activeBodyPart }, () => this.filterExercises())
  },

  switchCategory(event) {
    this.setData({ activeBodyPart: event.currentTarget.dataset.bodyPart }, () => this.filterExercises())
  },

  onSearchInput(event) {
    this.setData({ keyword: event.detail.value }, () => this.filterExercises())
  },

  clearSearch() {
    this.setData({ keyword: '' }, () => this.filterExercises())
  },

  filterExercises() {
    const keyword = (this.data.keyword || '').trim()
    const activeBodyPart = this.data.activeBodyPart
    const exercises = this.data.allExercises.filter(item => {
      const matchBodyPart = activeBodyPart === '全部' || item.bodyPart === activeBodyPart
      const matchKeyword = !keyword || item.name.indexOf(keyword) >= 0 || item.bodyPart.indexOf(keyword) >= 0
      return matchBodyPart && matchKeyword
    })
    this.setData({ exercises, totalCount: exercises.length })
  },

  openDetail(event) {
    const name = event.currentTarget.dataset.name
    const bodyPart = event.currentTarget.dataset.bodyPart
    if (!name) return
    wx.navigateTo({
      url: `/pages/exercise-detail/exercise-detail?name=${encodeURIComponent(name)}&bodyPart=${encodeURIComponent(bodyPart || '')}`
    })
  }
})
