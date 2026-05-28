# Fit Note 云函数目录

当前项目已接入 CloudBase 云开发环境初始化。

环境 ID：`ai-native-d2g6w34udacbb193d`

后续云函数建议按功能拆分：

```text
cloudfunctions/
├── login/              获取 openid 和用户身份
├── exportRecords/      导出训练/饮食记录 CSV
├── getStats/           生成训练统计
└── syncUserData/       云端同步辅助逻辑
```

当前版本已创建 `login` 云函数，用于获取微信小程序用户 openid，并维护 `users` 集合中的登录信息。

v0.9.0 已接入本地 + 云端同步基础能力：

```text
users              云函数维护的用户登录信息
user_profiles      用户资料
training_records   训练记录
diet_records       饮食记录
workout_plans      训练计划
checkins           打卡记录
```

后续仍可继续扩展：

- `exportRecords`：导出训练/饮食记录 CSV
- `getStats`：在云端聚合训练统计
- `syncUserData`：将当前客户端直连同步升级为统一云函数同步
