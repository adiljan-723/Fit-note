const { DIET_GUIDES } = require('../../utils/fitnessData')
const storage = require('../../utils/storage')

function createEmptyForm(date) {
  return {
    date,
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: '',
    water: '0',
    protein: '',
    calories: '',
    note: ''
  }
}

function toNumber(value) {
  return Number(value) || 0
}

function clampPercent(value, target) {
  if (!target) return 0
  return Math.min(100, Math.round((value / target) * 100))
}

function getDietTargets(profile, form) {
  const weight = toNumber(profile.weight) || 70
  const goal = profile.goal || 'muscle'
  const baseCalories = Math.round(weight * 30)
  const proteinMin = Math.round(weight * 1.6)
  const proteinMax = Math.round(weight * (goal === 'fatLoss' ? 2.2 : 2.0))
  const calorieMin = goal === 'fatLoss' ? Math.max(1200, baseCalories - 500) : baseCalories + 200
  const calorieMax = goal === 'fatLoss' ? Math.max(1300, baseCalories - 300) : baseCalories + 300
  const waterTarget = Math.max(2000, Math.round(weight * 35))
  const calories = toNumber(form.calories)
  const protein = toNumber(form.protein)
  const water = toNumber(form.water)

  return {
    baseCalories,
    calorieMin,
    calorieMax,
    proteinMin,
    proteinMax,
    waterTarget,
    calories,
    protein,
    water,
    calorieRange: `${calorieMin}-${calorieMax}`,
    proteinRange: `${proteinMin}-${proteinMax}`,
    caloriePercent: clampPercent(calories, calorieMax),
    proteinPercent: clampPercent(protein, proteinMin),
    waterPercent: clampPercent(water, waterTarget)
  }
}

function getStatus(profile, targets) {
  const goal = profile.goal || 'muscle'
  const tips = []
  let calorieStatus = '待记录'
  let proteinStatus = '待记录'
  let waterStatus = '待记录'

  if (targets.calories > 0) {
    if (targets.calories < targets.calorieMin) {
      calorieStatus = '偏低'
      tips.push(goal === 'fatLoss' ? '今日热量偏低，注意不要长期吃太少，避免影响训练状态。' : '今日热量偏低，增肌期可以加一份主食或牛奶燕麦。')
    } else if (targets.calories > targets.calorieMax) {
      calorieStatus = '偏高'
      tips.push(goal === 'fatLoss' ? '今日热量偏高，晚餐可减少油脂和精制碳水。' : '今日热量偏高，注意控制零食和高油食物。')
    } else {
      calorieStatus = '达标'
    }
  }

  if (targets.protein > 0) {
    if (targets.protein < targets.proteinMin) {
      proteinStatus = '不足'
      tips.push('蛋白质偏低，可补充鸡蛋、鱼虾、鸡胸肉、牛奶或低脂酸奶。')
    } else if (targets.protein > targets.proteinMax) {
      proteinStatus = '偏高'
    } else {
      proteinStatus = '达标'
    }
  }

  if (targets.water > 0) {
    if (targets.water < targets.waterTarget) {
      waterStatus = '未达标'
      tips.push('饮水还没达标，可以分几次补充，不要一次喝太多。')
    } else {
      waterStatus = '达标'
    }
  }

  if (tips.length === 0) {
    tips.push('今日饮食状态不错，继续保持稳定记录。')
  }

  return {
    calorieStatus,
    proteinStatus,
    waterStatus,
    tips
  }
}

Page({
  data: {
    profile: {},
    guide: DIET_GUIDES.muscle,
    form: createEmptyForm(storage.getToday()),
    targets: {},
    status: {},
    records: []
  },

  onShow() {
    const profile = storage.getProfile()
    const date = this.data.form.date || storage.getToday()
    const goal = DIET_GUIDES[profile.goal] ? profile.goal : 'muscle'
    this.setData({
      profile: Object.assign({}, profile, { goal }),
      guide: DIET_GUIDES[goal],
      records: storage.getDietRecords()
    })
    this.loadFormByDate(date)
  },

  loadFormByDate(date) {
    const existed = storage.getDietRecordByDate(date)
    this.setData({
      form: Object.assign(createEmptyForm(date), existed || {})
    }, () => this.updateDietMetrics())
  },

  updateDietMetrics() {
    const targets = getDietTargets(this.data.profile, this.data.form)
    this.setData({
      targets,
      status: getStatus(this.data.profile, targets)
    })
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: event.detail.value
    }, () => this.updateDietMetrics())
  },

  onDateChange(event) {
    this.loadFormByDate(event.detail.value)
  },

  addWater(event) {
    const amount = Number(event.currentTarget.dataset.amount) || 0
    const nextWater = toNumber(this.data.form.water) + amount
    this.setData({
      'form.water': `${nextWater}`
    }, () => this.updateDietMetrics())
  },

  saveRecord() {
    storage.upsertDietRecord(this.data.form)
    this.setData({ records: storage.getDietRecords() })
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  deleteRecord(event) {
    const id = event.currentTarget.dataset.id
    storage.deleteDietRecord(id)
    this.setData({ records: storage.getDietRecords() })
    this.loadFormByDate(this.data.form.date)
    wx.showToast({ title: '已删除', icon: 'success' })
  }
})
