const { EXERCISE_OPTIONS } = require('./fitnessData')

const BODY_PART_INFO = {
  胸部: {
    target: '胸大肌、肱三头肌、三角肌前束',
    focus: '推起时保持胸部发力，肩胛稳定，不追求盲目大重量。'
  },
  背部: {
    target: '背阔肌、菱形肌、斜方肌、肱二头肌',
    focus: '先稳定肩胛，再用手肘带动动作，减少手臂代偿。'
  },
  腿臀: {
    target: '股四头肌、腘绳肌、臀大肌、小腿',
    focus: '保持核心收紧和膝盖方向稳定，动作幅度优先于重量。'
  },
  肩部: {
    target: '三角肌前束、中束、后束和肩袖稳定肌群',
    focus: '小重量控制轨迹，避免耸肩和腰部代偿。'
  },
  手臂: {
    target: '肱二头肌、肱三头肌、前臂',
    focus: '固定肘部位置，控制离心，不用身体甩动。'
  },
  核心: {
    target: '腹直肌、腹横肌、腹斜肌、下背稳定肌群',
    focus: '保持呼吸和躯干稳定，避免脖子或腰部代偿。'
  },
  有氧: {
    target: '心肺耐力、下肢耐力和基础消耗',
    focus: '选择能持续完成的强度，优先稳定呼吸和安全姿势。'
  }
}

const SPECIAL_BODY_PARTS = {
  全身拉伸: '核心',
  跑步机快走: '有氧',
  轻松散步: '有氧',
  薄弱部位复练: '胸部'
}

const CORE_MEDIA_PLACEHOLDERS = {
  杠铃卧推: '/assets/exercises/barbell-bench-press.png',
  高位下拉: '/assets/exercises/lat-pulldown.png',
  深蹲: '/assets/exercises/squat.png',
  腿举: '/assets/exercises/leg-press.png',
  哑铃推举: '/assets/exercises/dumbbell-shoulder-press.png',
  侧平举: '/assets/exercises/lateral-raise.png',
  平板支撑: '/assets/exercises/plank.png'
}

