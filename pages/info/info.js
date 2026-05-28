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
        lines: ['当前为 v0.7.3 上线前体验精修版，重点优化视觉、空状态、动作详情和产品说明入口。']
      }
    ]
  },
  privacy: {
    title: '隐私说明',
    subtitle: '说明 Fit Note 如何处理你的个人记录。',
    sections: [
      {
        title: '本地保存',
        lines: ['当前版本不需要登录，也不会上传训练、饮食、身高、体重等数据到服务器。', '所有记录仅保存在你当前微信小程序的本地缓存中。']
      },
      {
        title: '数据风险',
        lines: ['如果你清理微信缓存、删除小程序缓存或更换设备，本地记录可能丢失。', '后续云端版会在用户授权后再进行云同步。']
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
        title: '后续规划',
        lines: ['后续正式版建议接入微信云开发，实现微信登录、云数据库、多设备同步和数据备份导出。']
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
