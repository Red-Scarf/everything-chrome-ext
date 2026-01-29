# 快速测试清单

## ⚡ 1 分钟快速开始

```bash
# 1. 安装依赖（如果还没装）
npm install

# 2. 启动开发服务器
npm run dev

# 等待看到：
# 🔔 Listening on http://localhost:portnumber
# 🔔 To view your extension, open:
# chrome://extensions
# 然后加载 .plasmo 文件夹
```

---

## ✅ 测试步骤（3 分钟）

### 第 1 步：加载扩展（1 分钟）

- [ ] 打开 `chrome://extensions`
- [ ] 启用 "开发者模式"（右上角）
- [ ] 点击 "加载未打包的扩展程序"
- [ ] 选择 `.plasmo` 文件夹
- [ ] 确认扩展出现在列表中

### 第 2 步：验证右键菜单（1 分钟）

- [ ] 打开任意网页
- [ ] 选中文本
- [ ] 右键点击
- [ ] 应该看到 "Search with Everything"

**如果没看到**：
- 重新加载扩展
- 刷新网页
- 查看 Console 是否有错误（F12）

### 第 3 步：测试搜索（1 分钟）

- [ ] Everything 程序已启动
- [ ] HTTP 服务已启动（重要！）
- [ ] 右键选中文本 → "Search with Everything"
- [ ] 应该看到搜索卡片和结果
- [ ] 如果无结果，检查 Everything 中是否有该文件

**如果搜索失败**：
```
Chrome DevTools → F12 → Console
查看错误信息

常见错误：
- "Network response was not ok" → Everything 服务未启动或地址错误
- "Content script not available" → 内容脚本未加载
```

---

## 🔧 Everything HTTP 服务配置

### 检查清单

```
□ Everything 程序已安装
□ Everything 程序正在运行
□ HTTP Server 已启用（Tools → Options → HTTP Server）
□ HTTP Server 端口正确（默认 80）
□ Everything.ini 已配置 CORS：
  http_server_header=Access-Control-Allow-Origin: *
□ Everything 程序已重启
```

### 快速验证

在浏览器地址栏输入：

```
http://localhost:80/?search=*.txt&j=1
```

如果返回 JSON，说明服务正常：

```json
{
  "results": [
    { "name": "file1.txt", "size": 1024 },
    ...
  ]
}
```

---

## 🐛 常见问题速查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 右键菜单不显示 | 权限问题或扩展未启用 | 重新加载扩展、刷新网页 |
| 搜索无结果 | Everything 未启动或地址错误 | 检查 Everything 运行、验证 HTTP 服务 |
| 卡片不显示 | content script 未加载 | 检查权限、查看 Console 错误 |
| 修改代码无效 | 未刷新扩展或网页 | `chrome://extensions` 刷新 + F5 网页 |
| 配置无法保存 | storage 权限问题 | 重新加载扩展、清除扩展数据 |

---

## 📌 关键命令

```bash
# 开发模式（推荐）
npm run dev

# 生产构建
npm run build

# 查看依赖版本
npm list plasmo react

# 清理缓存
rm -rf node_modules .plasmo build
npm install
```

---

## 🖥️ Chrome DevTools 快速导航

```
F12                          # 打开开发者工具
chrome://extensions          # 扩展管理页面
chrome://extensions/         # 扩展管理（带 Service Worker）
右键 → 检查元素              # 查看网页 DOM
F5 或 Ctrl+R                 # 刷新网页
Ctrl+Shift+R                 # 硬刷新（清除缓存）
```

---

## 📸 预期结果

### 右键菜单正常

```
右键 → 应该看到菜单：
┌─────────────────────────┐
│ 返回                    │
│ 前进                    │
│ 重新加载                │
│ 在新选项卡中打开链接     │
│ ───────────────────────│
│ Search with Everything  │ ← 我们的菜单项
│ ───────────────────────│
│ 删除选定内容             │
│ 检查拼写                │
└─────────────────────────┘
```

### 搜索卡片正常

```
网页上应该出现：
┌──────────────────────┐
│ 搜索结果          ×  │
├──────────────────────┤
│ 文件名      │  大小   │
├──────────────────────┤
│ test.txt    │ 1.2 KB  │
│ file.doc    │ 5.6 MB  │
│ data.xlsx   │ 2.3 MB  │
└──────────────────────┘
(可以拖拽)
```

---

## 📝 测试记录

### 首次测试

```markdown
日期：____年____月____日
Chrome 版本：__________
Everything 版本：________

测试项 | 结果 | 备注
-----|------|-----
扩展加载 | [ ] 成功 [ ] 失败 |
菜单显示 | [ ] 成功 [ ] 失败 |
搜索执行 | [ ] 成功 [ ] 失败 |
结果显示 | [ ] 成功 [ ] 失败 |
卡片交互 | [ ] 成功 [ ] 失败 |

遇到问题：
_________________________________

解决方案：
_________________________________
```

---

## 🔗 相关文档

- [详细测试指南](./LOCAL_TESTING_GUIDE.md)
- [项目架构指南](./PROJECT_GUIDE.md)
- [Plasmo 官方文档](https://docs.plasmo.com)

---

**最后更新**：2026-01-26