const EXERCISE_DETAIL_OVERRIDES = {
  杠铃卧推: {
    level: '入门+',
    equipment: '杠铃卧推架',
    intro: '杠铃卧推是胸部增肌的基础复合动作，适合在动作稳定后作为主项训练。',
    steps: ['仰卧在卧推凳上，眼睛大致位于杠铃正下方。', '肩胛向后向下收紧，双脚踩稳地面。', '握距略宽于肩，下降到胸部中下段附近。', '胸部发力向上推起，手肘不要完全锁死。'],
    tips: ['先用空杆热身，确认轨迹稳定。', '手腕保持中立，不要过度后折。', '大重量训练建议有人保护。'],
    mistakes: ['肩膀前顶导致肩部不适。', '臀部离凳借力。', '下降过快、反弹推起。']
  },
  哑铃卧推: {
    equipment: '哑铃 + 平板凳',
    intro: '哑铃卧推活动范围更大，有助于改善左右发力差异。',
    tips: ['两侧同时控制，避免一高一低。', '下降时肘部略低于肩即可。', '结束时先把哑铃放回大腿再坐起。']
  },
  高位下拉: {
    equipment: '高位下拉器',
    intro: '高位下拉适合新手建立背阔肌发力感，是引体向上的良好替代动作。',
    steps: ['坐稳并固定大腿，握距略宽于肩。', '挺胸收肩胛，先让肩膀下沉。', '用手肘向身体两侧下拉到上胸附近。', '慢慢还原，感受背部被拉长。'],
    tips: ['想象用手肘拉，不是用手腕拉。', '身体可微微后仰，但不要大幅摆动。'],
    mistakes: ['下拉到脖子后方。', '耸肩发力。', '借助身体后仰猛拉。']
  },
  坐姿划船: {
    equipment: '坐姿划船器',
    intro: '坐姿划船能训练中背厚度，适合放在背部训练的主力动作中。',
    tips: ['先收肩胛，再向后拉肘。', '胸口挺起，腰背保持中立。', '还原时不要被重量猛拉走。']
  },
  深蹲: {
    level: '入门+',
    equipment: '杠铃深蹲架',
    intro: '深蹲是下肢力量和全身稳定性的核心动作，建议先掌握徒手和轻重量动作。',
    steps: ['双脚约与肩同宽，脚尖自然外展。', '核心收紧，髋和膝同时开始下蹲。', '膝盖方向跟随脚尖，不内扣。', '脚掌踩稳地面，向上站起。'],
    tips: ['先保证深度和稳定，再增加重量。', '每组前做几次空杆或徒手热身。'],
    mistakes: ['膝盖明显内扣。', '弯腰塌背。', '脚跟离地。']
  },
  腿举: {
    equipment: '腿举机',
    intro: '腿举对动作稳定性要求低于深蹲，适合新手训练股四头肌和臀腿力量。',
    tips: ['膝盖朝脚尖方向移动。', '下降到骨盆不卷起的位置即可。', '顶端不要锁死膝盖。']
  },
  罗马尼亚硬拉: {
    equipment: '杠铃或哑铃',
    intro: '罗马尼亚硬拉重点训练腘绳肌和臀部，关键是髋部后移而不是弯腰。',
    tips: ['想象把臀部向后推。', '重量贴近身体上下移动。', '背部保持中立。'],
    mistakes: ['膝盖弯曲过多变成深蹲。', '为了追求幅度而弓背。']
  },
  臀推: {
    equipment: '杠铃或臀推器',
    intro: '臀推是强化臀大肌的高效动作，适合腿臀日作为主力或补充动作。',
    tips: ['顶端骨盆微微后倾，感受臀部夹紧。', '下巴微收，避免腰椎过度反弓。']
  },
  哑铃推举: {
    equipment: '哑铃 + 训练凳',
    intro: '哑铃推举主要训练肩部推举力量和肩部稳定性。',
    tips: ['核心收紧，不要靠后仰借力。', '肘部略在身体前侧，肩部更舒服。']
  },
  侧平举: {
    equipment: '哑铃',
    intro: '侧平举主要训练三角肌中束，是改善肩宽视觉的重要孤立动作。',
    tips: ['小重量高控制，手肘带动上抬。', '抬到肩高附近即可。'],
    mistakes: ['耸肩借力。', '身体大幅摆动。']
  },
  杠铃弯举: {
    equipment: '杠铃或 EZ 杆',
    intro: '杠铃弯举适合训练肱二头肌整体力量。',
    tips: ['肘部固定在身体两侧。', '下降阶段慢一点，不要直接掉下去。']
  },
  绳索下压: {
    equipment: '龙门架绳索',
    intro: '绳索下压是三头肌训练中容易上手且发力清晰的动作。',
    tips: ['肘部贴近身体。', '底端充分伸直并短暂停顿。']
  },
  平板支撑: {
    equipment: '瑜伽垫',
    intro: '平板支撑用于训练核心抗伸展能力，适合作为训练后的核心补充。',
    steps: ['双肘撑地，肘部位于肩膀下方。', '双脚向后伸直，身体保持一条直线。', '收紧腹部和臀部，自然呼吸。', '到姿势变形前主动结束。'],
    tips: ['宁可时间短，也不要塌腰硬撑。', '眼睛看向地面，脖子放松。']
  },
  跑步机: {
    equipment: '跑步机',
    intro: '跑步机适合热身、有氧消耗和减脂期心肺训练。',
    tips: ['先慢走 3-5 分钟热身。', '减脂新手可用坡度快走代替跑步。', '手不要长期扶把手借力。']
  },
  跑步机快走: {
    equipment: '跑步机',
    intro: '跑步机快走冲击低，适合减脂期和恢复日使用。',
    tips: ['保持能说短句的强度。', '坡度从 3-8 开始，根据状态调整。']
  },
  全身拉伸: {
    equipment: '瑜伽垫',
    intro: '全身拉伸用于训练后恢复，重点放松胸背腿和髋部。',
    tips: ['每个动作保持 20-40 秒。', '拉伸到有牵拉感即可，不要疼痛硬压。']
  },
  轻松散步: {
    equipment: '无器械',
    intro: '轻松散步适合休息日增加活动量，帮助恢复和保持习惯。',
    tips: ['保持轻松呼吸。', '以恢复为主，不需要追求强度。']
  }
}

function findBodyPartByExercise(name, fallbackBodyPart) {
  if (fallbackBodyPart && EXERCISE_OPTIONS[fallbackBodyPart]) return fallbackBodyPart
  if (SPECIAL_BODY_PARTS[name]) return SPECIAL_BODY_PARTS[name]
  const bodyParts = Object.keys(EXERCISE_OPTIONS)
  for (let index = 0; index < bodyParts.length; index += 1) {
    const bodyPart = bodyParts[index]
    if ((EXERCISE_OPTIONS[bodyPart] || []).indexOf(name) >= 0) return bodyPart
  }
  return '胸部'
}

function inferEquipment(name, bodyPart) {
  if (name.indexOf('杠铃') >= 0 || name.indexOf('T杠') >= 0) return '杠铃 / T杠'
  if (name.indexOf('哑铃') >= 0) return '哑铃'
  if (name.indexOf('绳索') >= 0 || name.indexOf('高位') >= 0 || name.indexOf('面拉') >= 0) return '龙门架 / 绳索器械'
  if (name.indexOf('史密斯') >= 0) return '史密斯机'
  if (name.indexOf('器械') >= 0 || name.indexOf('坐姿') >= 0 || name.indexOf('腿举') >= 0 || name.indexOf('蝴蝶机') >= 0) return '固定器械'
  if (name.indexOf('跑步机') >= 0 || name.indexOf('椭圆机') >= 0 || name.indexOf('单车') >= 0 || name.indexOf('划船机') >= 0 || name.indexOf('爬楼机') >= 0) return '有氧器械'
  if (bodyPart === '核心') return '自重 / 垫上'
  if (bodyPart === '有氧') return '有氧器械'
  return '健身房常见器械'
}

