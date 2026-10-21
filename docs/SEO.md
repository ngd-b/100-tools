# SEO 配置与验收

当前页面结构是首页、6 个分类页、54 个独立工具页，共 61 个可收录页面。工具数量变化时，站点地图会随注册表生成。

## 正式域名

构建前配置 `SITE_URL` 为正式站点的完整根地址。它统一决定 canonical、Open Graph URL、结构化数据和 sitemap 中的域名。

```dotenv
# 示例地址，仅演示格式；部署时必须替换为实际域名。
SITE_URL=https://your-domain.example
SITE_INDEXABLE=true
```

本地开发可将 `.env.example` 复制为 `.env.local` 后填写。配置由服务端读取，不从请求的 Host 头推断，也没有默认的生产域名。

未填写 `SITE_URL` 时，不生成猜测的 canonical、结构化数据绝对地址或 sitemap 条目；现有页面仍能访问。因此未配置正式域名的部署不能视为完成 SEO 上线验收。

预览环境设置 `SITE_INDEXABLE=false` 后重新构建，页面会输出 noindex，robots 禁止抓取，sitemap 不列出预览页面。本地域名与开发模式也不会启用索引。

这些页面在构建时生成。修改站点地址或索引设置后需要重新构建，单独修改运行容器的环境变量不会更新已经生成的页面。

## Docker 与自动部署

Docker 的 builder 和 runner 均支持 `SITE_URL`、`SITE_INDEXABLE` 构建参数。构建示例：

```bash
docker build --build-arg SITE_URL="$SITE_URL" --build-arg SITE_INDEXABLE=true -t 100-tools:latest .
```

GitHub Actions 中配置仓库 Variables：

- `SITE_URL`：正式根地址。
- `SITE_INDEXABLE`：正式站点为 `true`，预览站点为 `false`；省略时默认为 `true`。

工作流只传递配置，没有在本轮工作中触发远程构建或部署。`.env*` 不进入 Docker 构建上下文。

## 已实现的页面能力

- 首页、分类页、工具页各自拥有标题、描述和指向自身的 canonical。
- 分享信息包含 Open Graph、Twitter Card 和 1200×630 PNG 图片。
- 工具页在服务端 HTML 中提供独立的功能介绍、三个操作步骤及适用范围，工具交互代码继续按需加载。
- 分类页提供可直接访问的聚合内容，首页、工具面包屑和同类导航均链接到分类页。
- JSON-LD 描述集合页、工具 WebApplication 和工具面包屑，内容与可见说明一致，不填写虚构评分或评论。
- `/sitemap.xml` 仅列出首页、分类页与工具的规范地址；不列出旧地址、查询参数或 hash，不伪造更新时间。
- `/robots.txt` 声明抓取规则和 sitemap 地址。
- 旧地址永久重定向到规范地址，未知工具与分类返回 404；追踪参数不进入 canonical。

内容来源为 `src/data/tool-guides.ts` 和 `src/data/category-guides.ts`。新增工具时需要提供对应说明；自动化测试会检查覆盖范围和标题、描述是否重复。

## 验证

使用 Node.js 22.18+ 或 24+，完成构建并启动站点后运行：

```bash
npm test
npm run build
npm run start
# 在另一个终端中运行，可按实际本地端口调整：
SITE_URL="$SITE_URL" SEO_BASE_URL=http://127.0.0.1:3000 npm run check:seo
```

`check:seo` 检查生产构建的 61 个页面，包括 canonical、标题与描述唯一性、分享信息、服务端正文、JSON-LD、sitemap 与页面一致性、robots、旧地址 308、404、追踪参数归一化和分享图片格式尺寸。该检查要求构建时已经配置可索引的站点地址。

当前单元测试使用保留的 `tools.example` 域名作为隔离测试数据，不把该域名作为应用默认值。正式域名确定后，应以正式配置重新构建并执行相同验收。

本轮本地验收：31 项单元测试、类型检查、改动文件定向 lint 和生产构建通过；使用隔离测试域名构建后，61 个页面的完整 SEO 检查通过。全仓旧工具的 lint 历史问题仍见 [路线图](../ROADMAP.md#本轮验收)，未将其记为全仓通过。

另已验证预览构建的 noindex、robots 禁止抓取和空 sitemap；未配置域名的默认构建不会在页面 head 中输出测试域名、localhost 或猜测的 canonical。

网站上线后，还需用真实站点在搜索平台查看抓取与收录情况。搜索平台的站点验证、sitemap 提交及收录结果不属于本地代码检查，也未在本轮工作中执行。
