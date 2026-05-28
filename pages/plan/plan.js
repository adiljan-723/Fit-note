const { EXERCISE_OPTIONS, TRAINING_PLANS, DIET_GUIDES } = require('../../utils/fitnessData')
const { createPlanFromTemplate, createFlexibleWeekPlan, PLAN_SOURCE_NOTE, getExercisePrescription } = require('../../utils/workoutPlanner')
const storage = require('../../utils/storage')

const bodyParts = Object.keys(EXERCISE_OPTIONS)
const PLAN_OPTIONS = {
  muscle: [
    { label: '三分化（推荐）', type: 'three', desc: '推 / 拉 / 腿，生成连续两个循环' },
    { label: '四分化（推荐）', type: 'four', desc: '胸三头 / 背二头 / 腿臀 / 肩核心' },
    { label: '五分化', type: 'five', desc: '胸 / 背 / 腿 / 肩 / 手臂核心' },
    { label: '我任性', type: 'free', desc: '从今天起一周，自由选择部位和动作' }
  ],
  fatLoss: [
    { label: '力量优先（推荐）', type: 'fatStrength', desc: '力量训练保留肌肉，训练后搭配有氧' },
    { label: '有氧优先（推荐）', type: 'fatCardio', desc: '有氧消耗为主，搭配轻量力量训练' },
    { label: '低冲击新手', type: 'fatLowImpact', desc: '器械和低冲击有氧，更适合减脂新手' },
    { label: '我任性', type: 'free', desc: '从今天起一周，自由选择部位和动作' }
  ]
}

