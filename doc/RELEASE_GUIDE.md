# 发布版本快速指南

本文档提供创建 GitHub Release 的快速步骤。

---

## 🚀 快速发布步骤

### 1. 更新版本号（可选）

编辑 `package.json`，更新 `version` 字段：

```json
{
  "version": "1.0.1"
}
```

### 2. 提交更改

```bash
git add .
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

### 3. 创建并推送 Tag

```bash
# 创建 tag
git tag v1.0.1

# 推送 tag（这会触发自动构建和发布）
git push origin v1.0.1

# 或者一次性推送所有 tag
git push origin --tags
```

### 4. 等待自动构建

1. 访问仓库的 **Actions** 标签页
2. 查看 **"Release Extension"** workflow 的运行状态
3. 等待构建完成（通常需要 2-5 分钟）

### 5. 验证 Release

1. 访问仓库的 **Releases** 页面
2. 确认新版本已创建
3. 下载 `.zip` 文件验证

---

## 📋 完整示例

```bash
# 1. 确保代码已提交
git status

# 2. 更新版本号（编辑 package.json）
# version: "1.0.0" -> "1.0.1"

# 3. 提交版本更新
git add package.json
git commit -m "chore: bump version to 1.0.1"
git push origin main

# 4. 创建并推送 tag
git tag v1.0.1
git push origin v1.0.1

# 5. 等待 GitHub Actions 完成构建和发布
# 6. 在 Releases 页面下载打包文件
```

---

## 🔍 验证清单

发布完成后，请确认：

- [ ] GitHub Actions 工作流运行成功（绿色 ✅）
- [ ] Release 已创建在 Releases 页面
- [ ] Release 标题正确（例如：`Release v1.0.1`）
- [ ] Release 描述包含构建信息
- [ ] Assets 部分包含 `.zip` 文件
- [ ] `.zip` 文件可以正常下载
- [ ] 下载的 `.zip` 文件可以正常解压和安装

---

## 🐛 常见问题

### Tag 推送后没有触发构建

**检查**：
1. Tag 格式是否正确（必须以 `v` 开头，如 `v1.0.1`）
2. 是否推送到正确的远程仓库
3. GitHub Actions 是否已启用

**解决**：
```bash
# 确认 tag 已推送
git ls-remote --tags origin

# 如果 tag 不存在，重新推送
git push origin v1.0.1
```

### Release 创建但文件未上传

**检查**：
1. 查看 Actions 日志中的 "Find package file" 步骤
2. 确认打包文件是否存在
3. 检查文件路径是否正确

**解决**：
- 查看工作流日志中的文件列表输出
- 确认 `npm run package` 成功执行
- 检查文件是否在预期位置（通常是 `build/` 目录）

---

## 📝 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号** (`v2.0.0`)：不兼容的 API 修改
- **次版本号** (`v1.1.0`)：向下兼容的功能性新增
- **修订号** (`v1.0.1`)：向下兼容的问题修正
- **预发布** (`v1.0.0-beta`)：预发布版本，会在 Release 中标记为 Pre-release

---

## 🔗 相关链接

- [GitHub Actions 详细文档](GITHUB_ACTIONS.md)
- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

**最后更新**：2026-02-03
