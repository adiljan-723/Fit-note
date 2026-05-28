const { DEFAULT_PROFILE } = require('./fitnessData')

const KEYS = {
  PROFILE: 'fitnote_profile',
  TRAINING: 'fitnote_training_records',
  DIET: 'fitnote_diet_records',
  CHECKINS: 'fitnote_checkins',
  WORKOUT_PLAN: 'fitnote_workout_plan',
  TRAINING_DRAFT: 'fitnote_training_draft'
}

function ensureDefaults() {
  if (!wx.getStorageSync(KEYS.PROFILE)) wx.setStorageSync(KEYS.PROFILE, DEFAULT_PROFILE)
  if (!wx.getStorageSync(KEYS.TRAINING)) wx.setStorageSync(KEYS.TRAINING, [])
  if (!wx.getStorageSync(KEYS.DIET)) wx.setStorageSync(KEYS.DIET, [])
  if (!wx.getStorageSync(KEYS.CHECKINS)) wx.setStorageSync(KEYS.CHECKINS, [])
  if (!wx.getStorageSync(KEYS.WORKOUT_PLAN)) wx.setStorageSync(KEYS.WORKOUT_PLAN, null)
  if (!wx.getStorageSync(KEYS.TRAINING_DRAFT)) wx.setStorageSync(KEYS.TRAINING_DRAFT, null)
}

