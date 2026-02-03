# GitHub Actions 自动构建指南

本文档说明如何使用 GitHub Actions 实现项目的自动构建和发布。

---

## 📋 概述

项目配置了两个 GitHub Actions 工作流：

1. **build.yml** - 持续集成（CI）：自动构建和测试
2. **release.yml** - 持续部署（CD）：自动打包和发布

---

## 🔄 自动构建（CI）

### 触发条件

以下情况会自动触发构建：

- ✅ 推送到 `main`、`master` 或 `develop` 分支
- ✅ 创建 Pull Request 到上述分支

### 工作流程

1. **检出代码**：从 GitHub 仓库拉取最新代码
2. **设置 Node.js**：使用 Node.js 20，并启用 npm 缓存加速
3. **安装依赖**：运行 `npm ci` 安装依赖（使用锁定文件确保一致性）
4. **构建扩展**：运行 `npm run build` 构建扩展
5. **上传产物**：将构建结果上传到 GitHub Actions Artifacts

### 查看构建结果

1. 访问仓库的 **Actions** 标签页
2. 点击左侧的 **"Build Extension"** workflow
3. 查看运行记录，绿色 ✅ 表示成功，红色 ❌ 表示失败
4. 构建完成后，在运行详情页面底部可以下载构建产物

### 构建产物位置

- **路径**：`build/` 目录
- **保留时间**：7 天
- **下载方式**：在 Actions 运行详情页面下载 Artifacts

---

## 🚀 自动发布（CD）

### 触发条件

以下情况会自动触发发布：

- ✅ 推送以 `v` 开头的 tag（例如：`v1.0.0`、`v1.2.3-beta`）
- ✅ 手动触发 workflow（通过 GitHub Actions 界面）

### 工作流程

1. **检出代码**：从 GitHub 仓库拉取代码
2. **设置 Node.js**：使用 Node.js 20
3. **安装依赖**：运行 `npm ci`
4. **构建扩展**：运行 `npm run build`
5. **打包扩展**：运行 `npm run package` 生成 `.zip` 文件
6. **创建 Release**：自动创建 GitHub Release
7. **上传文件**：将打包文件附加到 Release

### 创建发布版本

#### 方法一：通过 Git Tag（推荐）

```bash
# 1. 确保代码已提交并推送到远程
git add .
git commit -m "feat: add new feature"
git push origin main

# 2. 更新版本号（可选，如果 package.json 中已更新可跳过）
# 编辑 package.json，将 version 字段更新为新版本号

# 3. 创建并推送 tag
git tag v1.0.1
git push origin v1.0.1

# 或者一次性推送所有 tag
git push origin --tags
```

#### 方法二：手动触发

1. 访问仓库的 **Actions** 标签页
2. 选择左侧的 **"Release Extension"** workflow
3. 点击右上角的 **"Run workflow"** 按钮
4. 在下拉菜单中选择分支（通常是 `main`）
5. 在 **"Version tag"** 输入框中输入版本号（例如：`v1.0.1`）
6. 点击 **"Run workflow"** 按钮

### Release 内容

自动创建的 Release 包含：

- **标题**：`Release v1.0.1`（版本号来自 tag）
- **描述**：包含构建信息、安装说明和更新日志链接
- **附件**：打包好的 `.zip` 文件

### 版本号规范

建议遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改（例如：`v2.0.0`）
- **次版本号**：向下兼容的功能性新增（例如：`v1.1.0`）
- **修订号**：向下兼容的问题修正（例如：`v1.0.1`）
- **预发布版本**：在版本号后添加标识（例如：`v1.0.0-beta`、`v1.0.0-rc.1`）

预发布版本会在 GitHub Release 中标记为 **"Pre-release"**。

---

## 🔧 配置说明

### 修改触发分支

编辑 `.github/workflows/build.yml`：

```yaml
on:
  push:
    branches: [ main, master, develop, your-branch ]  # 添加你的分支名
```

### 修改 Node.js 版本

编辑工作流文件中的 `node-version`：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 修改为你需要的版本
```

### 修改构建命令

如果需要自定义构建步骤，编辑工作流文件中的 `run` 命令：

```yaml
- name: Build extension
  run: npm run build  # 修改为你的构建命令
```

---

## 🐛 故障排除

### 构建失败

**问题**：构建失败，显示错误信息

**解决方案**：
1. 检查 Actions 运行日志中的错误信息
2. 确保 `package.json` 中的脚本命令正确
3. 确保所有依赖都已正确添加到 `package.json`
4. 检查代码是否有语法错误或类型错误

### Release 未创建

**问题**：推送 tag 后没有自动创建 Release

**解决方案**：
1. 确认 tag 格式正确（以 `v` 开头）
2. 检查 Actions 运行日志
3. 确认 GitHub Token 权限足够（通常 `GITHUB_TOKEN` 已自动配置）

### 打包文件未找到

**问题**：Release 创建成功，但没有附件文件

**解决方案**：
1. 检查 `npm run package` 命令是否成功执行
2. 确认打包文件路径是否正确（通常在项目根目录）
3. 检查工作流中的文件查找逻辑

### 权限问题

**问题**：工作流无法访问仓库或创建 Release

**解决方案**：
1. 确认仓库设置中已启用 Actions
2. 检查仓库的 Actions 权限设置
3. 确认 `GITHUB_TOKEN` 有足够权限（通常自动配置）

---

## 📚 相关资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Plasmo 构建文档](https://docs.plasmo.com/framework/build)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

## 💡 最佳实践

1. **版本管理**：使用语义化版本号，便于用户理解更新内容
2. **提交信息**：编写清晰的 commit message，便于追踪变更
3. **测试**：在本地测试构建和打包流程，确保 GitHub Actions 能正常运行
4. **分支保护**：为主分支设置保护规则，要求通过 CI 检查才能合并
5. **Release Notes**：在 Release 描述中详细说明更新内容和新功能

---

**最后更新**：2026-02-03
