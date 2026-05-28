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
        lines: ['当前为 v0.9.1 本地稳定版，已关闭运行中的云同步请求，使用本地缓存完成 MVP 验证，并保留后端升级规划。']
      }
    ]
  },
  privacy: {
    title: '隐私说明',
    subtitle: '说明 Fit Note 如何处理你的个人记录。',
    sections: [
      {
        title: '本地保存',
        lines: ['当前版本会把训练、饮食、身高、体重、计划和打卡等数据保存在当前微信小程序本地缓存中。', '当前版本不会主动上传这些数据到云端服务器。']
      },
      {
        title: '数据风险',
        lines: ['如果你清理微信缓存、删除小程序缓存或更换设备，本地记录可能丢失。', '后续如接入 CloudBase 或自建后端，可再实现多设备同步和数据备份。']
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
        title: '后端规划',
        lines: ['当前版本保留后端升级规划，但不启用云同步。后续可以接入 CloudBase 或自建后端，实现用户身份、多设备同步、数据备份和导出。']
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
