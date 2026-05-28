const { DEFAULT_PROFILE } = require('./fitnessData')

const KEYS = {
  PROFILE: 'fitnote_profile',
  TRAINING: 'fitnote_training_records',
  DIET: 'fitnote_diet_records',
  CHECKINS: 'fitnote_checkins',
  WORKOUT_PLAN: 'fitnote_workout_plan',
  TRAINING_DRAFT: 'fitnote_training_draft',
  CLOUD_USER: 'fitnote_cloud_user',
  CLOUD_SYNC_STATUS: 'fitnote_cloud_sync_status'
}

const COLLECTIONS = {
  PROFILE: 'user_profiles',
  TRAINING: 'training_records',
  DIET: 'diet_records',
  PLANS: 'workout_plans',
  CHECKINS: 'checkins'
}

function getDefaultSyncStatus() {
  return {
    enabled: false,
    syncing: false,
    lastSyncAt: '',
    message: '尚未同步',
    error: ''
  }
}

function getCloudSyncStatus() {
  return Object.assign({}, getDefaultSyncStatus(), wx.getStorageSync(KEYS.CLOUD_SYNC_STATUS) || {})
}

function setCloudSyncStatus(status) {
  const nextStatus = Object.assign({}, getCloudSyncStatus(), status)
  wx.setStorageSync(KEYS.CLOUD_SYNC_STATUS, nextStatus)
  return nextStatus
}

function isCloudReady() {
  return !!(wx.cloud && wx.cloud.database)
}

function getDb() {
  return isCloudReady() ? wx.cloud.database() : null
}

function getCloudUser() {
  return wx.getStorageSync(KEYS.CLOUD_USER) || null
}

function setCloudUser(user) {
  wx.setStorageSync(KEYS.CLOUD_USER, user || null)
  return user || null
}

function withSyncMeta(data) {
  return Object.assign({}, data, {
    syncedAt: new Date().toISOString()
  })
}

function stripCloudFields(item) {
  const next = Object.assign({}, item)
  delete next._id
  delete next._openid
  delete next.syncedAt
  return next
}

function stripListCloudFields(list) {
  return (list || []).map(stripCloudFields)
}

async function callLoginFunction() {
  if (!wx.cloud || !wx.cloud.callFunction) throw new Error('当前环境不支持云函数')
  const result = await wx.cloud.callFunction({ name: 'login' })
  const user = result && result.result ? result.result : null
  if (!user || !user.openid) throw new Error('未获取到云端用户身份')
  setCloudUser(user)
  return user
}

async function getCollectionFirst(collectionName) {
  const db = getDb()
  if (!db) return null
  const result = await db.collection(collectionName).limit(1).get()
  return result.data && result.data.length > 0 ? result.data[0] : null
}

async function upsertSingle(collectionName, data) {
  const db = getDb()
  if (!db) return null
  const existed = await getCollectionFirst(collectionName)
  const payload = withSyncMeta(data || {})
  if (existed && existed._id) {
    await db.collection(collectionName).doc(existed._id).set({ data: payload })
    return existed._id
  }
  const result = await db.collection(collectionName).add({ data: payload })
  return result._id
}

async function replaceCollectionByLocalList(collectionName, list) {
  const db = getDb()
  if (!db) return
  const oldResult = await db.collection(collectionName).limit(1000).get()
  const oldList = oldResult.data || []
  for (let index = 0; index < oldList.length; index += 1) {
    await db.collection(collectionName).doc(oldList[index]._id).remove()
  }
  const localList = list || []
  for (let index = 0; index < localList.length; index += 1) {
    await db.collection(collectionName).add({ data: withSyncMeta(localList[index]) })
  }
}

async function loadCloudDataToLocal() {
  const db = getDb()
  if (!db) return false

  const profileDoc = await getCollectionFirst(COLLECTIONS.PROFILE)
  if (profileDoc) wx.setStorageSync(KEYS.PROFILE, Object.assign({}, DEFAULT_PROFILE, stripCloudFields(profileDoc)))

  const planDoc = await getCollectionFirst(COLLECTIONS.PLANS)
  if (planDoc && planDoc.plans) wx.setStorageSync(KEYS.WORKOUT_PLAN, planDoc.plans)

  const trainingResult = await db.collection(COLLECTIONS.TRAINING).orderBy('createdAt', 'desc').limit(1000).get()
  if (trainingResult.data && trainingResult.data.length > 0) wx.setStorageSync(KEYS.TRAINING, stripListCloudFields(trainingResult.data))

  const dietResult = await db.collection(COLLECTIONS.DIET).orderBy('updatedAt', 'desc').limit(1000).get()
  if (dietResult.data && dietResult.data.length > 0) wx.setStorageSync(KEYS.DIET, stripListCloudFields(dietResult.data))

  const checkinDoc = await getCollectionFirst(COLLECTIONS.CHECKINS)
  if (checkinDoc && Array.isArray(checkinDoc.dates)) wx.setStorageSync(KEYS.CHECKINS, checkinDoc.dates)

  return true
}

