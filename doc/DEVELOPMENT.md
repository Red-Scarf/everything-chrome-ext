# 开发与调试指南

## 环境准备

1.  **Node.js**: 推荐 v18+。
2.  **Package Manager**: npm 或 pnpm。
3.  **Everything**: Windows 本地搜索工具。
    -   **配置要求**:
        1. 打开 Everything -> 工具 -> 选项 -> HTTP 服务器。
        2. 勾选 "启用 HTTP 服务器"。
        3. 修改 `Everything.ini` (通常在安装目录或 `%APPDATA%\Everything`)，在 `[HTTP Server]` 节下添加：
           ```ini
           http_server_header=Access-Control-Allow-Origin: *
           ```
        4. 重启 Everything。

## 开发命令

本项目基于 Plasmo，使用 npm scripts 进行管理。

```bash
# 安装依赖
npm install

# 启动开发服务器 (热重载)
# 编译产物会生成在 .plasmo/ 目录
npm run dev

# 生产环境构建
# 产物生成在 build/chrome-mv3-prod/ 目录
npm run build

# 打包发布 (生成 zip)
npm run package
```

## 调试流程

1.  运行 `npm run dev`。
2.  打开 Chrome 浏览器，访问 `chrome://extensions/`。
3.  开启右上角 **开发者模式 (Developer mode)**。
4.  点击 **加载已解压的扩展程序 (Load unpacked)**。
5.  选择项目根目录下的 `.plasmo/` 文件夹（注意不是 `build/`，除非你是测试生产构建）。

### 常见问题排查

-   **搜索无反应**:
    -   检查 Background Service Worker 的 Console (在 `chrome://extensions` 点击 "Service Worker" 查看)。
    -   检查 Content Script 的 Console (在当前网页 F12 查看)。
    -   确认 Everything HTTP Server 是否启动，且端口正确（默认 80 或 8181，需在 Extension Options 页面配置一致）。

-   **CORS 错误**:
    -   这是最常见问题。确保你修改了 `Everything.ini` 并重启了 Everything 软件。单纯在软件界面设置是不够的，必须手动加 header 配置。

-   **样式不加载**:
    -   Plasmo 会将 CSS 注入 Shadow DOM 或作为 Content Script 样式注入。如果修改 CSS 未生效，尝试在 `chrome://extensions` 点击刷新按钮重载扩展。

## 目录规范

-   **新建文件**: 所有代码文件放在 `src/` 下。
-   **组件**: Vue 组件放在 `src/components/` (如有)。
-   **工具类**: 纯逻辑代码放在 `src/utils/`。
-   **样式**: 全局样式放在 `src/styles/`，组件私有样式建议使用 CSS Modules 或同目录 CSS 文件。
    -   **文件名**: 
    -   文件夹: 小写 (kebab-case)
    -   Vue/TS 文件: Vue 组件建议 PascalCase (如 `OptionsPage.vue`)，工具函数使用 camelCase (`config.ts`)。

## 发布流程

1.  运行 `npm run build` 确保构建无误。
2.  运行 `npm run package` 生成 zip 包。
3.  在 `build/` 目录下找到生成的 zip 文件用于上传 Chrome Web Store。
