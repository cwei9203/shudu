# 数独研习

原生微信小程序：显性数对、区块排除、X-Wing、XY-Wing、XYZ-Wing 五门课，以及六道精选自由玩题目。

## 运行

使用微信开发者工具导入仓库根目录。`project.config.json` 已设置源码目录与用户指定的 AppID；需要该 AppID 的开发者权限。无 npm 运行时依赖，不需要构建 npm。

```sh
npm test
npm run validate
```

测试使用 Node.js 22+ 内置测试运行器。`validate` 检查代码语法、JSON、页面入口与题库；不能替代微信原生编译。

## 学习规则

每课一个示例、一道引导题、三道独立题。独立题选择结构后，选择至少一个有效删数即可通过；任何错误删数都会被拒绝。不同但有效的同技巧结构也接受。

每课独立通过两道不同题即完成。揭示关键提示之前必须成功保存提示记录；看过关键提示的题重做也不会算独立通过。题目不足时保持“待独立验证”，仍能练习。所有课程开放。

自由玩支持笔记、擦除、撤销、冲突标记、前台计时及恢复。只保存最近一局，切后台和离开页面自动暂停。数据仅保存在当前设备。存档损坏时保留原数据并提示，不覆盖；清理微信数据或更换设备可能丢失进度。

## 内容与结构

`miniprogram/core` 保存纯业务逻辑和微信存储入口；`miniprogram/data` 是随包发布的固定题库；`miniprogram/components/board` 是共用棋盘。题库采用 CommonJS JavaScript 数据模块，避免小程序不支持直接 require JSON 的限制。

内容制作脚本仅供开发维护，不在小程序中运行，不是在线随机题目功能。题目生成后固定入库；每个局面校验唯一解、候选数及目标推理。Wing 局面保留前序单数推导记录，可从 originalBoard 重放；其他题目使用原始候选数。

## 规格与交付

- [规格](docs/spec.md)与[计划](docs/plan.md)
- [领域术语](CONTEXT.md)
- [GitHub 规格与任务](https://github.com/cwei9203/shudu/issues/1)
- [实现 PR](https://github.com/cwei9203/shudu/pull/7)
- 验证结果见 `docs/verification.md`。

自动生成训练题、云同步、任意局面下一步提示、排行榜与正式公开发布均不在本版范围内。
