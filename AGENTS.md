# 项目约定

非必要情况下使用单行注释，而非多行注释。
默认遵循 `/Users/chen_wei/Documents/Skill-Library/enabled/i-have-adhd/SKILL.md` 和 `/Users/chen_wei/Documents/Skill-Library/enabled/caveman/SKILL.md`，直到用户关闭对应模式。

## Agent skills

### Issue tracker
规格和任务使用 GitHub 仓库 cwei9203/shudu。见 docs/agents/issue-tracker.md。

### Triage labels
使用默认五个状态标签。见 docs/agents/triage-labels.md。

### Domain docs
单一领域上下文；术语见 CONTEXT.md，必要的决策见 docs/adr/。见 docs/agents/domain.md。

## 实现与验证
原生小程序使用 CommonJS JavaScript、WXML、WXSS，无运行时第三方依赖。
只通过训练提交、课程进度、自由玩操作与恢复三个行为接口测试业务；题库另做完整性校验。
运行 `npm test` 和 `npm run validate`。不要把令牌、私有配置或预览二维码提交到仓库。
