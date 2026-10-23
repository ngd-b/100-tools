# 新工具逐项验收（2026-10-23）

每个工具独立实现、验证并提交。测试环境 Node 24.14.1（低于项目声明的 24.22.1 基线）；浏览器为本机 Chrome 无头模式，桌面 1365px / 手机模拟 390px，未覆盖真机。

## JSON ↔ CSV

- `npm test`：40/40 通过，新增 CSV 引号、换行、Unicode、分隔符、特殊键、非法数据与精度边界测试。
- `npx tsc --noEmit`、新增文件定向 ESLint：通过。
- `npm run build -- --webpack`：通过。默认 Turbopack 在当前执行环境绑定端口失败，使用 Webpack 验证生产构建。
- Chrome：示例转换、Tab 分隔、嵌套结构错误、CSV 下载、中英文页面、两种宽度无横向溢出、无运行时异常。
