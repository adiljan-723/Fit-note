const { EXERCISE_OPTIONS } = require('./fitnessData')

const PLAN_SOURCE_NOTE = '参考 ACSM 阻力训练进阶模型：新手更适合固定模板，中级提高每周训练频率，高级更适合自主分化和渐进超负荷。'

function pad(num) {
  return num < 10 ? `0${num}` : `${num}`
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(dateStr, offset) {
  const date = new Date(dateStr.replace(/-/g, '/'))
  date.setDate(date.getDate() + offset)
  return formatDate(date)
}

const EXERCISE_PRESETS = {
  杠铃卧推: { sets: '4', reps: '6-10', rest: '120秒', note: '胸部主项，优先保证肩胛稳定和动作路径' },
  哑铃卧推: { sets: '3', reps: '8-12', rest: '90秒', note: '更大活动范围，控制下降速度' },
  上斜哑铃卧推: { sets: '3', reps: '8-12', rest: '90秒', note: '上胸重点，避免耸肩' },
  上斜杠铃卧推: { sets: '4', reps: '6-10', rest: '120秒', note: '上胸力量主项，注意肩部稳定' },
  器械推胸: { sets: '3', reps: '8-12', rest: '90秒', note: '路径稳定，适合控制胸部发力' },
  史密斯卧推: { sets: '3', reps: '8-12', rest: '90秒', note: '固定轨迹，注意卧凳位置' },
  双杠臂屈伸: { sets: '3', reps: '8-12', rest: '90秒', note: '偏下胸和三头，肩不适时减少幅度' },
  器械夹胸: { sets: '3', reps: '12-15', rest: '60秒', note: '孤立胸部，顶峰短暂停顿' },
  绳索夹胸: { sets: '3', reps: '12-15', rest: '60秒', note: '收尾泵感动作，保持全程张力' },
  高位下拉: { sets: '4', reps: '8-12', rest: '90秒', note: '背阔重点，下拉到上胸附近' },
  坐姿划船: { sets: '3', reps: '8-12', rest: '90秒', note: '横向拉，先收肩胛再拉肘' },
  哑铃划船: { sets: '3', reps: '10-12', rest: '75秒', note: '左右分别完成，避免身体旋转借力' },
  胸托划船: { sets: '3', reps: '10-12', rest: '75秒', note: '减少腰部借力，背部更集中' },
  T杠划船: { sets: '4', reps: '8-12', rest: '90秒', note: '中背厚度重点，保持核心稳定' },
  辅助引体向上: { sets: '4', reps: '6-10', rest: '120秒', note: '纵向拉主项，控制离心' },
  直臂下压: { sets: '3', reps: '12-15', rest: '60秒', note: '背阔孤立，手臂尽量少发力' },
  反向蝴蝶机: { sets: '3', reps: '12-15', rest: '60秒', note: '后束和上背稳定，避免耸肩' },
  深蹲: { sets: '4', reps: '6-10', rest: '120秒', note: '腿部主项，膝盖方向跟脚尖一致' },
  史密斯深蹲: { sets: '3', reps: '8-12', rest: '90秒', note: '固定轨迹，注意脚站位和深度' },
  腿举: { sets: '4', reps: '10-12', rest: '90秒', note: '腿部容量动作，不要锁死膝盖' },
  罗马尼亚硬拉: { sets: '3', reps: '8-12', rest: '90秒', note: '髋部后移，背部保持中立' },
  保加利亚分腿蹲: { sets: '3', reps: '每侧8-12', rest: '90秒', note: '单侧腿臀稳定，动作幅度可控' },
  箭步蹲: { sets: '3', reps: '每侧10-12', rest: '75秒', note: '控制身体平衡，膝盖稳定' },
  臀推: { sets: '3', reps: '8-12', rest: '90秒', note: '臀部专项，顶峰收紧' },
  坐姿腿屈伸: { sets: '3', reps: '12-15', rest: '60秒', note: '股四头孤立，顶峰短暂停顿' },
  坐姿腿弯举: { sets: '3', reps: '12-15', rest: '60秒', note: '大腿后侧孤立，控制离心' },
  站姿提踵: { sets: '4', reps: '12-20', rest: '45秒', note: '小腿训练，底部充分拉伸' },
  哑铃推举: { sets: '4', reps: '8-12', rest: '90秒', note: '肩部主项，核心收紧' },
  器械推肩: { sets: '3', reps: '8-12', rest: '90秒', note: '稳定推举，适合补充肩部容量' },
  史密斯推肩: { sets: '3', reps: '8-12', rest: '90秒', note: '固定轨迹，避免腰部代偿' },
  侧平举: { sets: '4', reps: '12-15', rest: '60秒', note: '侧束重点，小重量控制' },
  绳索侧平举: { sets: '3', reps: '12-15', rest: '60秒', note: '全程张力，动作慢一点' },
  俯身飞鸟: { sets: '3', reps: '12-15', rest: '60秒', note: '后束补充，避免甩动' },
  面拉: { sets: '3', reps: '12-15', rest: '60秒', note: '肩袖和后束，保护肩部稳定' },
  杠铃耸肩: { sets: '3', reps: '10-15', rest: '60秒', note: '斜方肌训练，顶峰短暂停顿' },
  杠铃弯举: { sets: '3', reps: '8-12', rest: '60秒', note: '二头主项，身体不要后仰借力' },
  哑铃弯举: { sets: '3', reps: '10-12', rest: '60秒', note: '左右均衡，控制离心' },
  锤式弯举: { sets: '3', reps: '10-12', rest: '60秒', note: '肱肌和前臂参与，保持手腕稳定' },
  牧师凳弯举: { sets: '3', reps: '10-12', rest: '60秒', note: '减少借力，二头更集中' },
  绳索弯举: { sets: '3', reps: '12-15', rest: '60秒', note: '保持持续张力' },
  绳索下压: { sets: '3', reps: '10-15', rest: '60秒', note: '三头补充，肘部固定' },
  臂屈伸: { sets: '3', reps: '8-12', rest: '75秒', note: '三头主项，肩不适时减少幅度' },
  过顶臂屈伸: { sets: '3', reps: '10-12', rest: '60秒', note: '三头长头重点，手肘稳定' },
  平板支撑: { sets: '3', reps: '30-60秒', rest: '45秒', note: '核心稳定，保持身体一条直线' },
  卷腹: { sets: '3', reps: '12-15', rest: '45秒', note: '腹部卷曲，不要拉脖子' },
  悬垂举腿: { sets: '3', reps: '8-12', rest: '60秒', note: '核心控制，避免身体摆动' },
  俄罗斯转体: { sets: '3', reps: '每侧12-16', rest: '45秒', note: '旋转控制，腰背保持稳定' },
  绳索卷腹: { sets: '3', reps: '12-15', rest: '60秒', note: '腹部主动卷曲，控制还原' },
  死虫: { sets: '3', reps: '每侧10-12', rest: '45秒', note: '核心稳定，腰部贴近垫面' },
  侧桥: { sets: '3', reps: '每侧30-45秒', rest: '45秒', note: '侧向核心稳定，髋部不要下沉' },
  跑步机: { sets: '1', reps: '20-35分钟', rest: '按需', note: '中低强度有氧，保持稳定呼吸' },
  椭圆机: { sets: '1', reps: '20-35分钟', rest: '按需', note: '低冲击有氧，适合恢复日' },
  动感单车: { sets: '1', reps: '15-30分钟', rest: '按需', note: '控制强度，不影响力量恢复' },
  划船机: { sets: '1', reps: '10-20分钟', rest: '按需', note: '全身有氧，保持划船节奏' },
  爬楼机: { sets: '1', reps: '10-20分钟', rest: '按需', note: '下肢参与较多，量力而行' }
}

function getExercisePrescription(bodyPart, name) {
  const preset = EXERCISE_PRESETS[name]
  if (preset) return Object.assign({ bodyPart, name }, preset)
  return { bodyPart, name, sets: '3', reps: '8-12', rest: '90秒', note: '按动作标准和自身状态完成' }
}

function cloneExercise(exercise) {
  const base = getExercisePrescription(exercise.bodyPart, exercise.name)
  return Object.assign({}, base, exercise)
}

const SPLIT_TEMPLATES = {

  three: {
    label: '三分化（推/拉/腿）',
    summary: '适合新手到入门用户，动作结构清晰，容易跟练。',
    days: [
      {
        title: '推力日',
        focus: '胸部 + 肩部 + 三头',
        bodyPart: '胸部',
        exercises: [
          { bodyPart: '胸部', name: '杠铃卧推', sets: '4', reps: '6-10', rest: '120秒', note: '核心主项，先保证动作稳定' },
          { bodyPart: '胸部', name: '上斜哑铃卧推', sets: '3', reps: '8-12', rest: '90秒', note: '补充上胸刺激' },
          { bodyPart: '肩部', name: '哑铃推举', sets: '3', reps: '8-12', rest: '90秒', note: '推举时避免腰部代偿' },
          { bodyPart: '肩部', name: '侧平举', sets: '3', reps: '12-15', rest: '60秒', note: '小重量控制动作' },
          { bodyPart: '手臂', name: '绳索下压', sets: '3', reps: '10-15', rest: '60秒', note: '肘部固定' }
        ]
      },
      {
        title: '拉力日',
        focus: '背部 + 二头',
        bodyPart: '背部',
        exercises: [
          { bodyPart: '背部', name: '高位下拉', sets: '4', reps: '8-12', rest: '90秒', note: '下拉到上胸附近' },
          { bodyPart: '背部', name: '坐姿划船', sets: '3', reps: '8-12', rest: '90秒', note: '先收肩胛再拉肘' },
          { bodyPart: '背部', name: '胸托划船', sets: '3', reps: '10-12', rest: '75秒', note: '减少腰部借力' },
          { bodyPart: '肩部', name: '面拉', sets: '3', reps: '12-15', rest: '60秒', note: '保护肩部稳定' },
          { bodyPart: '手臂', name: '哑铃弯举', sets: '3', reps: '10-12', rest: '60秒', note: '控制离心' }
        ]
      },
      {
        title: '腿臀日',
        focus: '下肢 + 核心',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '深蹲', sets: '4', reps: '6-10', rest: '120秒', note: '膝盖方向跟脚尖一致' },
          { bodyPart: '腿臀', name: '腿举', sets: '3', reps: '10-12', rest: '90秒', note: '不要锁死膝盖' },
          { bodyPart: '腿臀', name: '罗马尼亚硬拉', sets: '3', reps: '8-12', rest: '90秒', note: '髋部后移，背部中立' },
          { bodyPart: '腿臀', name: '坐姿腿屈伸', sets: '3', reps: '12-15', rest: '60秒', note: '顶峰短暂停顿' },
          { bodyPart: '核心', name: '平板支撑', sets: '3', reps: '30-60秒', rest: '45秒', note: '保持身体一条直线' }
        ]
      }
    ]
  },
  four: {
    label: '四分化',
    summary: '适合入门用户，每次训练目标更集中，恢复压力适中。',
    days: [
      {
        title: '胸部 + 三头',
        focus: '推力和胸部容量',
        bodyPart: '胸部',
        exercises: [
          { bodyPart: '胸部', name: '杠铃卧推', sets: '4', reps: '6-10', rest: '120秒', note: '主项训练' },
          { bodyPart: '胸部', name: '上斜哑铃卧推', sets: '3', reps: '8-12', rest: '90秒', note: '上胸补充' },
          { bodyPart: '胸部', name: '器械夹胸', sets: '3', reps: '12-15', rest: '60秒', note: '顶峰收缩' },
          { bodyPart: '手臂', name: '绳索下压', sets: '3', reps: '10-15', rest: '60秒', note: '三头补充' }
        ]
      },
      {
        title: '背部 + 二头',
        focus: '背阔和划船能力',
        bodyPart: '背部',
        exercises: [
          { bodyPart: '背部', name: '高位下拉', sets: '4', reps: '8-12', rest: '90秒', note: '背阔肌发力' },
          { bodyPart: '背部', name: '坐姿划船', sets: '3', reps: '8-12', rest: '90秒', note: '控制肩胛' },
          { bodyPart: '背部', name: '哑铃划船', sets: '3', reps: '10-12', rest: '75秒', note: '左右均衡' },
          { bodyPart: '手臂', name: '杠铃弯举', sets: '3', reps: '8-12', rest: '60秒', note: '二头补充' }
        ]
      },
      {
        title: '腿臀',
        focus: '下肢力量和臀腿容量',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '深蹲', sets: '4', reps: '6-10', rest: '120秒', note: '主项训练' },
          { bodyPart: '腿臀', name: '腿举', sets: '4', reps: '10-12', rest: '90秒', note: '增加腿部容量' },
          { bodyPart: '腿臀', name: '罗马尼亚硬拉', sets: '3', reps: '8-12', rest: '90秒', note: '腘绳肌和臀部' },
          { bodyPart: '腿臀', name: '坐姿腿弯举', sets: '3', reps: '12-15', rest: '60秒', note: '后侧补充' }
        ]
      },
      {
        title: '肩部 + 核心',
        focus: '肩部线条和稳定',
        bodyPart: '肩部',
        exercises: [
          { bodyPart: '肩部', name: '哑铃推举', sets: '4', reps: '8-12', rest: '90秒', note: '主项训练' },
          { bodyPart: '肩部', name: '侧平举', sets: '4', reps: '12-15', rest: '60秒', note: '侧束重点' },
          { bodyPart: '肩部', name: '俯身飞鸟', sets: '3', reps: '12-15', rest: '60秒', note: '后束补充' },
          { bodyPart: '核心', name: '悬垂举腿', sets: '3', reps: '8-12', rest: '60秒', note: '核心控制' }
        ]
      }
    ]
  },
  five: {
    label: '五分化',
    summary: '适合有经验用户，单次训练更聚焦，更依赖自我恢复管理。',
    days: [
      {
        title: '胸部',
        focus: '胸部专项',
        bodyPart: '胸部',
        exercises: [
          { bodyPart: '胸部', name: '杠铃卧推', sets: '4', reps: '6-10', rest: '120秒', note: '主项' },
          { bodyPart: '胸部', name: '上斜哑铃卧推', sets: '4', reps: '8-12', rest: '90秒', note: '上胸' },
          { bodyPart: '胸部', name: '双杠臂屈伸', sets: '3', reps: '8-12', rest: '90秒', note: '下胸和推力' },
          { bodyPart: '胸部', name: '绳索夹胸', sets: '3', reps: '12-15', rest: '60秒', note: '收尾泵感' }
        ]
      },
      {
        title: '背部',
        focus: '背部专项',
        bodyPart: '背部',
        exercises: [
          { bodyPart: '背部', name: '辅助引体向上', sets: '4', reps: '6-10', rest: '120秒', note: '纵向拉' },
          { bodyPart: '背部', name: '高位下拉', sets: '3', reps: '8-12', rest: '90秒', note: '背阔补充' },
          { bodyPart: '背部', name: '坐姿划船', sets: '4', reps: '8-12', rest: '90秒', note: '横向拉' },
          { bodyPart: '背部', name: '直臂下压', sets: '3', reps: '12-15', rest: '60秒', note: '背阔孤立' }
        ]
      },
      {
        title: '腿臀',
        focus: '腿部专项',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '深蹲', sets: '4', reps: '6-10', rest: '120秒', note: '主项' },
          { bodyPart: '腿臀', name: '腿举', sets: '4', reps: '10-12', rest: '90秒', note: '股四头容量' },
          { bodyPart: '腿臀', name: '保加利亚分腿蹲', sets: '3', reps: '每侧8-12', rest: '90秒', note: '单侧稳定' },
          { bodyPart: '腿臀', name: '臀推', sets: '3', reps: '8-12', rest: '90秒', note: '臀部专项' }
        ]
      },
      {
        title: '肩部',
        focus: '肩部专项',
        bodyPart: '肩部',
        exercises: [
          { bodyPart: '肩部', name: '哑铃推举', sets: '4', reps: '6-10', rest: '120秒', note: '主项' },
          { bodyPart: '肩部', name: '器械推肩', sets: '3', reps: '8-12', rest: '90秒', note: '稳定补充' },
          { bodyPart: '肩部', name: '侧平举', sets: '4', reps: '12-15', rest: '60秒', note: '侧束' },
          { bodyPart: '肩部', name: '面拉', sets: '3', reps: '12-15', rest: '60秒', note: '肩袖和后束' }
        ]
      },
      {
        title: '手臂 + 核心',
        focus: '手臂专项和核心',
        bodyPart: '手臂',
        exercises: [
          { bodyPart: '手臂', name: '杠铃弯举', sets: '3', reps: '8-12', rest: '60秒', note: '二头主项' },
          { bodyPart: '手臂', name: '锤式弯举', sets: '3', reps: '10-12', rest: '60秒', note: '肱肌补充' },
          { bodyPart: '手臂', name: '绳索下压', sets: '3', reps: '10-15', rest: '60秒', note: '三头补充' },
          { bodyPart: '核心', name: '绳索卷腹', sets: '3', reps: '12-15', rest: '60秒', note: '核心收尾' }
        ]
      }
    ]
  }
}

