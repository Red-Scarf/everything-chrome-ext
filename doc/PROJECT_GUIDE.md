# Everything Chrome Extension - Plasmo 项目指南

> 本文档供 AI 使用，详细说明项目结构、功能和实现细节。

## 📋 项目概述

**项目名称**：Everything Chrome Extension  
**框架**：Plasmo v0.90.5  
**语言**：TypeScript + Vue 3 + Element Plus  
**功能**：在浏览器中调用本地 Everything 搜索工具查找文件

### 核心功能
- 右键选中文本，快速搜索本地文件
- Popup 页面进行主动搜索与设置同步
- Options 页面配置 Everything 服务及搜索行为策略
- 在 JavDB 等站点自动标记“本地已有”资源，并支持悬停直接预览
- 搜索结果实时显示在支持拖拽、自动碰撞检测的浮动卡片中

---

## 🏗️ 项目结构

```
everything-chrome-ext/
├── src/
│   ├── background.ts              # 后台服务脚本
│   ├── contents/
│   │   ├── content.ts             # 内容脚本（注入网页）
│   │   └── styles/
│   │       └── card.css           # 卡片样式
│   ├── pages/
│   │   ├── popup/
│   │   │   └── index.tsx          # Popup 页面
│   │   └── options/
│   │       └── index.vue          # Options 设置页面 (Vue)
│   ├── styles/
│   │   ├── popup.css              # Popup 样式
│   │   └── options.css            # Options 样式
│   └── utils/
│       ├── card.ts                # Card 浮窗类
│       ├── config.ts              # 配置管理工具
│       └── search.ts              # 搜索和工具函数
├── plasmo.config.ts               # Plasmo 配置文件
├── package.json                   # 项目依赖
├── tsconfig.json                  # TypeScript 配置
└── manifest.json                  # Chrome 扩展清单（自动生成）
```

---

## 📁 文件详解

### 1. plasmo.config.ts
**作用**：Plasmo 扩展配置文件，定义扩展的权限、页面、脚本加载等。

**关键配置**：
```typescript
manifest: {
  permissions: ["contextMenus", "storage", "tabs"],
  host_permissions: ["<all_urls>"],
  action: { default_title: "Everything Search" },
  options_ui: { page: "src/pages/options/index.html", open_in_tab: true }
}
```

**权限说明**：
- `contextMenus` - 右键菜单
- `storage` - 本地存储配置
- `tabs` - 访问标签页信息
- `<all_urls>` - 允许所有网站访问

---

### 2. src/background.ts
**作用**：后台服务脚本，处理右键菜单事件和搜索请求。

**主要功能**：
1. **创建右键菜单**
   ```typescript
   chrome.contextMenus.create({
     id: "searchEverything",
     type: "normal",
     title: "Search with Everything",
     contexts: ["selection"],
     documentUrlPatterns: ["<all_urls>"]
   })
   ```

2. **监听菜单点击**
   - 获取选中文本
   - 调用 `searchEverything()` 执行搜索
   - 发送结果到 content script

3. **消息处理**
   - 接收来自 content script 的搜索请求（预留）

**重要方法**：
- `chrome.contextMenus.onClicked.addListener()` - 菜单点击事件
- `chrome.tabs.sendMessage()` - 发送消息到 content script

---

### 3. src/contents/content.ts
**作用**：内容脚本，注入网页中进行搜索和结果展示。

**主要功能**：
1. **初始化卡片**
   - 创建 Card 实例（全局单例）

2. **消息监听**
   ```typescript
   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     if (request.todo === "searchFilm") {
       performSearch(request.data)
     } else if (request.todo === "showCard") {
       cardObj.enable()
       cardObj.updateContent(request.data)
       cardObj.updateCursor(mouseX, mouseY)
     }
   })
   ```

3. **执行搜索流程**
   - 显示加载状态
   - 调用 API 搜索
   - 展示结果或错误提示

4.  **JavDB 集成逻辑**
    -   **路径过滤**: 自动搜索仅在 `/v/` 详情页执行。
    -   **按钮增强**: 注入按钮后执行查空，若本地有结果则更新 UI 为“本地已有”。
    -   **角标悬停**: 为本地角标（`.local-badge`）绑定 `mouseenter` 事件，触发展示结果列表。
    -   **延时隐藏**: 配合 `Card` 类的计时器，实现离开触发区域 300ms 后自动隐藏。

