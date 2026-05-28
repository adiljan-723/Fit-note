const { EXERCISE_OPTIONS } = require('../../utils/fitnessData')
const storage = require('../../utils/storage')

const bodyParts = Object.keys(EXERCISE_OPTIONS)

function createGroup(weight, reps) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    weight: weight === undefined ? '' : `${weight}`,
    reps: reps === undefined ? '' : `${reps}`
  }
}

function createDefaultRecord() {
  return {
    date: storage.getToday(),
    bodyPart: bodyParts[0],
    exercise: EXERCISE_OPTIONS[bodyParts[0]][0],
    note: '',
    rest: '90秒'
  }
}

function getBodyPartIndex(bodyPart) {
  const index = bodyParts.indexOf(bodyPart)
  return index >= 0 ? index : 0
}

function getExerciseIndex(bodyPart, exercise) {
  const list = EXERCISE_OPTIONS[bodyPart] || EXERCISE_OPTIONS[bodyParts[0]]
  const index = list.indexOf(exercise)
  return index >= 0 ? index : 0
}

function parseRestSeconds(rest) {
  const text = `${rest || '90秒'}`
  const matched = text.match(/\d+/)
  if (!matched) return 90
  const value = Number(matched[0])
  return text.indexOf('分钟') >= 0 ? value * 60 : value
}

