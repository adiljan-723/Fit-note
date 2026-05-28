const { TRAINING_PLANS, DIET_GUIDES } = require('../../utils/fitnessData')
const storage = require('../../utils/storage')

function parseDate(dateStr) {
  return new Date((dateStr || '').replace(/-/g, '/'))
}

function normalizeExercise(exercise) {
  const setsText = `${exercise.sets || '3'}`.indexOf('组') >= 0 ? exercise.sets : `${exercise.sets || '3'}组`
  const repsText = `${exercise.reps || '8-12'}`.indexOf('次') >= 0 || `${exercise.reps || ''}`.indexOf('秒') >= 0 ? exercise.reps : `${exercise.reps || '8-12'}次`
  return Object.assign({}, exercise, {
    setsText,
    repsText,
    restText: exercise.rest || '90秒'
  })
}

function getGeneratedPlanDay(plan, today) {
  if (!plan || !plan.days || plan.days.length === 0) return null
  const exact = plan.days.find(day => day.date === today)
  if (exact) return exact
  const todayDate = parseDate(today)
  return plan.days.find(day => parseDate(day.date) >= todayDate) || plan.days[0]
}

Page({
  data: {
    today: '',
    profile: {},
    goalLabel: '增肌',
    hasProfile: false,
    hasGeneratedPlan: false,
    planTitle: '',
    todayPlan: { exercises: [], totalExercises: 0 },
    dietGuide: {},
    diet: null,
    todayTrainingCount: 0,
    stats: {},
    checked: false,
    checklist: [],
    greetingText: '今天也保持节奏',
    todayProgressText: '0/0',
    todayProgressPercent: 0
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const today = storage.getToday()
    const profile = storage.getProfile()
    const goal = profile.goal || 'muscle'
    const generatedPlan = storage.getWorkoutPlan(goal)
    const staticPlan = TRAINING_PLANS[goal]
    const generatedDay = getGeneratedPlanDay(generatedPlan, today)

    const rawTodayPlan = generatedDay || staticPlan.days[storage.getPlanDayIndex()]
    const todayPlan = this.normalizePlanDay(rawTodayPlan, generatedDay ? 'generated' : 'static')
    const diet = storage.getTodayDietRecord()
    const todayTrainingRecords = storage.getTodayTrainingRecords()
    const checked = storage.isCheckedToday()
    const stats = storage.getTrainingSummary()
    const todayProgress = this.getTodayProgress(todayPlan, todayTrainingRecords)

    this.setData({
      today,
      profile,
      greetingText: this.getGreetingText(profile),
      goalLabel: goal === 'muscle' ? '增肌' : '减脂',
      hasProfile: !!profile.configured,
      hasGeneratedPlan: !!generatedPlan,
      planTitle: generatedPlan ? generatedPlan.title : staticPlan.title,
      todayPlan,
      dietGuide: DIET_GUIDES[goal],
      diet,
      todayTrainingCount: todayTrainingRecords.length,
      todayProgressText: todayProgress.text,
      todayProgressPercent: todayProgress.percent,
      stats,
      checked,
      checklist: [
        { label: '训练记录', done: todayTrainingRecords.length > 0, desc: todayTrainingRecords.length > 0 ? `已记录 ${todayTrainingRecords.length} 个动作` : '还没有记录训练' },
        { label: '饮食记录', done: !!diet, desc: diet ? '今天已记录饮食' : '还没有记录饮食' },
        { label: '今日打卡', done: checked, desc: checked ? '今天已完成打卡' : '坚持从一次打卡开始' }
      ]
    })
  },

  normalizePlanDay(day, source) {
    const exercises = (day.exercises || []).map(normalizeExercise)
    return {
      source,
      date: day.date || this.data.today,
      day: day.day || '今日',
      title: day.title || '自由训练',
      focus: day.focus || '按状态完成训练',
      bodyPart: day.bodyPart || '',
      exercises: exercises.slice(0, 4),
      totalExercises: exercises.length
    }
  },

  getGreetingText(profile) {
    const hour = new Date().getHours()
    const name = profile.nickname || 'Fit Note 用户'
    const timeText = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
    return `${timeText}，${name}`
  },

  getTodayProgress(todayPlan, records) {
    const total = todayPlan.totalExercises || (todayPlan.exercises || []).length || 0
    const doneNames = {}
    ;(records || []).forEach(record => {
      if (record.exercise) doneNames[record.exercise] = true
    })
    const plannedDone = (todayPlan.exercises || []).filter(exercise => doneNames[exercise.name]).length
    const fallbackDone = Object.keys(doneNames).length
    const done = total > 0 ? Math.min(plannedDone || fallbackDone, total) : fallbackDone
    const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
    return {
      text: total > 0 ? `${done}/${total}` : `${done} 个动作`,
      percent
    }
  },

  toggleCheckin() {
    const checked = storage.toggleTodayCheckin()
    this.loadData()
    wx.showToast({
      title: checked ? '打卡成功' : '已取消打卡',
      icon: 'success'
    })
  }
})
