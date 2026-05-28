const { TRAINING_PLANS } = require('../../utils/fitnessData')
const storage = require('../../utils/storage')

function parseDate(dateStr) {
  return new Date((dateStr || '').replace(/-/g, '/'))
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

function parseFirstNumber(value, fallback) {
  const matched = `${value || ''}`.match(/\d+/)
  return matched ? matched[0] : fallback
}

function getGeneratedPlanDay(plan, today) {
  if (!plan || !plan.days || plan.days.length === 0) return null
  const exact = plan.days.find(day => day.date === today)
  if (exact) return exact
  const todayDate = parseDate(today)
  return plan.days.find(day => parseDate(day.date) >= todayDate) || plan.days[0]
}

function normalizeExercise(exercise, records) {
  const name = exercise.name || '自定义动作'
  const matchedRecords = records.filter(record => record.exercise === name)
  return Object.assign({}, exercise, {
    name,
    bodyPart: exercise.bodyPart || '胸部',
    setsText: formatSetsText(exercise.sets),
    repsText: formatRepsText(exercise.reps),
    restText: exercise.rest || '90秒',
    done: matchedRecords.length > 0,
    recordCount: matchedRecords.length
  })
}

Page({
  data: {
    today: '',
    goalLabel: '增肌',
    planTitle: '',
    planSource: 'static',
    todayPlan: {},
    exercises: [],
    doneCount: 0,
    totalCount: 0,
    progressText: '0/0'
  },

  onShow() {
    this.loadTodayWorkout()
  },

  loadTodayWorkout() {
    const today = storage.getToday()
    const profile = storage.getProfile()
    const goal = profile.goal || 'muscle'
    const staticPlan = TRAINING_PLANS[goal]
    const generatedPlan = storage.getWorkoutPlan(goal)
    const generatedDay = getGeneratedPlanDay(generatedPlan, today)
    const rawPlan = generatedDay || staticPlan.days[storage.getPlanDayIndex()]
    const records = storage.getTodayTrainingRecords()
    const exercises = (rawPlan.exercises || []).map(exercise => normalizeExercise(exercise, records))
    const doneCount = exercises.filter(item => item.done).length

    this.setData({
      today,
      goalLabel: goal === 'muscle' ? '增肌' : '减脂',
      planTitle: generatedPlan ? generatedPlan.title : staticPlan.title,
      planSource: generatedDay ? 'generated' : 'static',
      todayPlan: {
        title: rawPlan.title || '今日训练',
        focus: rawPlan.focus || '按状态完成训练',
        bodyPart: rawPlan.bodyPart || ''
      },
      exercises,
      doneCount,
      totalCount: exercises.length,
      progressText: `${doneCount}/${exercises.length}`
    })
  },

  recordExercise(event) {
    const index = Number(event.currentTarget.dataset.index)
    const exercise = this.data.exercises[index]
    if (!exercise) return

    storage.saveTrainingDraft({
      date: this.data.today,
      bodyPart: exercise.bodyPart,
      exercise: exercise.name,
      sets: parseFirstNumber(exercise.sets, '3'),
      reps: parseFirstNumber(exercise.reps, ''),
      note: `${this.data.todayPlan.title || ''} ${exercise.note || ''}`.trim()
    })

    wx.switchTab({ url: '/pages/training/training' })
  },

  openExerciseDetail(event) {
    const index = Number(event.currentTarget.dataset.index)
    const exercise = this.data.exercises[index]
    if (!exercise) return
    wx.navigateTo({
      url: `/pages/exercise-detail/exercise-detail?name=${encodeURIComponent(exercise.name)}&bodyPart=${encodeURIComponent(exercise.bodyPart || '')}`
    })
  }
})
