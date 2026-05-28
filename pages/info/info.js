const CONTENT_MAP = {
  about: {
    title: '关于 Fit Note',
    subtitle: '一个面向健身房新手和入门用户的训练记录工具。',
    sections: [
      {
        title: '产品定位',
        lines: ['Fit Note 帮助用户生成训练计划、执行今日训练、逐组记录训练、记录饮食，并通过动作库学习基础动作要点。']
      },
      {
        title: '当前版本',
        lines: ['当前为 v0.9.0 后端落地基础版，已接入 CloudBase 用户身份、云数据库集合和本地 + 云端同步能力。']
      }
    ]
  },
  privacy: {
    title: '隐私说明',
    subtitle: '说明 Fit Note 如何处理你的个人记录。',
    sections: [
      {
        title: '本地优先',
        lines: ['当前版本会优先把训练、饮食、身高、体重、计划等数据保存在当前小程序本地缓存中，保证没有网络时也能继续使用。']
      },
      {
        title: '云端同步',
        lines: ['小程序会通过 CloudBase 获取用户 openid，并在云端同步用户资料、训练记录、饮食记录、训练计划和打卡数据。', '如果云端暂不可用，本地记录仍会保留，后续可在我的页面手动同步。']
      }
    ]
  },
  agreement: {
    title: '用户协议',
    subtitle: '使用 Fit Note 前请了解以下说明。',
    sections: [
      {
        title: '健身建议',
        lines: ['Fit Note 提供的训练计划、饮食目标和动作说明仅作为健身记录参考，不构成医疗或专业诊断建议。']
      },
      {
        title: '安全提示',
        lines: ['训练中如出现明显不适、疼痛或其他异常情况，请立即停止训练，并根据需要咨询专业人士。']
      }
    ]
  },
  data: {
    title: '数据说明',
    subtitle: '当前版本的数据保存和后续规划。',
    sections: [
      {
        title: '当前保存内容',
        lines: ['用户资料、训练计划、训练记录、饮食记录、今日打卡和训练草稿会保存在本地缓存。']
      },
      {
        title: '云端保存内容',
        lines: ['当前已接入 CloudBase 云数据库，云端会保存用户资料、训练计划、训练记录、饮食记录和今日打卡数据，训练草稿仍仅保存在本地。']
      }
    ]
  }
}

Page({
  data: {
    content: CONTENT_MAP.about
  },

  onLoad(options) {
    const type = options && options.type ? options.type : 'about'
    const content = CONTENT_MAP[type] || CONTENT_MAP.about
    this.setData({ content })
    wx.setNavigationBarTitle({ title: content.title })
  }
})
