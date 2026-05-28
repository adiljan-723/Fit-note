const DEFAULT_PROFILE = {
  configured: false,
  nickname: '新手用户',
  gender: '男',
  age: '',
  height: '',
  weight: '',
  goal: 'muscle',
  daysPerWeek: 4,
  trainingDuration: '半年以内',
  experience: '新手'

}

const EXERCISE_OPTIONS = {
  胸部: ['杠铃卧推', '哑铃卧推', '上斜哑铃卧推', '上斜杠铃卧推', '器械推胸', '史密斯卧推', '双杠臂屈伸', '器械夹胸', '绳索夹胸'],
  背部: ['高位下拉', '坐姿划船', '哑铃划船', '胸托划船', 'T杠划船', '辅助引体向上', '直臂下压', '反向蝴蝶机'],
  腿臀: ['深蹲', '史密斯深蹲', '腿举', '罗马尼亚硬拉', '保加利亚分腿蹲', '箭步蹲', '臀推', '坐姿腿屈伸', '坐姿腿弯举', '站姿提踵'],
  肩部: ['哑铃推举', '器械推肩', '史密斯推肩', '侧平举', '绳索侧平举', '俯身飞鸟', '面拉', '杠铃耸肩'],
  手臂: ['杠铃弯举', '哑铃弯举', '锤式弯举', '牧师凳弯举', '绳索弯举', '绳索下压', '臂屈伸', '过顶臂屈伸'],
  核心: ['平板支撑', '卷腹', '悬垂举腿', '俄罗斯转体', '绳索卷腹', '死虫', '侧桥'],
  有氧: ['跑步机', '椭圆机', '动感单车', '划船机', '爬楼机']
}


const TRAINING_PLANS = {
  muscle: {
    title: '增肌入门计划',
    goalLabel: '增肌',
    summary: '以力量训练和渐进超负荷为核心，帮助新手建立稳定训练习惯。',
    tags: ['力量训练为主', '每周 4-5 练', '动作标准优先'],
    days: [
      {
        day: '周一',
        title: '胸部 + 三头',
        focus: '推力训练',
        exercises: [
          { name: '杠铃卧推', sets: '4组', reps: '8-12次', rest: '90秒', tip: '肩胛收紧，动作全程稳定' },
          { name: '上斜哑铃卧推', sets: '3组', reps: '10-12次', rest: '75秒', tip: '感受上胸发力，不要耸肩' },
          { name: '器械夹胸', sets: '3组', reps: '12-15次', rest: '60秒', tip: '顶峰停顿 1 秒' },
          { name: '绳索下压', sets: '3组', reps: '10-15次', rest: '60秒', tip: '肘部固定在身体两侧' }
        ]
      },
      {
        day: '周二',
        title: '背部 + 二头',
        focus: '拉力训练',
        exercises: [
          { name: '高位下拉', sets: '4组', reps: '8-12次', rest: '90秒', tip: '下拉到上胸附近，避免借力' },
          { name: '坐姿划船', sets: '3组', reps: '10-12次', rest: '75秒', tip: '先收肩胛再拉肘' },
          { name: '哑铃划船', sets: '3组', reps: '10-12次', rest: '75秒', tip: '背部保持稳定' },
          { name: '哑铃弯举', sets: '3组', reps: '10-12次', rest: '60秒', tip: '控制离心，避免甩动' }
        ]
      },
      {
        day: '周三',
        title: '主动恢复',
        focus: '轻有氧 + 拉伸',
        exercises: [
          { name: '椭圆机', sets: '1组', reps: '20-30分钟', rest: '按需', tip: '保持可交流强度' },
          { name: '全身拉伸', sets: '1组', reps: '10分钟', rest: '按需', tip: '重点放松胸背腿' }
        ]
      },
      {
        day: '周四',
        title: '腿臀',
        focus: '下肢力量',
        exercises: [
          { name: '深蹲', sets: '4组', reps: '8-10次', rest: '120秒', tip: '膝盖方向与脚尖一致' },
          { name: '腿举', sets: '3组', reps: '10-12次', rest: '90秒', tip: '不要锁死膝盖' },
          { name: '罗马尼亚硬拉', sets: '3组', reps: '8-12次', rest: '90秒', tip: '髋部后移，背部中立' },
          { name: '坐姿腿屈伸', sets: '3组', reps: '12-15次', rest: '60秒', tip: '顶端短暂停顿' }
        ]
      },
      {
        day: '周五',
        title: '肩部 + 核心',
        focus: '稳定和线条',
        exercises: [
          { name: '哑铃推举', sets: '4组', reps: '8-12次', rest: '90秒', tip: '核心收紧，避免腰部代偿' },
          { name: '侧平举', sets: '4组', reps: '12-15次', rest: '60秒', tip: '小重量控制动作' },
          { name: '面拉', sets: '3组', reps: '12-15次', rest: '60秒', tip: '改善肩部稳定' },
          { name: '平板支撑', sets: '3组', reps: '30-60秒', rest: '45秒', tip: '身体保持一条直线' }
        ]
      },
      {
        day: '周六',
        title: '弱项补强',
        focus: '选择较弱部位轻量补充',
        exercises: [
          { name: '薄弱部位复练', sets: '3组', reps: '10-12次', rest: '75秒', tip: '只做状态好的动作' },
          { name: '跑步机快走', sets: '1组', reps: '15-20分钟', rest: '按需', tip: '帮助恢复和心肺提升' }
        ]
      },
      {
        day: '周日',
        title: '休息',
        focus: '恢复优先',
        exercises: [
          { name: '轻松散步', sets: '1组', reps: '20分钟', rest: '按需', tip: '睡眠和饮食比硬练更重要' }
        ]
      }
    ]
  },
  fatLoss: {
    title: '减脂入门计划',
    goalLabel: '减脂',
    summary: '力量训练保留肌肉，搭配适量有氧和饮食控制，提高减脂可持续性。',
    tags: ['力量 + 有氧', '每周 4-5 练', '热量赤字'],
    days: [
      {
        day: '周一',
        title: '上肢力量 + 有氧',
        focus: '保留肌肉',
        exercises: [
          { name: '高位下拉', sets: '3组', reps: '10-12次', rest: '75秒', tip: '先保证动作标准' },
          { name: '器械推胸', sets: '3组', reps: '10-12次', rest: '75秒', tip: '控制速度' },
          { name: '坐姿划船', sets: '3组', reps: '10-12次', rest: '75秒', tip: '背部发力' },
          { name: '椭圆机', sets: '1组', reps: '20分钟', rest: '按需', tip: '中低强度即可' }
        ]
      },
      {
        day: '周二',
        title: '下肢力量 + 核心',
        focus: '提高消耗',
        exercises: [
          { name: '腿举', sets: '4组', reps: '10-12次', rest: '90秒', tip: '膝盖稳定' },
          { name: '箭步蹲', sets: '3组', reps: '每侧10次', rest: '75秒', tip: '保持身体平衡' },
          { name: '坐姿腿屈伸', sets: '3组', reps: '12-15次', rest: '60秒', tip: '慢速控制' },
          { name: '卷腹', sets: '3组', reps: '12-15次', rest: '45秒', tip: '不要拉脖子' }
        ]
      },
      {
        day: '周三',
        title: '有氧恢复日',
        focus: '心肺和恢复',
        exercises: [
          { name: '跑步机快走', sets: '1组', reps: '30-40分钟', rest: '按需', tip: '坡度 3-8，根据状态调整' },
          { name: '全身拉伸', sets: '1组', reps: '10分钟', rest: '按需', tip: '放松腿部和髋部' }
        ]
      },
      {
        day: '周四',
        title: '全身力量',
        focus: '复合动作',
        exercises: [
          { name: '深蹲', sets: '3组', reps: '8-10次', rest: '90秒', tip: '使用能稳定控制的重量' },
          { name: '哑铃卧推', sets: '3组', reps: '10-12次', rest: '75秒', tip: '肩部稳定' },
          { name: '哑铃划船', sets: '3组', reps: '10-12次', rest: '75秒', tip: '左右均衡' },
          { name: '动感单车', sets: '1组', reps: '15分钟', rest: '按需', tip: '微微出汗即可' }
        ]
      },
      {
        day: '周五',
        title: '中低强度有氧',
        focus: '持续消耗',
        exercises: [
          { name: '椭圆机', sets: '1组', reps: '35分钟', rest: '按需', tip: '保持稳定呼吸' },
          { name: '平板支撑', sets: '3组', reps: '30-45秒', rest: '45秒', tip: '核心收紧' }
        ]
      },
      {
        day: '周六',
        title: '循环训练',
        focus: '轻重量高效率',
        exercises: [
          { name: '器械推胸', sets: '3轮', reps: '12次', rest: '60秒', tip: '不要追求极限重量' },
          { name: '高位下拉', sets: '3轮', reps: '12次', rest: '60秒', tip: '动作流畅' },
          { name: '腿举', sets: '3轮', reps: '12次', rest: '60秒', tip: '节奏稳定' },
          { name: '爬楼机', sets: '1组', reps: '10-15分钟', rest: '按需', tip: '状态不好可跳过' }
        ]
      },
      {
        day: '周日',
        title: '休息',
        focus: '恢复和复盘',
        exercises: [
          { name: '轻松散步', sets: '1组', reps: '20分钟', rest: '按需', tip: '复盘本周饮食和训练' }
        ]
      }
    ]
  }
}