Page({
  data: {
    bodyParts,
    bodyPartIndex: 0,
    exerciseList: EXERCISE_OPTIONS[bodyParts[0]],
    exerciseIndex: 0,
    record: createDefaultRecord(),
    groups: [createGroup()],
    records: [],
    volumePreview: 0,
    summary: {},
    todaySummary: {},
    previousSummary: null,
    compareText: '暂无上次训练对比',
    lastExerciseRecord: null,
    restSeconds: 90,
    restLeft: 90,
    restRunning: false,
    restText: '01:30'
  },

  onShow() {
    this.applyDraft()
    this.loadRecords()
    this.updatePreview()
    this.updateRestFromRecord()
  },

  onUnload() {
    this.clearTimer()
  },

  applyDraft() {
    const draft = storage.consumeTrainingDraft()
    if (!draft) return
    const bodyPart = EXERCISE_OPTIONS[draft.bodyPart] ? draft.bodyPart : bodyParts[0]
    const bodyPartIndex = getBodyPartIndex(bodyPart)
    const exerciseList = EXERCISE_OPTIONS[bodyPart] || EXERCISE_OPTIONS[bodyParts[0]]
    const exercise = draft.exercise || exerciseList[0]
    const plannedSets = Number(draft.sets) || 1
    const plannedReps = Number(draft.reps) || ''
    const groups = []
    for (let index = 0; index < plannedSets; index += 1) {
      groups.push(createGroup('', plannedReps))
    }
    this.setData({
      bodyPartIndex,
      exerciseList,
      exerciseIndex: getExerciseIndex(bodyPart, exercise),
      record: Object.assign({}, this.data.record, draft, { bodyPart, exercise, rest: draft.rest || this.data.record.rest }),
      groups: groups.length > 0 ? groups : [createGroup()]
    })
  },

  safeTapStart(event) {
    const touch = event.touches && event.touches[0]
    if (!touch) return
    this.tapGuard = { x: touch.clientX, y: touch.clientY, moved: false }
  },

  safeTapMove(event) {
    const touch = event.touches && event.touches[0]
    if (!touch || !this.tapGuard) return
    const xMoved = Math.abs(touch.clientX - this.tapGuard.x)
    const yMoved = Math.abs(touch.clientY - this.tapGuard.y)
    if (xMoved > 12 || yMoved > 12) this.tapGuard.moved = true
  },

  isSafeTap() {
    return !this.tapGuard || !this.tapGuard.moved
  },

  handleSafeAction(event) {
    if (!this.isSafeTap()) return
    const action = event.currentTarget.dataset.action
    if (action && typeof this[action] === 'function') this[action](event)
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [`record.${field}`]: event.detail.value
    }, () => {
      this.updatePreview()
      if (field === 'rest') this.updateRestFromRecord()
    })
  },

  onDateChange(event) {
    this.setData({
      'record.date': event.detail.value
    }, () => this.loadRecords())
  },

  onBodyPartChange(event) {
    const index = Number(event.detail.value)
    const bodyPart = bodyParts[index]
    const exerciseList = EXERCISE_OPTIONS[bodyPart]
    this.setData({
      bodyPartIndex: index,
      exerciseIndex: 0,
      exerciseList,
      'record.bodyPart': bodyPart,
      'record.exercise': exerciseList[0]
    }, () => {
      this.loadLastExerciseRecord()
      this.updatePreview()
    })
  },

  onExerciseChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      exerciseIndex: index,
      'record.exercise': this.data.exerciseList[index]
    }, () => {
      this.loadLastExerciseRecord()
      this.updatePreview()
    })
  },

  onGroupInput(event) {
    const index = Number(event.currentTarget.dataset.index)
    const field = event.currentTarget.dataset.field
    this.setData({
      [`groups[${index}].${field}`]: event.detail.value
    }, () => this.updatePreview())
  },

  addGroup() {
    const last = this.data.groups[this.data.groups.length - 1] || {}
    const groups = this.data.groups.concat(createGroup(last.weight || '', last.reps || ''))
    this.setData({ groups }, () => this.updatePreview())
  },

  deleteGroup(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (this.data.groups.length <= 1) {
      wx.showToast({ title: '至少保留一组', icon: 'none' })
      return
    }
    const groups = this.data.groups.filter((_, itemIndex) => itemIndex !== index)
    this.setData({ groups }, () => this.updatePreview())
  },

  copyPreviousGroup(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (index <= 0) {
      wx.showToast({ title: '第一组没有上一组', icon: 'none' })
      return
    }
    const prev = this.data.groups[index - 1]
    this.setData({
      [`groups[${index}].weight`]: prev.weight,
      [`groups[${index}].reps`]: prev.reps
    }, () => this.updatePreview())
  },

  copyLastTraining() {
    const last = this.data.lastExerciseRecord
    if (!last) {
      wx.showToast({ title: '暂无上次记录', icon: 'none' })
      return
    }
    const groups = storage.normalizeGroups(last).map(group => createGroup(group.weight, group.reps))
    this.setData({ groups }, () => this.updatePreview())
    wx.showToast({ title: '已复制上次', icon: 'success' })
  },

  updatePreview() {
    this.setData({
      volumePreview: storage.calcVolume(Object.assign({}, this.data.record, { groups: this.data.groups }))
    })
  },

  loadLastExerciseRecord() {
    const lastExerciseRecord = storage.getLastExerciseRecord(this.data.record.exercise, this.data.record.date)
    this.setData({ lastExerciseRecord })
  },

  loadRecords() {
    const todaySummary = storage.getTodayTrainingSummary()
    const previousSummary = storage.getPreviousTrainingDaySummary(this.data.record.date)
    const diff = previousSummary ? todaySummary.volume - previousSummary.volume : 0
    this.setData({
      records: storage.getTrainingRecords(),
      summary: storage.getTrainingSummary(),
      todaySummary,
      previousSummary,
      compareText: previousSummary ? `${diff >= 0 ? '+' : ''}${diff}kg` : '暂无上次训练对比'
    }, () => this.loadLastExerciseRecord())
  },

  saveRecord() {
    const record = this.data.record
    const validGroups = this.data.groups
      .map(group => ({ weight: Number(group.weight) || 0, reps: Number(group.reps) || 0 }))
      .filter(group => group.reps > 0)

    if (!record.exercise || validGroups.length === 0) {
      wx.showToast({ title: '请至少填写一组次数', icon: 'none' })
      return
    }

    storage.addTrainingRecord({
      date: record.date,
      bodyPart: record.bodyPart,
      exercise: record.exercise,
      groups: validGroups,
      rest: record.rest,
      note: record.note
    })

    this.setData({
      groups: [createGroup()],
      record: Object.assign({}, record, { note: '' })
    }, () => this.updatePreview())
    this.loadRecords()
    wx.showToast({ title: '已记录', icon: 'success' })
  },

  deleteRecord(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录？',
      content: '确认删除这条训练记录吗？',
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: res => {
        if (!res.confirm) return
        storage.deleteTrainingRecord(id)
        this.loadRecords()
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  updateRestFromRecord() {
    const restSeconds = parseRestSeconds(this.data.record.rest)
    this.setData({
      restSeconds,
      restLeft: restSeconds,
      restText: this.formatRestText(restSeconds)
    })
  },

  formatRestText(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
  },

  clearTimer() {
    if (this.restTimer) {
      clearInterval(this.restTimer)
      this.restTimer = null
    }
  },

  startRestTimer() {
    this.clearTimer()
    this.setData({ restRunning: true })
    this.restTimer = setInterval(() => {
      const next = this.data.restLeft - 1
      if (next <= 0) {
        this.clearTimer()
        this.setData({ restLeft: 0, restText: '00:00', restRunning: false })
        wx.vibrateShort && wx.vibrateShort({ type: 'heavy' })
        wx.showToast({ title: '休息结束', icon: 'success' })
        return
      }
      this.setData({ restLeft: next, restText: this.formatRestText(next) })
    }, 1000)
  },

  skipRestTimer() {
    this.clearTimer()
    this.updateRestFromRecord()
    this.setData({ restRunning: false })
  },

  openExerciseDetail(event) {
    const name = event.currentTarget.dataset.exercise || this.data.record.exercise
    const bodyPart = event.currentTarget.dataset.bodyPart || this.data.record.bodyPart
    if (!name) return
    wx.navigateTo({
      url: `/pages/exercise-detail/exercise-detail?name=${encodeURIComponent(name)}&bodyPart=${encodeURIComponent(bodyPart || '')}`
    })
  }
})