const FAT_LOSS_TEMPLATES = {
  fatStrength: {
    label: '力量优先减脂',
    summary: '以力量训练保留肌肉，训练末尾搭配中低强度有氧，适合想减脂但不想掉肌肉的用户。',
    days: [
      {
        title: '上肢力量 + 有氧',
        focus: '保留上肢肌肉 + 稳定消耗',
        bodyPart: '背部',
        exercises: [
          { bodyPart: '背部', name: '高位下拉' },
          { bodyPart: '胸部', name: '器械推胸' },
          { bodyPart: '背部', name: '坐姿划船' },
          { bodyPart: '肩部', name: '侧平举' },
          { bodyPart: '有氧', name: '椭圆机', sets: '1', reps: '20-30分钟', rest: '按需', note: '力量训练后中低强度有氧' }
        ]
      },
      {
        title: '下肢力量 + 核心',
        focus: '提高消耗并保护基础力量',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '腿举' },
          { bodyPart: '腿臀', name: '罗马尼亚硬拉' },
          { bodyPart: '腿臀', name: '箭步蹲' },
          { bodyPart: '核心', name: '平板支撑' },
          { bodyPart: '有氧', name: '跑步机', sets: '1', reps: '15-25分钟', rest: '按需', note: '坡度快走，保持可交流强度' }
        ]
      },
      {
        title: '全身力量循环',
        focus: '全身复合动作 + 中等密度',
        bodyPart: '胸部',
        exercises: [
          { bodyPart: '腿臀', name: '史密斯深蹲' },
          { bodyPart: '胸部', name: '哑铃卧推' },
          { bodyPart: '背部', name: '胸托划船' },
          { bodyPart: '肩部', name: '器械推肩' },
          { bodyPart: '有氧', name: '划船机', sets: '1', reps: '10-15分钟', rest: '按需', note: '控制节奏，不追求力竭' }
        ]
      },
      {
        title: '臀腿 + 有氧',
        focus: '下肢容量和持续消耗',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '深蹲' },
          { bodyPart: '腿臀', name: '坐姿腿屈伸' },
          { bodyPart: '腿臀', name: '坐姿腿弯举' },
          { bodyPart: '核心', name: '卷腹' },
          { bodyPart: '有氧', name: '爬楼机', sets: '1', reps: '10-20分钟', rest: '按需', note: '状态不好时可换椭圆机' }
        ]
      }
    ]
  },
  fatCardio: {
    label: '有氧优先减脂',
    summary: '以有氧消耗和轻量力量训练结合，适合当前主要目标是体重下降和心肺提升的用户。',
    days: [
      {
        title: '有氧 + 上肢轻力量',
        focus: '中低强度有氧 + 上肢激活',
        bodyPart: '有氧',
        exercises: [
          { bodyPart: '有氧', name: '跑步机', sets: '1', reps: '30-40分钟', rest: '按需', note: '坡度快走或慢跑，保持稳定呼吸' },
          { bodyPart: '背部', name: '高位下拉', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '胸部', name: '器械推胸', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '核心', name: '平板支撑' }
        ]
      },
      {
        title: '椭圆机 + 核心',
        focus: '低冲击有氧和核心稳定',
        bodyPart: '有氧',
        exercises: [
          { bodyPart: '有氧', name: '椭圆机', sets: '1', reps: '35-45分钟', rest: '按需', note: '适合膝盖压力较敏感用户' },
          { bodyPart: '核心', name: '卷腹' },
          { bodyPart: '核心', name: '死虫' },
          { bodyPart: '核心', name: '侧桥' }
        ]
      },
      {
        title: '单车 + 下肢轻力量',
        focus: '有氧耐力和腿部激活',
        bodyPart: '有氧',
        exercises: [
          { bodyPart: '有氧', name: '动感单车', sets: '1', reps: '25-35分钟', rest: '按需', note: '避免强度过高影响恢复' },
          { bodyPart: '腿臀', name: '腿举', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '腿臀', name: '坐姿腿屈伸', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '腿臀', name: '臀推' }
        ]
      },
      {
        title: '划船机 + 全身循环',
        focus: '全身参与和热量消耗',
        bodyPart: '有氧',
        exercises: [
          { bodyPart: '有氧', name: '划船机', sets: '1', reps: '15-25分钟', rest: '按需', note: '保持动作节奏和背部稳定' },
          { bodyPart: '胸部', name: '哑铃卧推', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '背部', name: '坐姿划船', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '肩部', name: '侧平举' }
        ]
      }
    ]
  },
  fatLowImpact: {
    label: '新手低冲击减脂',
    summary: '降低关节压力，使用器械、椭圆机和单车建立运动习惯，适合减脂新手。',
    days: [
      {
        title: '器械全身入门',
        focus: '安全熟悉器械和动作路径',
        bodyPart: '胸部',
        exercises: [
          { bodyPart: '胸部', name: '器械推胸', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '背部', name: '高位下拉', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '腿臀', name: '腿举', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '有氧', name: '椭圆机', sets: '1', reps: '20-30分钟', rest: '按需' }
        ]
      },
      {
        title: '低冲击有氧',
        focus: '建立心肺基础',
        bodyPart: '有氧',
        exercises: [
          { bodyPart: '有氧', name: '椭圆机', sets: '1', reps: '30-40分钟', rest: '按需' },
          { bodyPart: '核心', name: '死虫' },
          { bodyPart: '核心', name: '平板支撑' }
        ]
      },
      {
        title: '下肢器械 + 单车',
        focus: '腿部力量和温和消耗',
        bodyPart: '腿臀',
        exercises: [
          { bodyPart: '腿臀', name: '腿举', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '腿臀', name: '坐姿腿屈伸', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '腿臀', name: '坐姿腿弯举', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '有氧', name: '动感单车', sets: '1', reps: '20-30分钟', rest: '按需' }
        ]
      },
      {
        title: '上肢器械 + 拉伸',
        focus: '上肢基础和恢复',
        bodyPart: '背部',
        exercises: [
          { bodyPart: '背部', name: '坐姿划船', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '肩部', name: '器械推肩', sets: '3', reps: '10-12', rest: '75秒' },
          { bodyPart: '手臂', name: '绳索下压', sets: '3', reps: '12-15', rest: '60秒' },
          { bodyPart: '有氧', name: '跑步机', sets: '1', reps: '20分钟', rest: '按需', note: '坡度快走，不追求跑步速度' }
        ]
      }
    ]
  }
}