5.  **鼠标追踪**
    -   监听 `mouseup` 事件（右键点击）或 `mouseenter` 事件（角标悬停）以定位卡片。

---

### 4. src/utils/config.ts
**作用**：配置管理工具，处理 Everything 服务器地址和参数。

**导出函数**：

```typescript
// 获取默认配置
getDefaultConfig(): {
  baseUrl: "http://127.0.0.1",
  params: {
    c: 5,              // 结果条数
    j: 1,              // JSON 格式返回
    size_column: 1,    // 显示文件大小
    sort: "size",      // 按大小排序
    ascending: 0       // 降序
  }
}

// 从 storage 获取配置或返回默认值
getConfig(): Promise<Config>

// 保存配置到 storage
saveConfig(baseUrl: string, params?: Record<string, any>): Promise<void>
```

**Storage 键名**：
- `baseUrl` - Everything HTTP 服务器地址
- `params` - API 查询参数

---

### 5. src/utils/search.ts
**作用**：搜索相关函数库。

**导出函数**：

```typescript
/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的大小字符串，如 "1.25 MB"
 */
formatFileSize(bytes: number | string | null): string

/**
 * 解析搜索文本为关键字数组
 * 支持：空格、横杠、下划线 或 英文+数字+中文 自动分组
 * @param str - 搜索文本
 * @returns 关键字数组
 */
parseSearchText(str: string): string[]

/**
 * 构建 Everything API URL
 * @param baseUrl - API 基础地址
 * @param searchText - 搜索文本
 * @param params - API 参数
 * @returns 完整的搜索 URL
 */
buildSearchUrl(baseUrl: string, searchText: string, params: Record<string, any>): string

/**
 * 执行搜索请求
 * @param searchText - 搜索文本
 * @param baseUrl - API 基础地址
 * @param params - API 参数
 * @returns 搜索结果数组
 */
searchEverything(
  searchText: string,
  baseUrl: string,
  params: Record<string, any>
): Promise<Array<{ name: string; size: number }>>
```

**关键字解析逻辑**：
1. 先尝试用 `[ \-_]` 分隔符拆分
2. 如果无效，用正则 `/([\u4e00-\u9fa5]+)|([a-zA-Z]+)|(\d+)/g` 分组

**示例**：
- `"test-case"` → `["test", "case"]`
- `"testCase"` → `["test", "Case"]`
- `"测试文件"` → `["测试", "文件"]`

---

### 6. src/utils/card.ts
**作用**：搜索结果浮窗类，管理卡片的显示、位置、内容、拖拽等。

**Card 类**：

```typescript
class Card {
  // 初始化：创建 DOM 元素，添加事件监听
  constructor()

  // 显示卡片
  enable(): void

  // 隐藏卡片
  disable(): void

  // 显示加载状态
  showLoading(): void

  // 更新卡片内容（展示搜索结果）
  updateContent(records: SearchResult[] | null): void

  // 更新卡片位置（根据鼠标坐标和窗口大小智能定位）
  updateCursor(cursorX: number, cursorY: number): void

  // 自动隐藏逻辑
  startHideTimer(delay: number): void  // 启动隐藏计时器
  cancelHideTimer(): void              // 取消隐藏计时器

  // 内部：处理拖拽功能
  private onHeaderMouseDown(ev: MouseEvent): void
  private onMouseMove(event: MouseEvent): void

  // 内部：转义 HTML 防止注入
  private escapeHtml(text: string): string
}
```

**卡片 HTML 结构**：
```html
<div class="mySearchCard">
  <div class="mySearchCard-header">
    <h2>搜索结果</h2>
    <button class="close-button">&times;</button>
  </div>
  <div class="mySearchCard-content">
    <!-- 动态内容 -->
  </div>
</div>
```

**智能定位逻辑**（updateCursor）：
- 如果卡片会超出右边界，则靠左放置
- 如果卡片会超出下边界，则靠上放置
- 否则默认在鼠标右下方