function pad(num) {
  return num < 10 ? `0${num}` : `${num}`
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getToday() {
  return formatDate(new Date())
}

function getPlanDayIndex() {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

function parseDate(dateStr) {
  return new Date((dateStr || '').replace(/-/g, '/'))
}

function experienceToDuration(experience) {
  if (experience === '入门') return '半年到一年'
  if (experience === '有经验') return '一年以上'
  return '半年以内'
}

function durationToExperience(duration) {
  if (duration === '半年到一年') return '入门'
  if (duration === '一年以上') return '有经验'
  return '新手'
}

function getProfile() {
  const saved = wx.getStorageSync(KEYS.PROFILE) || {}
  const profile = Object.assign({}, DEFAULT_PROFILE, saved)
  if (!saved.trainingDuration) {
    profile.trainingDuration = experienceToDuration(profile.experience)
  }
  profile.experience = durationToExperience(profile.trainingDuration)
  return profile
}

function saveProfile(profile) {
  const nextProfile = Object.assign({}, getProfile(), profile)
  wx.setStorageSync(KEYS.PROFILE, nextProfile)
  return nextProfile
}

function getTrainingRecords() {
  return wx.getStorageSync(KEYS.TRAINING) || []
}

function getWorkoutPlanStore() {
  const saved = wx.getStorageSync(KEYS.WORKOUT_PLAN)
  if (!saved) return {}
  if (saved.days) return { muscle: saved }
  return saved
}

function getWorkoutPlan(goal) {
  const targetGoal = goal || 'muscle'
  const store = getWorkoutPlanStore()
  return store[targetGoal] || null
}

function saveWorkoutPlan(plan, goal) {
  const targetGoal = goal || (plan && plan.goal) || 'muscle'
  const store = getWorkoutPlanStore()
  if (!plan) {
    delete store[targetGoal]
    wx.setStorageSync(KEYS.WORKOUT_PLAN, store)
    return null
  }
  const nextPlan = Object.assign({}, plan, { goal: targetGoal, updatedAt: new Date().toISOString() })
  store[targetGoal] = nextPlan
  wx.setStorageSync(KEYS.WORKOUT_PLAN, store)
  return nextPlan
}

function clearWorkoutPlan(goal) {
  const targetGoal = goal || 'muscle'
  const store = getWorkoutPlanStore()
  delete store[targetGoal]
  wx.setStorageSync(KEYS.WORKOUT_PLAN, store)
}

function saveTrainingDraft(draft) {
  wx.setStorageSync(KEYS.TRAINING_DRAFT, draft)
}

function consumeTrainingDraft() {
  const draft = wx.getStorageSync(KEYS.TRAINING_DRAFT) || null
  wx.setStorageSync(KEYS.TRAINING_DRAFT, null)
  return draft
}

function normalizeGroups(record) {
  if (Array.isArray(record.groups) && record.groups.length > 0) {
    return record.groups.map((group, index) => ({
      id: group.id || `${index + 1}`,
      weight: Number(group.weight) || 0,
      reps: Number(group.reps) || 0
    }))
  }
  const sets = Number(record.sets) || 0
  const groups = []
  for (let index = 0; index < sets; index += 1) {
    groups.push({
      id: `${index + 1}`,
      weight: Number(record.weight) || 0,
      reps: Number(record.reps) || 0
    })
  }
  return groups
}

function calcVolume(record) {
  return normalizeGroups(record).reduce((sum, group) => sum + ((Number(group.weight) || 0) * (Number(group.reps) || 0)), 0)
}

function addTrainingRecord(record) {
  const list = getTrainingRecords()
  const groups = normalizeGroups(record)
  const item = Object.assign({}, record, {
    id: `${Date.now()}`,
    groups,
    sets: groups.length,
    reps: groups.length > 0 ? groups[groups.length - 1].reps : (Number(record.reps) || 0),
    weight: groups.length > 0 ? groups[groups.length - 1].weight : (Number(record.weight) || 0),
    volume: calcVolume(Object.assign({}, record, { groups })),
    createdAt: new Date().toISOString()
  })
  list.unshift(item)
  wx.setStorageSync(KEYS.TRAINING, list)
  return item
}

function deleteTrainingRecord(id) {
  const list = getTrainingRecords().filter(item => item.id !== id)
  wx.setStorageSync(KEYS.TRAINING, list)
  return list
}

function getTodayTrainingRecords() {
  const today = getToday()
  return getTrainingRecords().filter(item => item.date === today)
}

function getLastExerciseRecord(exercise, beforeDate) {
  const targetTime = beforeDate ? parseDate(beforeDate).getTime() : Date.now() + 1
  return getTrainingRecords()
    .filter(item => item.exercise === exercise && parseDate(item.date).getTime() < targetTime)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())[0] || null
}

function getPreviousTrainingDaySummary(beforeDate) {
  const targetTime = beforeDate ? parseDate(beforeDate).getTime() : Date.now() + 1
  const records = getTrainingRecords()
    .filter(item => parseDate(item.date).getTime() < targetTime)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
  if (records.length === 0) return null
  const date = records[0].date
  const dayRecords = records.filter(item => item.date === date)
  return summarizeRecords(dayRecords, date)
}

function getWeekStart(date) {
  const target = new Date(date)
  const day = target.getDay() || 7
  target.setHours(0, 0, 0, 0)
  target.setDate(target.getDate() - day + 1)
  return target
}

function summarizeRecords(records, date) {
  let totalVolume = 0
  let totalSets = 0
  const exerciseMap = {}
  records.forEach(item => {
    const groups = normalizeGroups(item)
    totalSets += groups.length
    totalVolume += Number(item.volume) || calcVolume(item)
    exerciseMap[item.exercise] = true
  })
  return {
    date: date || '',
    actionCount: Object.keys(exerciseMap).length,
    setCount: totalSets,
    volume: totalVolume
  }
}

function getTodayTrainingSummary() {
  return summarizeRecords(getTodayTrainingRecords(), getToday())
}

function getTrainingSummary() {
  const today = getToday()
  const weekStart = getWeekStart(new Date())
  const weekDates = {}
  let todaySets = 0
  let todayVolume = 0
  let totalVolume = 0

  getTrainingRecords().forEach(item => {
    const volume = Number(item.volume) || calcVolume(item)
    totalVolume += volume
    if (item.date === today) {
      todaySets += normalizeGroups(item).length
      todayVolume += volume
    }
    if (parseDate(item.date) >= weekStart) {
      weekDates[item.date] = true
    }
  })

  return {
    todaySets,
    todayVolume,
    weekCount: Object.keys(weekDates).length,
    totalVolume
  }
}

function getDietRecords() {
  return wx.getStorageSync(KEYS.DIET) || []
}

function upsertDietRecord(record) {
  const list = getDietRecords()
  const existedIndex = list.findIndex(item => item.date === record.date)
  const item = Object.assign({}, record, {
    id: existedIndex >= 0 ? list[existedIndex].id : `${Date.now()}`,
    updatedAt: new Date().toISOString()
  })
  if (existedIndex >= 0) list.splice(existedIndex, 1, item)
  else list.unshift(item)
  wx.setStorageSync(KEYS.DIET, list)
  return item
}

function deleteDietRecord(id) {
  const list = getDietRecords().filter(item => item.id !== id)
  wx.setStorageSync(KEYS.DIET, list)
  return list
}

function getDietRecordByDate(date) {
  return getDietRecords().find(item => item.date === date) || null
}

function getTodayDietRecord() {
  return getDietRecordByDate(getToday())
}

function getCheckins() {
  return wx.getStorageSync(KEYS.CHECKINS) || []
}

function isCheckedToday() {
  return getCheckins().indexOf(getToday()) >= 0
}

function toggleTodayCheckin() {
  const today = getToday()
  const list = getCheckins()
  const index = list.indexOf(today)
  if (index >= 0) {
    list.splice(index, 1)
    wx.setStorageSync(KEYS.CHECKINS, list)
    return false
  }
  list.unshift(today)
  wx.setStorageSync(KEYS.CHECKINS, list)
  return true
}

module.exports = {
  ensureDefaults,
  formatDate,
  getToday,
  getPlanDayIndex,
  getProfile,
  saveProfile,
  getTrainingRecords,
  getWorkoutPlan,
  saveWorkoutPlan,
  clearWorkoutPlan,
  saveTrainingDraft,
  consumeTrainingDraft,
  addTrainingRecord,
  deleteTrainingRecord,
  getTodayTrainingRecords,
  getTodayTrainingSummary,
  getPreviousTrainingDaySummary,
  getLastExerciseRecord,
  getTrainingSummary,
  calcVolume,
  normalizeGroups,
  getDietRecords,
  upsertDietRecord,
  deleteDietRecord,
  getDietRecordByDate,
  getTodayDietRecord,
  isCheckedToday,
  toggleTodayCheckin
}
