# 安全升级记录

## 2026-10-23

项目通过 Node.js 运行 Next.js standalone 服务。此次将构建和运行镜像从浮动的 `node:22-alpine` 升级为 `node:24.22.1-alpine`，本地版本基线写入 `.nvmrc` 和 `package.json` 的 `engines.node`。`pull: true` 让部署构建重新获取指定版本的基础镜像；未来 Node 安全更新仍需同步修改版本基线。

Node.js 24.22.1 是 2026-10-21 的安全版本，包含 DNS、TLS 和 Brotli 高危问题修复，参见 [官方安全发布说明](https://nodejs.org/en/blog/release/v24.22.1)。旧镜像配置未固定具体 Node 补丁版本，因此不能仅凭 `22-alpine` 判断线上容器的实际补丁水平。

同步更新：

- Next.js / eslint-config-next：16.2.4 → 16.4.2。
- React / React DOM：19.2.4 → 19.2.9。
- Node.js 类型定义：20.x → 24.x。
- shadcn：4.5.0 → 4.22.1，移动到开发依赖；项目在构建时导入它的 CSS，不需要部署其组件生成 CLI。
- 使用非强制的 `npm audit fix` 更新兼容范围内的间接依赖，包括 sharp 0.35.5；没有执行破坏性降级或关闭审计规则。

Next.js 当前安全公告包含 [Image Optimization SVG RCE](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) 和 [`use cache` typed arrays RCE](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)。公告中的受影响版本不等于本项目一定具备对应利用条件，此次统一升级到修复版本。

## npm 审计结果与边界

审计使用官方 `https://registry.npmjs.org`；原 npm 镜像源不提供安全审计接口，返回 404 不能视为无漏洞。

| 范围 | 升级前 | 升级后 |
| --- | --- | --- |
| 全量 npm 依赖 | 2 严重、19 高危、5 中危、2 低危 | 9 高危，0 严重、中危、低危 |
| 生产 npm 依赖 | 未单独记录 | 0 项公告 |

剩余 9 项是同一个底层 `braces <=3.0.3` 漏洞及其依赖传播记录，包括 ESLint 的 Next.js 插件、fast-glob、micromatch、shadcn 和 ts-morph。该 [CVE-2026-93687 公告](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 当前明确没有已发布补丁。它们仍存在于开发/构建依赖中，不应宣称全项目高危漏洞已经清零。没有通过降级框架、禁用 lint 或隐藏告警来消除此记录；后续应跟进上游修复。

```bash
npm run audit:production
npm audit --registry=https://registry.npmjs.org
```

`audit:production` 在存在生产高危或严重漏洞时失败。Docker 构建也执行该命令；它不取代完整审计。npm 审计覆盖包依赖，不能证明容器操作系统和 Node 内置依赖不存在漏洞。

## 验证

使用从 Node.js 官方下载并以官方 SHASUMS256 校验的 Node 24.22.1 完成验证：37 项测试、TypeScript 检查、生产构建和 122 页 SEO 检查通过。浏览器验证了语言自动选择、手动缓存与恢复、54 个英文工具页、中文输入数据保留以及 320px 布局，无运行错误。升级不会修改开发机的全局 Node 安装；已有开发环境应执行 `nvm use` 或自行切换到符合 engines 的版本。

本机 Docker daemon 未运行，无法完成本地镜像构建或镜像漏洞扫描。官方镜像标签已在 [Docker Official Images 清单](https://raw.githubusercontent.com/docker-library/official-images/master/library/node) 中核对；容器构建和线上运行版本需要在后续发布时验证。
