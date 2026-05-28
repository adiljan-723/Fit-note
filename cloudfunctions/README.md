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

当前版本暂未创建实际云函数，训练、饮食、计划数据仍使用小程序本地缓存。