const FLEXIBLE_WEEK_PARTS = ['胸部', '背部', '腿臀', '肩部', '手臂', '核心', '有氧']

function getTemplateMap(goal) {
  return goal === 'fatLoss' ? FAT_LOSS_TEMPLATES : SPLIT_TEMPLATES
}

function createPlanFromTemplate(type, startDate, cycles, goal) {
  const targetGoal = goal || 'muscle'
  const template = getTemplateMap(targetGoal)[type]
  const days = []
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    template.days.forEach((day, index) => {
      const order = cycle * template.days.length + index
      days.push({
        id: `${type}-${Date.now()}-${order}`,
        date: addDays(startDate, order),
        title: `${day.title}${cycles > 1 ? ` · 第${cycle + 1}轮` : ''}`,
        focus: day.focus,
        bodyPart: day.bodyPart,
        exercises: day.exercises.map(cloneExercise)
      })
    })
  }
  return {
    id: `${type}-${Date.now()}`,
    goal: targetGoal,
    mode: 'generated',
    title: `${template.label}${targetGoal === 'fatLoss' ? '计划' : '增肌计划'}`,
    splitType: type,
    sourceNote: PLAN_SOURCE_NOTE,
    summary: template.summary,
    createdAt: new Date().toISOString(),
    days
  }
}

