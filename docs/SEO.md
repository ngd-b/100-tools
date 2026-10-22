# SEO 配置与验收

当前页面结构是首页、6 个分类页、54 个独立工具页，共 61 个可收录页面。工具数量变化时，站点地图会随注册表生成。

## 正式域名

正式站点地址已确认为 `https://tools.hboot.fun`，应用默认使用此地址。`SITE_URL` 可在构建前覆盖该值，统一决定 canonical、Open Graph URL、结构化数据和 sitemap 中的域名。

```dotenv
SITE_URL=https://tools.hboot.fun
SITE_INDEXABLE=true
```

本地开发可将 `.env.example` 复制为 `.env.local`。配置由服务端读取，不从请求的 Host 头推断。

未填写或留空 `SITE_URL` 时，应用、Docker 和 GitHub Actions 均回退到已确认的正式地址，不需要额外创建仓库变量才能生成完整的 SEO 地址。部署到其他域名时，显式覆盖该变量。

预览环境设置 `SITE_INDEXABLE=false` 后重新构建，页面会输出 noindex，robots 禁止抓取，sitemap 不列出预览页面。本地域名与开发模式也不会启用索引。

这些页面在构建时生成。修改站点地址或索引设置后需要重新构建，单独修改运行容器的环境变量不会更新已经生成的页面。

## Docker 与自动部署

Docker 的 builder 和 runner 均支持 `SITE_URL`、`SITE_INDEXABLE` 构建参数。构建示例：

```bash
docker build --build-arg SITE_URL="$SITE_URL" --build-arg SITE_INDEXABLE=true -t 100-tools:latest .
```

需要覆盖默认配置时，可在 GitHub Actions 中配置仓库 Variables：

- `SITE_URL`：可选覆盖正式根地址；省略时为 `https://tools.hboot.fun`。
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
SEO_BASE_URL=http://127.0.0.1:3000 npm run check:seo
```

`check:seo` 检查生产构建的 61 个页面，包括 canonical、标题与描述唯一性、分享信息、服务端正文、JSON-LD、sitemap 与页面一致性、robots、旧地址 308、404、追踪参数归一化和分享图片格式尺寸。默认严格检查正式域名；验收其他域名时，构建及验收命令均应传入相同的 `SITE_URL`。

单元测试使用保留的 `tools.example` 域名作为隔离测试数据，不把该域名作为应用默认值。

本轮本地验收：32 项单元测试、类型检查、改动文件定向 lint 和生产构建通过；使用正式域名配置构建后，61 个页面的完整 SEO 检查通过。全仓旧工具的 lint 历史问题仍见 [路线图](../ROADMAP.md#本轮验收)，未将其记为全仓通过。

另已验证预览构建的 noindex、robots 禁止抓取和空 sitemap；默认构建统一使用已确认的正式域名，不输出测试域名或 localhost 的 SEO 地址。

网站上线后，还需用真实站点在搜索平台查看抓取与收录情况。搜索平台的站点验证、sitemap 提交及收录结果不属于本地代码检查，也未在本轮工作中执行。
