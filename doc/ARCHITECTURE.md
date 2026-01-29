# Everything Chrome Extension 架构文档

## 1. 项目概述

本项目是一个基于 **Plasmo Framework** 构建的 Chrome 浏览器扩展 (Manifest V3)。它实现了在浏览器中通过右键菜单、弹窗以及**页面智能注入**直接调用本地运行的 **Everything** 搜索工具（通过 HTTP Server），并在网页上以现代化浮窗形式展示搜索结果。

### 核心技术栈

- **框架**: [Plasmo](https://docs.plasmo.com/) (v0.90.5)
- **UI 库**: Vue 3 (Composition API), Element Plus
- **语言**: TypeScript 5.x
- **样式**: CSS (Vanilla), Element Plus UI Components
- **通信**: Chrome Messaging API

---

## 2. 系统架构

系统主要由以下核心模块组成：

### 1. Background Service Worker (`src/background.ts`)
-   **职责**: 扩展的中枢。
    -   初始化右键菜单 ("使用 Everything 搜索")。
    -   监听菜单点击事件，执行搜索请求。
    -   与 Content Script 通信（发送 `showCard` 消息）。
    -   **注意**: 即使在 Content Script 可用的情况下，搜索请求目前也封装在 Utils 中，可由 Background 或 Content Script 调用。但在右键菜单场景下，由 Background 发起搜索，结果传给 Content Script。

### 2. Content Script (`src/contents/content.ts`)
-   **职责**: 运行在浏览页面上下文中，负责 UI 注入和交互。
-   **主要功能**:
    -   **结果展示**: 接收搜索结果，调用 `Card` 类渲染浮窗。
    -   **JavDB 集成 (增强版)**:
        -   **按钮注入**: 检测详情页的 "複製番號" 按钮，注入 "搜本地" 按钮。并自动检测本地状态，若存在则更新为 "本地已有" (绿色样式及勾选图标)。
        -   **自动搜索 (智能过滤)**: 页面加载后，仅在详情页 (`/v/xxx` 路径) 且存在番号元素时，根据配置自动尝试搜索。
        -   **批量检测 & 悬停交互**: 
            -   在列表页及详情页推荐位 (`tile-item`) 扫描影片，并发查询本地状态。
            -   添加 "本地" 角标，支持 **鼠标悬停 (Hover)** 直接显示文件搜索结果列表，具备 300ms 移出缓冲隐藏逻辑。
-   **权限**: 匹配所有 URL (`<all_urls>`)，包括 `file://` (需用户手动开启权限)。

### 3. Search Card UI (`src/utils/card.ts` & `card.css`)
-   **职责**: 管理浮窗的生命周期和渲染。
-   **特性**:
    -   **DOM 操作**: 纯 TS 实现，不依赖 React，确保在 Content Script 中轻量运行。
    -   **样式**: 深色毛玻璃风格，支持拖拽移动，智能边界检测（防止溢出屏幕）。
    -   **交互**: 鼠标跟随逻辑、关闭动画。

### 4. Popup Page (`src/pages/popup/index.tsx`)
-   **职责**: 浏览器工具栏弹窗，提供快速搜索入口。

### 5. Options Page (`src/pages/options/index.vue`)
-   **职责**: 基于 Vue 3 + Element Plus 的设置页面，支持配置 Everything 服务协议、主机名、端口号及高级搜索参数。

---

## 3. 数据流设计

### 3.1 自动/批量搜索流程 (JavDB 场景)
1.  **DOM Ready**: Content Script 启动 `batchCheckLocalMovies()`.
2.  **DOM 扫描**: 查找 `.movie-list .item`，提取番号 (如 "MIAB-615").
3.  **并发请求**: 使用 `Promise.all` 对每个番号调用 `searchEverything()`.
4.  **Local Request**: 浏览器直接向 `http://127.0.0.1:8181` 发起 GET 请求 (需 CORS 支持).
5.  **UI 更新**: 请求成功且有结果的 Item，通过 DOM 操作插入 `.local-badge` 元素。
6.  **悬停查看**: 用户鼠标划过角标时，立即触发 `cardObj.updateContent()`，实现无需跳转的快速预览。离开角标及卡片区域后自动隐藏。

### 3.2 右键菜单搜索流程
1.  **用户交互**: 右键点击文本 -> "使用 Everything 搜索".
2.  **Background**: 捕获点击 -> 读取配置 -> 调用 `searchEverything`.
3.  **通过**: `chrome.tabs.sendMessage(tabId, { todo: "showCard", data: results })`.
4.  **Content Script**: 监听消息 -> `cardObj.updateContent(data)` -> 显示浮窗.

---

## 4. 关键配置说明

### Everything CORS
由于扩展（运行在 `chrome-extension://` 或 `http://` 域）访问 `localhost` 属于跨域请求，必须在 `Everything.ini` 中配置：
```ini
http_server_header=Access-Control-Allow-Origin: *
```

### 文件访问权限
为了支持在本地保存的 HTML 页面 (`file:///...`) 上运行 Content Script（如测试 javdb 本地页面），用户必须在 Chrome 扩展管理页开启 **"允许访问文件网址"**。

---

## 5. 项目结构

```text
src/
├── background.ts           # Background Service Worker
├── contents/
│   ├── content.ts          # 核心业务逻辑 (注入、搜索、消息处理)
│   └── styles/card.css     # 浮窗及角标样式
├── pages/
│   ├── options/            # 设置页
│   └── popup/              # 弹窗页
├── utils/
│   ├── card.ts             # Card UI 类
│   ├── config.ts           # 配置存储
│   └── search.ts           # 搜索请求封装
└── ...
```

## 6. 安全性
-   **最小权限原则**: 虽然请求了 `<all_urls>`，但这是 Content Script 注入所必须的。
-   **数据隐私**: 搜索请求直接发送至用户本地服务器，不经过任何第三方云服务。

## 7. 功能设计规范: 设置页面 (Options Page)

为了提升用户体验并降低配置难度，配置页面将遵循以下设计规范：

### 7.1 页面功能
配置页面 (`src/pages/options/index.tsx`) 是用户连接 Everything 服务的控制台，需具备以下核心能力：

1.  **服务连接配置 (Service Connection)**
    -   **功能**: 支持精细化配置 Everything HTTP Server。
    -   **配置项**: 
        -   **协议 (Protocol)**: `http` 或 `https`。
        -   **主机 (Host)**: 默认 `127.0.0.1`。
        -   **端口 (Port)**: 默认 `8181`。
    -   **验证**: 实时组合 URL 并显示，支持对主机名和端口的格式校验。

2.  **连接健康检查 (Connection Test)** [关键特性]
    -   **功能**: 在保存前或用户主动点击时，发起一次测试请求。
    -   **逻辑**: 向目标地址发送简短的搜索请求 (如 `?search=test&count=1`)。
    -   **反馈**:
        -   ✅ **成功**: 显示绿色状态及响应延迟 (ms)。
        -   ❌ **CORS 错误**: 明确提示用户检查 `Everything.ini` 的跨域配置。
        -   ❌ **连接失败**: 提示检查 Everything 是否运行或端口是否被防火墙拦截。

3.  **高级搜索参数 (Advanced JSON)**
    -   **功能**: 允许用户自定义发送给 Everything 的额外请求参数 (JSON 格式)。
    -   **用途**: 配置排序规则 (如 `sort: date_modified`)、数量限制 (`count: 100`) 或大小写敏感设置。

### 7.2 数据存储策略
-   使用 `chrome.storage.sync` 存储配置，以便用户在多台设备登录 Chrome 时自动同步设置。
-   当配置变更时，Background Script 应通过 `chrome.storage.onChanged` 自动更新内存中的配置，无需重启扩展。

