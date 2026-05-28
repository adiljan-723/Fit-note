# Fit Note 后端规划目录

当前版本：`v0.9.1 本地稳定版`

当前小程序运行时不依赖云开发，不会主动调用云函数或云数据库。数据优先保存在微信小程序本地缓存中。

本目录保留为后续后端升级规划，方便以后继续扩展为 CloudBase 或自建后端版本。

## 后续可选云函数规划

```text
cloudfunctions/
├── login/              获取 openid 和用户身份
├── exportRecords/      导出训练/饮食记录 CSV
├── getStats/           生成训练统计
└── syncUserData/       云端同步辅助逻辑
```

## 后续可选云数据库集合

```text
users              用户身份
user_profiles      用户资料
training_records   训练记录
diet_records       饮食记录
workout_plans      训练计划
checkins           打卡记录
```

## 当前处理原则

- 当前版本不启用云同步，避免未开通云开发资源时产生报错。
- `login` 云函数代码仅作为后端升级参考，不是当前运行必需项。
- 如后续决定接入 CloudBase，需要先开通小程序云开发环境，再替换环境 ID、部署云函数、创建集合和配置权限。