const DIET_GUIDES = {
  muscle: {
    title: '增肌饮食建议',
    summary: '在训练稳定的基础上，让每日摄入略高于消耗，优先保证蛋白质和碳水。',
    targets: ['热量略盈余', '蛋白质约 1.6-2.0g/kg', '训练前后补充碳水', '少量多餐更容易坚持'],
    foods: ['鸡蛋', '牛奶', '鸡胸肉', '牛肉', '米饭', '燕麦', '土豆', '香蕉'],
    sample: {
      breakfast: '燕麦 + 牛奶 + 鸡蛋',
      lunch: '米饭 + 鸡胸肉/牛肉 + 蔬菜',
      dinner: '米饭/土豆 + 鱼肉/瘦肉 + 蔬菜',
      snack: '酸奶/香蕉/蛋白粉按需补充'
    }
  },
  fatLoss: {
    title: '减脂饮食建议',
    summary: '保持温和热量赤字，同时保证蛋白质，减少高油高糖食物。',
    targets: ['热量略低于消耗', '蛋白质优先', '主食不过度清零', '多蔬菜和足量饮水'],
    foods: ['鸡蛋', '鱼肉', '虾', '鸡胸肉', '玉米', '土豆', '绿叶菜', '低脂奶'],
    sample: {
      breakfast: '鸡蛋 + 无糖酸奶 + 玉米',
      lunch: '少量米饭 + 鸡胸肉/鱼肉 + 大量蔬菜',
      dinner: '土豆/杂粮 + 虾/瘦肉 + 蔬菜',
      snack: '水果/低脂奶，避免高糖零食'
    }
  }
}

module.exports = {
  DEFAULT_PROFILE,
  EXERCISE_OPTIONS,
  TRAINING_PLANS,
  DIET_GUIDES
}
