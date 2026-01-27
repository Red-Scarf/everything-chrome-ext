# Everything Chrome Extension

> 一个功能强大的 Chrome 扩展，让你在浏览器中无缝、快速地调用本地 Everything 搜索文件。

使用 **Plasmo** 框架、**TypeScript** 和 **React** 构建。已经全面汉化，界面友好。

---

## ✨ 核心特性

- **右键菜单搜索**: 选中网页上的任意文本，右键直接搜索本地文件。
- **快捷弹窗**: 点击扩展图标，在弹出框中快速输入关键词搜索。
- **页面智能集成**:
  - **JavDB 自动识别**: 在 JavDB 详情页，自动识别番号并添加 **"搜本地"** 快捷按钮。
  - **批量检测**: 在 JavDB 演员页面等列表页，**自动批量检测**所有影片的本地存储状态，并显示 **"本地"** 角标。
- **现代化 UI**: 采用 Glassmorphism (毛玻璃) 风格的深色主题弹窗，支持拖拽、自适应定位。
- **完全汉化**: 全中文界面和代码注释。

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 在 Chrome 加载扩展
- 打开 `chrome://extensions`
- 启用 "开发者模式"
- 点击 "加载未打包的扩展程序"
- 选择本目录下的 `build/chrome-mv3-dev` 文件夹 (或 `.plasmo` 文件夹)

### 4. 关键配置 (重要!)
由于本插件需要访问本地文件和识别特殊页面，请务必：
1. 在 Chrome 扩展管理页，点击本插件的 **"详细信息"**。
2. 开启 **"允许访问文件网址" (Allow access to file URLs)**。
3. 确保本地 **Everything** 服务已启动 (见下文)。

---

## 🔧 配置 Everything

插件依赖本地运行的 Everything HTTP 服务。

### 1. 启用 HTTP Server
1. 打开 Everything 软件
2. 菜单栏: `工具` -> `选项`
3. 左侧: `HTTP 服务器` -> 勾选 `启用 HTTP 服务器` (Enable HTTP server)
4. 记下端口号（默认 80 或自定义，例如 8181）

### 2. 配置 CORS (跨域访问)
为了允许浏览器插件访问本地服务，必须允许跨域：

1. 找到 `Everything.ini` 配置文件 (通常在安装目录或 `%APPDATA%\Everything`)
2. 编辑文件，找到 `[HTTP Server]` 部分
3. 添加或修改以下行：
```ini
http_server_header=Access-Control-Allow-Origin: *
```
4. **重启 Everything** 以生效。

### 3. 在插件中配置端口
1. 右键点击浏览器右上角的 Everything 扩展图标 -> `选项`
2. 输入您的服务地址，例如: `http://127.0.0.1:8181`
3. 点击保存。

---

## 📁 项目结构

```
src/
├── background.ts              # 后台脚本 (处理右键菜单、消息转发)
├── contents/
│   ├── content.ts            # 内容脚本 (页面注入、自动搜索逻辑)
│   └── styles/card.css       # 搜索结果弹窗样式 (深色主题)
├── pages/
│   ├── popup/index.tsx       # 顶部弹窗页面
│   └── options/index.tsx     # 设置页面
├── styles/                   # 全局样式
└── utils/                    # 工具库
    ├── card.ts              # 弹窗 UI 类 (拖拽、定位)
    ├── config.ts            # 配置管理
    └── search.ts            # Everything API 封装
```

---

## 🛠️ 开发与构建

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run package  # 打包发布 (生成 .zip)
```

---

## 🐛 常见问题

**Q: 为什么搜索没有反应？**
A: 请检查：
1. Everything 是否正在运行且开启了 HTTP Server？
2. `Everything.ini` 中是否添加了 CORS 配置并重启了软件？
3. 扩展选项页面中的端口地址是否正确？

**Q: JavDB 页面没有显示按钮或角标？**
A: 请刷新页面。如果是本地 HTML 文件，确保在扩展设置中开启了 **"允许访问文件网址"**。

---

## 📄 许可证
MIT

---
**最后更新**: 2026-01-28
**版本**: 1.1.0 (Refactored & Enhanced)