const GOAL_COPY = {
  muscle: {
    label: '增肌',
    desc: '新手更适合跟练计划，入门用户可以半自选，有经验用户更适合自主规划。'
  },
  fatLoss: {
    label: '减脂',
    desc: '力量训练保留肌肉，有氧训练提高消耗，饮食控制配合训练更容易坚持。'
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

function formatSetsText(sets) {
  const text = `${sets || '3'}`
  return text.indexOf('组') >= 0 ? text : `${text}组`
}

function formatRepsText(reps) {
  const text = `${reps || '8-12'}`
  if (text.indexOf('次') >= 0 || text.indexOf('秒') >= 0 || text.indexOf('分钟') >= 0) return text
  return `${text}次`
}

function buildExercise(bodyPart, name, extra) {
  const exerciseOptions = EXERCISE_OPTIONS[bodyPart] || EXERCISE_OPTIONS[bodyParts[0]]
  const exerciseName = name || exerciseOptions[0]
  const exercise = Object.assign({}, getExercisePrescription(bodyPart, exerciseName), extra || {}, {
    bodyPart,
    bodyPartIndex: getBodyPartIndex(bodyPart),
    exerciseOptions,
    exerciseIndex: getExerciseIndex(bodyPart, exerciseName),
    name: exerciseName
  })
  return Object.assign({}, exercise, {
    setsText: formatSetsText(exercise.sets),
    repsText: formatRepsText(exercise.reps),
    restText: exercise.rest || '90秒',
    hasUnsaved: !!exercise.hasUnsaved
  })
}



Page({
  data: {
    activeGoal: 'muscle',
    plan: TRAINING_PLANS.muscle,
    dietGuide: DIET_GUIDES.muscle,
    bodyParts,
    splitOptions: PLAN_OPTIONS.muscle,
    goalLabel: GOAL_COPY.muscle.label,
    goalDesc: GOAL_COPY.muscle.desc,
    sourceNote: PLAN_SOURCE_NOTE,

    showGeneratorDialog: false,
    currentPlan: null,
    hasUnsavedChanges: false
  },

  onShow() {
    const profile = storage.getProfile()
    const goal = profile.goal || 'muscle'
    this.setGoal(goal)
    this.loadGeneratedPlan(goal)
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

  setGoal(goal) {
    const targetGoal = GOAL_COPY[goal] ? goal : 'muscle'
    const copy = GOAL_COPY[targetGoal]
    this.setData({
      activeGoal: targetGoal,
      goalLabel: copy.label,
      goalDesc: copy.desc,
      splitOptions: PLAN_OPTIONS[targetGoal],
      plan: TRAINING_PLANS[targetGoal],
      dietGuide: DIET_GUIDES[targetGoal]
    })
  },

  switchGoal(event) {
    const goal = event.currentTarget.dataset.goal
    this.setGoal(goal)
    this.loadGeneratedPlan(goal)
  },

  loadGeneratedPlan(goal) {
    const targetGoal = goal || this.data.activeGoal
    const savedPlan = storage.getWorkoutPlan(targetGoal)

    this.setData({
      currentPlan: savedPlan ? this.normalizePlan(savedPlan) : null,
      hasUnsavedChanges: false
    })
  },

  normalizePlan(plan) {
    const days = (plan.days || []).map(day => {
      const dayBodyPart = day.bodyPart || bodyParts[0]
      return Object.assign({}, day, {
        bodyPart: dayBodyPart,
        bodyPartIndex: getBodyPartIndex(dayBodyPart),
        exercises: (day.exercises || []).map((exercise, index) => buildExercise(
          exercise.bodyPart || dayBodyPart,
          exercise.name,
          Object.assign({ id: `${day.id || day.date}-${index}` }, exercise)
        ))
      })
    })
    return Object.assign({}, plan, { days, isCustom: plan.mode === 'custom' })
  },


  toPlainPlan(plan) {
    if (!plan) return null
    return Object.assign({}, plan, {
      days: (plan.days || []).map(day => ({
        id: day.id,
        date: day.date,
        title: day.title,
        focus: day.focus,
        bodyPart: day.bodyPart,
        exercises: (day.exercises || []).map(exercise => ({
          id: exercise.id,
          bodyPart: exercise.bodyPart,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          note: exercise.note
        }))
      }))
    })
  },

  saveCurrentPlan() {
    if (!this.data.currentPlan) return
    const currentPlan = Object.assign({}, this.data.currentPlan, {
      goal: this.data.activeGoal,
      days: this.data.currentPlan.days.map(day => Object.assign({}, day, {
        exercises: day.exercises.map(exercise => Object.assign({}, exercise, { hasUnsaved: false }))
      }))
    })
    storage.saveWorkoutPlan(this.toPlainPlan(currentPlan), this.data.activeGoal)
    this.setData({ currentPlan, hasUnsavedChanges: false })
    wx.showToast({ title: '计划已保存', icon: 'success' })
  },



  applyPlan(plan, toastTitle) {
    const currentPlan = this.normalizePlan(Object.assign({}, plan, { goal: this.data.activeGoal }))
    storage.saveWorkoutPlan(this.toPlainPlan(currentPlan), this.data.activeGoal)
    this.setData({ currentPlan, hasUnsavedChanges: false })
    wx.showToast({ title: toastTitle || '已生成', icon: 'success' })
  },


  confirmReplace(callback) {
    if (!this.data.currentPlan) {
      callback()
      return
    }
    wx.showModal({
      title: '替换当前计划？',
      content: '生成新计划会覆盖当前计划，历史训练记录不会删除。',
      confirmText: '替换',
      confirmColor: '#10b981',
      success: res => {
        if (res.confirm) callback()
      }
    })
  },

  openGenerator() {
    this.setData({ showGeneratorDialog: true })
  },

  closeGenerator() {
    this.setData({ showGeneratorDialog: false })
  },

  selectSplit(event) {
    const type = event.currentTarget.dataset.type
    this.setData({ showGeneratorDialog: false })
    this.confirmReplace(() => {
      const today = storage.getToday()
      const plan = type === 'free'
        ? createFlexibleWeekPlan(today, 'free', this.data.activeGoal)
        : createPlanFromTemplate(type, today, type === 'three' ? 2 : 1, this.data.activeGoal)

      this.applyPlan(plan, '计划已生成')
    })
  },

  createOwnPlan() {
    this.confirmReplace(() => {
      this.applyPlan(createFlexibleWeekPlan(storage.getToday(), 'custom', this.data.activeGoal), '已创建自有计划')

    })
  },

  onPlanDayBodyPartChange(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const bodyPartIndex = Number(event.detail.value)
    const bodyPart = bodyParts[bodyPartIndex]
    this.setData({
      [`currentPlan.days[${dayIndex}].bodyPart`]: bodyPart,
      [`currentPlan.days[${dayIndex}].bodyPartIndex`]: bodyPartIndex,
      [`currentPlan.days[${dayIndex}].focus`]: `${bodyPart}专项`,
      hasUnsavedChanges: true
    })
  },

  onExerciseBodyPartChange(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const exerciseIndex = Number(event.currentTarget.dataset.exercise)
    const bodyPartIndex = Number(event.detail.value)
    const bodyPart = bodyParts[bodyPartIndex]
    const exerciseName = EXERCISE_OPTIONS[bodyPart][0]
    const nextExercise = buildExercise(bodyPart, exerciseName, {
      id: this.data.currentPlan.days[dayIndex].exercises[exerciseIndex].id,
      hasUnsaved: true
    })

    this.setData({
      [`currentPlan.days[${dayIndex}].exercises[${exerciseIndex}]`]: nextExercise,
      hasUnsavedChanges: true
    })
  },

  onPlanExerciseChange(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const exerciseIndex = Number(event.currentTarget.dataset.exercise)
    const selectedIndex = Number(event.detail.value)
    const oldExercise = this.data.currentPlan.days[dayIndex].exercises[exerciseIndex]
    const exerciseName = oldExercise.exerciseOptions[selectedIndex]
    const nextExercise = buildExercise(oldExercise.bodyPart, exerciseName, { id: oldExercise.id, hasUnsaved: true })

    this.setData({
      [`currentPlan.days[${dayIndex}].exercises[${exerciseIndex}]`]: nextExercise,
      hasUnsavedChanges: true
    })
  },

  onCustomExerciseFieldInput(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const exerciseIndex = Number(event.currentTarget.dataset.exercise)
    const field = event.currentTarget.dataset.field
    const value = event.detail.value
    const exercise = Object.assign({}, this.data.currentPlan.days[dayIndex].exercises[exerciseIndex], {
      [field]: value,
      hasUnsaved: true
    })
    this.setData({
      [`currentPlan.days[${dayIndex}].exercises[${exerciseIndex}]`]: buildExercise(exercise.bodyPart, exercise.name, exercise),
      hasUnsavedChanges: true
    })
  },

  addExercise(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const day = this.data.currentPlan.days[dayIndex]
    const bodyPart = day.bodyPart || bodyParts[0]
    const exerciseName = EXERCISE_OPTIONS[bodyPart][0]
    const nextExercise = buildExercise(bodyPart, exerciseName, {
      id: `${Date.now()}`,
      hasUnsaved: true
    })
    const exercises = day.exercises.concat(nextExercise)
    this.setData({
      [`currentPlan.days[${dayIndex}].exercises`]: exercises,
      hasUnsavedChanges: true
    })
  },

  saveExercise(event) {
    const dayIndex = Number(event.currentTarget.dataset.day)
    const exerciseIndex = Number(event.currentTarget.dataset.exercise)
    this.setData({
      [`currentPlan.days[${dayIndex}].exercises[${exerciseIndex}].hasUnsaved`]: false
    })
    wx.showToast({ title: '动作已确认', icon: 'success' })
  },

  openExerciseDetail(event) {
    const dataset = event.currentTarget.dataset
    let name = dataset.name || ''
    let bodyPart = dataset.bodyPart || ''

    if (!name && this.data.currentPlan && dataset.day !== undefined && dataset.exercise !== undefined) {
      const day = this.data.currentPlan.days[Number(dataset.day)]
      const exercise = day && day.exercises[Number(dataset.exercise)]
      if (exercise) {
        name = exercise.name
        bodyPart = exercise.bodyPart
      }
    }

    if (!name) return
    wx.navigateTo({
      url: `/pages/exercise-detail/exercise-detail?name=${encodeURIComponent(name)}&bodyPart=${encodeURIComponent(bodyPart || '')}`
    })
  }
})
