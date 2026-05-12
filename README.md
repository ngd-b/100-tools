# 100-tools — 免费在线工具合集

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

无需注册，打开即用。提供颜色、图片、音频、文本、开发等各类实用在线工具。

## 工具列表（29 个）

### 颜色工具

- 颜色工具箱 — 拾取、格式转换、调色板
- 渐变色生成器 — 可视化调节双色/多色渐变
- 对比度检测 — WCAG 对比度等级
- CSS 阴影生成器 — box-shadow / text-shadow 可视化
- CSS 滤镜生成器 — blur / brightness / contrast 等
- 随机调色板 — 和谐配色方案

### 图片工具

- 图片裁剪 — 拖拽选区，透明遮罩，Canvas 裁剪
- 图片抠图 — 一键去除图片背景
- 图片压缩 — Canvas 压缩，质量可调
- 图片水印 — 文字水印，位置/透明度可调
- 图片格式转换 — PNG / JPEG / WebP 互转
- 图片尺寸调整 — 调整宽高，保持/裁剪比例
- GIF 制作器 — 多帧合成，内置 LZW 编码器，可调帧速/循环
- 二维码生成器 — 自动版本，EC Level M 纠错

### 音频工具

- 文本转语音 — 文字转语音，多语言支持
- 音频录制与转换 — 录制麦克风音频，多格式转换导出
- 白噪音生成器 — 环境音，可后台播放
- 音频波形可视化 — 实时波形/频谱

### 文本工具

- Base64 编解码 — 文本与 Base64 互转
- 字数统计 — 字符数、词数、阅读时间
- HTML 实体编码 — 特殊字符转义
- Lorem Ipsum 生成器 — 占位文本生成
- Markdown 预览器 — 实时编辑与预览

### 开发工具

- JSON 格式化 — 校验、格式化、压缩
- 时间戳转换 — Unix 时间戳与日期互转
- URL 编解码 — 特殊字符安全处理
- 正则表达式测试 — 实时匹配测试
- 密码生成器 — 安全随机密码
- JWT 解码器 — 解析 Token 内容

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问。

## Docker 部署

```bash
docker-compose up -d
```

应用监听 `127.0.0.1:3000`，建议通过反向代理暴露到公网。

## CI/CD

推送 `v*` tag 自动触发构建部署：

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

## License

[MIT](LICENSE)