**拖拽功能**：
- 在卡片头部按住鼠标可以拖动整个卡片
- 记录初始坐标和元素位置，监听 `mousemove` 事件

---

### 7. src/pages/popup/index.tsx
**作用**：Popup 页面，提供主动搜索界面。

**功能**：
- 搜索输入框
- 搜索按钮
- 结果显示区域
- 与 background.ts 通信发起搜索

**React 组件结构**：
```typescript
export default function PopupPage() {
  const [searchText, setSearchText] = useState("")
  const [results, setResults] = useState<string[]>([])

  const handleSearch = async () => {
    chrome.runtime.sendMessage({
      todo: "searchFilm",
      data: searchText
    }, (response) => {
      // 处理响应
    })
  }

  return (
    <div className="popup-container">
      {/* 搜索框 */}
      {/* 结果列表 */}
    </div>
  )
}
```

---

### 8. src/pages/options/index.vue
**作用**：Options 页面，基于 Vue 3 + Element Plus 配置 Everything 服务器连接信息。

**主要特性**：
- **分段配置**：支持 Protocol (http/https), Host (如 127.0.0.1), Port (如 8181) 独立配置。
- **自动预览**：实时生成完整的 API Base URL。
- **健康检查**：内置测试连接功能，验证 Everything 服务是否可达及 CORS 配置。
- **UI 组件**：使用 Element Plus 提供的 `el-form`, `el-input`, `el-button` 等组件。

**Vue 组件结构**：
```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getConfig, saveConfig } from "../../utils/config"

const form = reactive({
  protocol: 'http',
  host: '127.0.0.1',
  port: '8181',
  params: '{}'
})

// 加载配置
onMounted(async () => {
  const config = await getConfig()
  // 解析 baseUrl 到 protocol/host/port
  // ...
})

// 保存配置
const handleSave = async () => {
  // 验证与保存逻辑
}
</script>

<template>
  <div class="options-container">
    <el-form label-width="120px">
      <!-- 表单项 -->
    </el-form>
  </div>
</template>
```

---

## 🔄 核心工作流程

### 流程 1：右键菜单搜索

```
用户右键选中文本
    ↓
background.ts 监听 contextMenu 点击事件
    ↓
执行 searchEverything() 搜索
    ↓
chrome.tabs.sendMessage() 发送结果到 content.ts
    ↓
content.ts 接收 "showCard" 消息
    ↓
cardObj.updateContent() 展示结果
    ↓
cardObj.updateCursor() 定位卡片
```

### 流程 2：Popup 页面搜索（预留）

```
用户在 popup 输入搜索文本
    ↓
点击搜索按钮
    ↓
content.ts 的 performSearch() 执行搜索
    ↓
调用 searchEverything() 和 Everything API
    ↓
cardObj 展示结果
```

### 流程 3：配置管理

```
用户打开 Options 页面
    ↓
loadConfig() 从 chrome.storage 读取
    ↓
显示当前配置或默认值
    ↓
用户修改并点击保存
    ↓
saveConfig() 写入 chrome.storage
    ↓
下次搜索时使用新配置
```

---

## 🔗 API 接口说明

### Everything HTTP API

扩展与本地 Everything 通过 HTTP 通信。

**基础 URL**：`http://127.0.0.1:80/query=...`（可配置）

**请求参数**：
```
search=keyword+keyword2   # 搜索关键字，空格分隔
c=5                       # 限制结果条数（默认5）
j=1                       # 返回 JSON 格式（1=JSON, 0=CSV）
size_column=1             # 包含文件大小列
sort=size                 # 排序方式（size=按大小）
ascending=0               # 排序顺序（0=降序, 1=升序）
```

**请求示例**：
```
http://127.0.0.1:80/?search=test+file&c=5&j=1&size_column=1&sort=size&ascending=0
```

**响应格式**：
```json
{
  "results": [
    { "name": "test.txt", "size": 1024 },
    { "name": "testfile.doc", "size": 2048 }
  ]
}
```

### 浏览器 API 调用