function createFlexibleWeekPlan(startDate, mode, goal) {
  const targetGoal = goal || 'muscle'
  const goalLabel = targetGoal === 'fatLoss' ? '减脂' : '增肌'
  return {
    id: `${mode}-${targetGoal}-${Date.now()}`,
    goal: targetGoal,
    mode,
    title: mode === 'free' ? `我任性${goalLabel}计划` : `我自有${goalLabel}计划`,
    splitType: mode,
    sourceNote: PLAN_SOURCE_NOTE,
    summary: mode === 'free' ? '每天自由选择训练部位和热门动作，适合想灵活安排的用户。' : '完全自定义训练部位和动作，适合已有自己节奏的用户。',
    createdAt: new Date().toISOString(),
    days: FLEXIBLE_WEEK_PARTS.map((part, index) => ({
      id: `${mode}-${targetGoal}-${Date.now()}-${index}`,
      date: addDays(startDate, index),
      title: `第${index + 1}天`,
      focus: mode === 'free' ? `${part}自选` : '自定义训练',
      bodyPart: part,
      exercises: mode === 'free' ? [cloneExercise({ bodyPart: part, name: EXERCISE_OPTIONS[part][0], sets: '3', reps: '8-12', rest: '90秒', note: '可按状态替换动作' })] : []
    }))
  }
}


module.exports = {
  PLAN_SOURCE_NOTE,
  createPlanFromTemplate,
  createFlexibleWeekPlan,
  getExercisePrescription
}

