# 改完代码，自动替你点一遍

> 一个**完全离线、能当场跑通**的样品。推到 GitHub 公开，就是你的门面：客户点开就能看懂，不用你解释。
> 不连外网练习站、不需要账号、不碰任何真实环境或生产数据。

## 给不看代码的人看的部分

**它解决什么**：一个人做产品，用 AI 加功能很快，但经常「改了 A、悄悄坏了 B」。改完优惠券结果登录挂了、加了新设置项结果老快捷键失效了，这类问题上线前看不出来，往往等用户踩到才发现。每次改完把关键流程手点一遍太烦，赶时间就跳过了。

**它做什么**：把最不能出事的几条流程（登录、错误密码、加购物车、完整下单、退出）写成自动检查，每次提交代码自动跑一遍。哪一步坏了，自动留下截图、录屏和一页报告，直接告诉你「第 3 步不对」。

**它不做什么**：不改业务代码，不碰生产数据，不承诺零 bug。只做一件事——让「改 A 坏 B」在上线前被发现。

**三分钟亲眼看到效果**：

```bash
npm test                    # 5 条全绿
npm run demo:v2 && npm test  # 换一套完全不同的页面结构，用例一个字没改，还是全绿
npm run demo:broken && npm test  # 故意改坏一处，红 1 条，报告里留下失败截图
npm run demo:v1             # 切回正常版
```

三次跑完，`playwright-report/` 里就是可以直接发给客户看的证据。

---

## 给写代码的人看的部分

### 跑起来

```bash
npm install
npx playwright install chromium
npm test
```

报告在 `playwright-report/`，跑 `npm run report` 打开。本地站点由 Playwright 自动拉起，不用手动开服务。

### 为什么按「用户操作」写而不是按元素写

AI 生成或重构过的页面，DOM 结构、class、id 说变就变。绑死 `#submit-btn` 的用例，下次改版就全红；绑「提交订单」这个动作的用例，只要用户还能这么操作，就一直有效。

这个仓库里有 `demo-site/v1` 和 `demo-site/v2` 两套演示站：**功能一模一样，DOM 完全不一样**（div+id 换成语义化 form/section/article，class 全换、层级全变、按钮挪进工具栏、还加了装饰层）。`tests/smoke.spec.ts` 里没有出现任何 id / class / `data-testid` / XPath，`npm run demo:v2` 之后一个字不改照样全绿。

这就是回答客户那句质疑的实证：**「AI 天天改页面，你的脚本两周就烂吧？」** —— 不会，而且当场能演示。

### 目录

| 文件 | 作用 |
|---|---|
| `tests/smoke.spec.ts` | 5 条核心流程，全部用 `getByRole` / `getByLabel` / 可见文字定位 |
| `playwright.config.ts` | 失败截图 / 录屏 / trace / HTML 报告，自动拉起本地站点 |
| `.github/workflows/e2e.yml` | 每次 push / PR 自动跑，v1 与 v2 两套 DOM 都必须全绿 |
| `demo-site/server.js` | 零依赖本地静态服务，每次请求重读版本，切版本不用重启 |
| `demo-site/switch.js` | 切换 v1 / v2 / broken 三个版本 |
| `demo-site/v1` `v2` `broken` | 原始 DOM、重构后 DOM、故意改坏的一版 |
| `demo-site/version.txt` | 当前版本，默认 `v1` |

### 推到你的 GitHub（这一步你本人做）

```bash
cd sample-repo
git init
git add .
git commit -m "e2e regression sample"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

推之前先删掉 `node_modules/`、`playwright-report/`、`test-results/`（加一份 `.gitignore`）。仓库设为 Public，客户才点得开。

### 改成客户项目时，替换这四处

1. `playwright.config.ts` 里的 `baseURL` 换成客户测试环境（**绝不要指向生产**）
2. `tests/` 里的账号换成脱敏测试账号，绝不用生产数据
3. 把 5 条示例流程换成客户真正不能出事的那几条，控制在 5–10 条，别贪多
4. 在 CI 里加一步把失败报告推到飞书 / 企业微信 / Slack（webhook 由客户提供）

### 交付前自检

- [ ] 故意改坏一处，确认能被拦下并留下截图（演示给客户看，成交率最高的一步）
- [ ] 确认没动业务代码，所有改动都在独立目录
- [ ] 交接文档写清：怎么跑、怎么看报告、怎么加用例、怎么删
- [ ] 附一份「本次拦下了哪些问题」清单，这是你的下一个案例素材

> 演示站是纯本地静态页面，只为展示回归检查的原理；正式项目只用客户测试环境。
