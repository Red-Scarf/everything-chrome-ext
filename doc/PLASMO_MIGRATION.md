## 第三阶段：内容脚本迁移 ✅

### 已完成的任务：

1. **✅ 创建工具函数库**
   - `src/utils/config.ts` - 配置管理
     - `getDefaultConfig()` - 获取默认配置
     - `getConfig()` - 从 storage 获取配置
     - `saveConfig()` - 保存配置
   
   - `src/utils/search.ts` - 搜索相关函数
     - `formatFileSize()` - 文件大小格式化
     - `parseSearchText()` - 关键字解析（支持多种分隔符）
     - `buildSearchUrl()` - 构建 API URL
     - `searchEverything()` - 执行 API 搜索
   
   - `src/utils/card.ts` - 卡片组件类
     - `Card` 类（完整重写为 TypeScript）
     - 完整的事件处理（鼠标移动、拖拽、关闭）
     - 结果展示和加载状态

2. **✅ 重构内容脚本**
   - 文件：`src/contents/content.ts`
   - 功能：
     - 监听后台脚本消息
     - 追踪鼠标位置
     - 执行搜索并展示结果
     - 错误处理
   - 依赖项已导入：Card 类、config、search 函数

3. **✅ 重构后台脚本**
   - 文件：`src/background.ts`
   - 功能：
     - 创建右键菜单项（"Search with Everything"）
     - 监听菜单点击事件
     - 执行搜索
     - 将结果发送到 content script
     - 错误处理和日志

4. **✅ 样式文件迁移**
   - `src/contents/styles/card.css` - 卡片样式（来自原 css/card.css）
   - 已添加 z-index 优化

### 项目结构现状：

```
src/
├── background.ts                 ✓ 后台脚本
├── contents/
│   ├── content.ts               ✓ 内容脚本
│   └── styles/
│       └── card.css             ✓ 卡片样式
├── pages/
│   ├── popup/
│   │   └── index.tsx            ✓ Popup 页面
│   └── options/
│       └── index.tsx            ✓ Options 页面
├── styles/
│   ├── popup.css                ✓ Popup 样式
│   └── options.css              ✓ Options 样式
└── utils/
    ├── card.ts                  ✓ 卡片类
    ├── config.ts                ✓ 配置管理
    └── search.ts                ✓ 搜索函数
```

### 关键改进：

✅ **现代化迁移**
- JavaScript → TypeScript 类型安全
- 函数式导出，便于模块化
- 完整的类型注解

✅ **性能优化**
- 按需导入 CSS
- 事件监听器管理
- 错误处理完善

✅ **功能完整**
- 所有原有功能已迁移
- 支持文件大小格式化
- 多种关键字分隔方式
- 卡片位置智能避免屏幕溢出
- 支持卡片拖拽移动

### 原有文件对应关系：

| 原文件 | 迁移到 | 说明 |
|--------|--------|------|
| js/config.js | src/utils/config.ts | 配置管理 |
| js/searchCard.js | src/utils/card.ts | Card 类 |
| js/content.js | src/contents/content.ts | 内容脚本 |
| js/background.js | src/background.ts | 后台脚本 |
| css/card.css | src/contents/styles/card.css | 样式 |

### 下一步（第四阶段）：
1. 功能优化（Plasmo Messages API）
2. 构建和测试
3. 清理旧文件

---
日期：2026-01-26
阶段：✅ 第三阶段完成