**消息传递**：
```typescript
// background → content
chrome.tabs.sendMessage(tabId, { todo: "showCard", data: results })

// content → background（预留）
chrome.runtime.sendMessage({ todo: "searchFilm", data: searchText })
```

**存储接口**：
```typescript
// 保存
chrome.storage.local.set({ baseUrl, params })

// 读取
const result = await chrome.storage.local.get(["baseUrl", "params"])
```

**右键菜单**：
```typescript
chrome.contextMenus.create({ id, title, contexts })
chrome.contextMenus.onClicked.addListener((info, tab) => {})
```

---

## ⚙️ 关键配置说明

### Everything 服务器配置

**默认配置** (src/utils/config.ts)：
```typescript
{
  baseUrl: "http://127.0.0.1",
  params: {
    c: 5,
    j: 1,
    size_column: 1,
    sort: "size",
    ascending: 0
  }
}
```

**可用参数**：
- `c`: 结果条数限制，默认 5
- `j`: 返回格式（1=JSON）
- `size_column`: 是否显示文件大小
- `sort`: 排序字段（size, name 等）
- `ascending`: 排序顺序

### Chrome 权限配置

**manifest 权限** (plasmo.config.ts)：
```json
{
  "permissions": ["contextMenus", "storage", "tabs"],
  "host_permissions": ["<all_urls>"]
}
```

**权限说明**：
- `contextMenus` - 创建右键菜单
- `storage` - 使用 chrome.storage API
- `tabs` - 访问标签页信息（sendMessage）
- `<all_urls>` - 在所有网站注入内容脚本

---

## 🛠️ 开发指南

### 常见扩展点

**1. 添加新的搜索参数**

在 `src/utils/config.ts` 的 `getDefaultConfig()` 中添加参数。

**2. 修改搜索逻辑**

编辑 `src/utils/search.ts` 中的 `parseSearchText()` 或 `buildSearchUrl()`。

**3. 自定义卡片样式**

修改 `src/contents/styles/card.css` 中的 `.mySearchCard` 类。

**4. 添加新的右键菜单项**

在 `src/background.ts` 中调用 `chrome.contextMenus.create()` 添加新项。

**5. 扩展 Popup 功能**

编辑 `src/pages/popup/index.tsx` 的 React 组件。

### 调试技巧

**查看后台脚本日志**：
1. 进入 `chrome://extensions`
2. 找到扩展，点击「Service Worker」

**查看 content script 日志**：
1. 打开网页，按 F12 打开开发者工具
2. console 中可见 content script 输出

**调试消息传递**：
```typescript
// 添加日志
console.log("Sending message:", { todo, data })
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request)
  sendResponse(request)
})
```

---

## 📦 构建和部署

### 开发模式

```bash
npm install
npm run dev
```

### 生产构建

```bash
npm run build
```

生成的产物在 `build/` 目录，可直接在浏览器中加载。

### 打包扩展

```bash
npm run package
```

生成可发布的 `.zip` 文件。

---

## 🔒 安全考虑

1. **XSS 防护**：`Card.escapeHtml()` 防止用户输入被注入
2. **Content Security Policy**：遵守 Plasmo 的 CSP 规则
3. **权限最小化**：仅请求必需的权限
4. **消息验证**：始终验证消息的 `todo` 字段

---

## 📝 TypeScript 类型定义

```typescript
// 搜索结果
interface SearchResult {
  name: string
  size: number
}

// 配置对象
interface Config {
  baseUrl: string
  params: Record<string, any>
}

// 消息格式
interface Message {
  todo: "searchFilm" | "showCard"
  data: string | SearchResult[]
}
```

---

## 🐛 已知问题和待办

- [ ] Options 页面配置存储在 `sync` 但 content.ts 读取 `local`（需统一）
- [ ] Popup 页面搜索功能完整实现
- [ ] 添加搜索历史记录功能
- [ ] 支持多关键字过滤
- [ ] 自定义结果列显示

---

## 📚 相关文档

- [Plasmo 官方文档](https://docs.plasmo.com)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Everything HTTP API](https://www.voidtools.com/support/everything/http/)

---

**文档更新日期**：2026-01-26  
**项目版本**：1.0.0  
**Plasmo 版本**：0.90.5