async function syncLocalDataToCloud() {
  if (!getDb()) return false
  await upsertSingle(COLLECTIONS.PROFILE, getProfile())
  await upsertSingle(COLLECTIONS.PLANS, { plans: getWorkoutPlanStore() })
  await upsertSingle(COLLECTIONS.CHECKINS, { dates: getCheckins() })
  await replaceCollectionByLocalList(COLLECTIONS.TRAINING, getTrainingRecords())
  await replaceCollectionByLocalList(COLLECTIONS.DIET, getDietRecords())
  return true
}

async function initCloudSync(options) {
  const shouldPullFirst = options && options.pullFirst
  if (!isCloudReady()) {
    setCloudSyncStatus({ enabled: false, syncing: false, message: '当前基础库暂不支持云开发' })
    return null
  }

  setCloudSyncStatus({ enabled: true, syncing: true, message: '正在连接云端', error: '' })
  try {
    const user = await callLoginFunction()
    if (shouldPullFirst) await loadCloudDataToLocal()
    await syncLocalDataToCloud()
    setCloudSyncStatus({
      enabled: true,
      syncing: false,
      lastSyncAt: new Date().toISOString(),
      message: '云端同步已开启',
      error: ''
    })
    return user
  } catch (error) {
    setCloudSyncStatus({
      enabled: false,
      syncing: false,
      message: '云端同步暂不可用，本地记录仍可使用',
      error: error && error.message ? error.message : '同步失败'
    })
    return null
  }
}

function syncAfterLocalChange() {
  if (!getCloudUser() || !isCloudReady()) return
  syncLocalDataToCloud().then(() => {
    setCloudSyncStatus({
      enabled: true,
      syncing: false,
      lastSyncAt: new Date().toISOString(),
      message: '云端同步已更新',
      error: ''
    })
  }).catch(error => {
    setCloudSyncStatus({
      enabled: false,
      syncing: false,
      message: '云端同步失败，本地记录已保存',
      error: error && error.message ? error.message : '同步失败'
    })
  })
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
  const nextProfile = Object.assign({}, getProfile(), profile, { updatedAt: new Date().toISOString() })
  wx.setStorageSync(KEYS.PROFILE, nextProfile)
  syncAfterLocalChange()
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
    syncAfterLocalChange()
    return null
  }
  const nextPlan = Object.assign({}, plan, { goal: targetGoal, updatedAt: new Date().toISOString() })
  store[targetGoal] = nextPlan
  wx.setStorageSync(KEYS.WORKOUT_PLAN, store)
  syncAfterLocalChange()
  return nextPlan
}

function clearWorkoutPlan(goal) {
  const targetGoal = goal || 'muscle'
  const store = getWorkoutPlanStore()
  delete store[targetGoal]
  wx.setStorageSync(KEYS.WORKOUT_PLAN, store)
  syncAfterLocalChange()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  list.unshift(item)
  wx.setStorageSync(KEYS.TRAINING, list)
  syncAfterLocalChange()
  return item
}

function deleteTrainingRecord(id) {
  const list = getTrainingRecords().filter(item => item.id !== id)
  wx.setStorageSync(KEYS.TRAINING, list)
  syncAfterLocalChange()
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
  syncAfterLocalChange()
  return item
}

function deleteDietRecord(id) {
  const list = getDietRecords().filter(item => item.id !== id)
  wx.setStorageSync(KEYS.DIET, list)
  syncAfterLocalChange()
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
    syncAfterLocalChange()
    return false
  }
  list.unshift(today)
  wx.setStorageSync(KEYS.CHECKINS, list)
  syncAfterLocalChange()
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
  toggleTodayCheckin,
  initCloudSync,
  syncLocalDataToCloud,
  loadCloudDataToLocal,
  getCloudUser,
  getCloudSyncStatus
}