function inferLevel(name) {
  if (name.indexOf('杠铃') >= 0 || name.indexOf('深蹲') >= 0 || name.indexOf('硬拉') >= 0 || name.indexOf('双杠') >= 0 || name.indexOf('引体') >= 0) return '入门+'
  return '新手友好'
}

function createBaseDetail(name, bodyPart) {
  const info = BODY_PART_INFO[bodyPart] || BODY_PART_INFO.胸部
  const isCardio = bodyPart === '有氧'
  const isCore = bodyPart === '核心'
  const placeholderImagePath = CORE_MEDIA_PLACEHOLDERS[name] || `/assets/exercises/${encodeURIComponent(name)}.png`
  return {
    name,
    bodyPart,
    imageUrl: '',
    videoUrl: '',
    placeholderImagePath,
    target: info.target,
    equipment: inferEquipment(name, bodyPart),
    level: inferLevel(name),
    intro: `${name}主要训练${info.target}，适合在${bodyPart}训练中作为基础动作使用。`,
    steps: isCardio
      ? ['先用低强度热身 3-5 分钟。', '调整到能稳定呼吸的速度或阻力。', '训练中保持身体稳定，不要长期扶把手借力。', '结束前逐渐降低强度 2-3 分钟。']
      : isCore
        ? ['先摆好身体姿势，保持躯干稳定。', '收紧腹部，避免腰部塌陷或过度反弓。', '动作过程中自然呼吸。', '感觉姿势变形时及时停止。']
        : ['先用轻重量热身，确认动作轨迹。', `保持${info.focus}`, '发力阶段主动收缩目标肌群。', '还原阶段慢一点，保持控制。'],
    tips: [info.focus, '新手先保留 1-2 次余力，不要每组都练到力竭。', '如果关节疼痛，先降低重量或换相近动作。'],
    mistakes: ['为了加重量导致动作幅度变小。', '速度过快，目标肌肉没有控制感。', '训练前没有热身，直接上大重量。'],
    beginnerAdvice: '建议先做 2-3 组熟悉动作，每组 8-12 次或按计划执行；能稳定完成后再逐步加重量。'
  }
}

function getExerciseDetail(name, bodyPart) {
  const exerciseName = name || '杠铃卧推'
  const resolvedBodyPart = findBodyPartByExercise(exerciseName, bodyPart)
  const base = createBaseDetail(exerciseName, resolvedBodyPart)
  const override = EXERCISE_DETAIL_OVERRIDES[exerciseName] || {}
  return Object.assign({}, base, override, {
    name: exerciseName,
    bodyPart: resolvedBodyPart,
    imageUrl: override.imageUrl || base.imageUrl,
    videoUrl: override.videoUrl || base.videoUrl,
    placeholderImagePath: override.placeholderImagePath || base.placeholderImagePath,
    target: override.target || base.target,
    equipment: override.equipment || base.equipment,
    level: override.level || base.level,
    steps: override.steps || base.steps,
    tips: override.tips || base.tips,
    mistakes: override.mistakes || base.mistakes,
    beginnerAdvice: override.beginnerAdvice || base.beginnerAdvice
  })
}

function getExerciseCategories() {
  const bodyParts = Object.keys(EXERCISE_OPTIONS)
  return bodyParts.map(bodyPart => ({
    bodyPart,
    count: (EXERCISE_OPTIONS[bodyPart] || []).length,
    target: (BODY_PART_INFO[bodyPart] || {}).target || '',
    focus: (BODY_PART_INFO[bodyPart] || {}).focus || ''
  }))
}

function getAllExercises() {
  const result = []
  const bodyParts = Object.keys(EXERCISE_OPTIONS)
  bodyParts.forEach(bodyPart => {
    ;(EXERCISE_OPTIONS[bodyPart] || []).forEach(name => {
      const detail = getExerciseDetail(name, bodyPart)
      result.push({
        id: `${bodyPart}-${name}`,
        name,
        bodyPart,
        target: detail.target,
        equipment: detail.equipment,
        level: detail.level,
        imageUrl: detail.imageUrl,
        videoUrl: detail.videoUrl
      })
    })
  })
  return result
}

function getRelatedExercises(name, bodyPart) {
  const resolvedBodyPart = findBodyPartByExercise(name, bodyPart)
  const list = EXERCISE_OPTIONS[resolvedBodyPart] || []
  return list
    .filter(item => item !== name)
    .slice(0, 4)
    .map(item => ({ name: item, bodyPart: resolvedBodyPart }))
}

module.exports = {
  getExerciseCategories,
  getAllExercises,
  getExerciseDetail,
  getRelatedExercises,
  findBodyPartByExercise
}
