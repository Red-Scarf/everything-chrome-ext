# 自动创建 Release 配置说明

本文档说明如何配置自动创建 Release 的几种方案。

---

## 🎯 当前配置

项目已配置两种方式创建 Release：

### 方式 1：推送到主分支自动创建（已配置）

**触发条件**：
- ✅ 推送到 `main` 或 `master` 分支
- ✅ 不包括 Pull Request

**Release 标签格式**：
- `v1.0.0-abc1234`（版本号 + 提交 SHA 前 7 位）
- 标记为 **Pre-release**（预发布版本）

**操作步骤**：
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

**结果**：
- ✅ 自动构建
- ✅ 自动打包
- ✅ 自动创建 Release（预发布版本）
- ✅ 自动上传 `.zip` 文件到 Release

---

### 方式 2：推送 Tag 创建正式 Release（已配置）

**触发条件**：
- ✅ 推送以 `v` 开头的 tag（例如：`v1.0.0`）

**Release 标签格式**：
- `v1.0.0`（使用 tag 名称）
- 标记为 **正式版本**（不是预发布）

**操作步骤**：
```bash
git tag v1.0.0
git push origin v1.0.0
```

**结果**：
- ✅ 自动构建
- ✅ 自动打包
- ✅ 自动创建 Release（正式版本）
- ✅ 自动上传 `.zip` 文件到 Release

---

## 🔧 配置选项

### 方案 A：每次推送都创建 Release（当前配置）

**优点**：
- 自动化程度高
- 每次推送都有可下载的版本

**缺点**：
- 会产生很多 Release（每个提交一个）
- Release 列表可能很长

**适用场景**：
- 需要频繁发布测试版本
- 希望每个提交都有可下载的版本

---

### 方案 B：只在推送 Tag 时创建 Release（推荐）

如果你想禁用自动创建 Release，只保留 Tag 触发方式，可以修改 `.github/workflows/build.yml`：

删除 `create-release` job，只保留 `build` job。

**优点**：
- Release 列表干净
- 只在正式发布时创建 Release

**缺点**：
- 需要手动创建 tag

**适用场景**：
- 正式项目发布
- 希望控制 Release 数量

---

### 方案 C：通过提交信息关键词触发

如果你想通过提交信息中的关键词来触发 Release，可以修改工作流：

```yaml
if: |
  github.event_name == 'push' && 
  (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master') &&
  contains(github.event.head_commit.message, '[release]')
```

然后使用以下提交信息：
```bash
git commit -m "feat: add feature [release]"
```

---

## 📋 推荐工作流

### 日常开发

```bash
# 1. 开发功能
git add .
git commit -m "feat: add new feature"
git push origin main

# 结果：自动构建 + 自动创建预发布版本 Release
```

### 正式发布

```bash
# 1. 更新版本号
# 编辑 package.json: version: "1.0.0" -> "1.0.1"

# 2. 提交版本更新
git add package.json
git commit -m "chore: bump version to 1.0.1"
git push origin main

# 3. 创建正式 Release
git tag v1.0.1
git push origin v1.0.1

# 结果：自动创建正式版本 Release
```

---

## 🔍 验证 Release 创建

### 检查方法

1. **访问 Releases 页面**：
   - 仓库首页 → 右侧 **"Releases"** 链接
   - 或直接访问：`https://github.com/用户名/仓库名/releases`

2. **查看 Release 列表**：
   - **预发布版本**：标签为 `v1.0.0-abc1234`，标记为 "Pre-release"
   - **正式版本**：标签为 `v1.0.0`，无 "Pre-release" 标记

3. **验证文件上传**：
   - 点击 Release 标题进入详情页
   - 在 **Assets** 部分应该能看到 `.zip` 文件
   - 可以点击下载

---

## ⚙️ 自定义配置

### 修改 Release 标签格式

编辑 `.github/workflows/build.yml` 中的 `Generate release tag` 步骤：

```yaml
- name: Generate release tag
  id: release-tag
  run: |
    VERSION=$(node -p "require('./package.json').version")
    DATE=$(date +%Y%m%d)
    SHORT_SHA=${GITHUB_SHA:0:7}
    RELEASE_TAG="v${VERSION}-${DATE}-${SHORT_SHA}"
    echo "tag=$RELEASE_TAG" >> $GITHUB_OUTPUT
```

### 修改 Release 描述

编辑 `Create Release` 步骤中的 `body` 部分：

```yaml
body: |
  ## 🎉 Everything Chrome Extension ${{ steps.release-tag.outputs.tag }}
  
  你的自定义描述内容...
```

### 禁用自动创建 Release

如果你想禁用自动创建 Release，可以：

1. **删除 `create-release` job**：编辑 `.github/workflows/build.yml`，删除整个 `create-release` job
2. **或者添加条件**：在 `create-release` job 的 `if` 条件中添加 `false`：

```yaml
if: false  # 禁用自动创建 Release
```

---

## 🐛 常见问题

### Q: 为什么推送到主分支后没有创建 Release？

**检查**：
1. 确认分支名称是 `main` 或 `master`
2. 确认不是 Pull Request
3. 查看 Actions 日志，确认 `create-release` job 是否运行

**解决**：
- 查看 Actions 运行日志
- 确认工作流文件已正确提交到仓库

### Q: 如何删除不需要的 Release？

1. 访问 Releases 页面
2. 点击要删除的 Release
3. 点击右上角的 **"Edit"** 按钮
4. 滚动到底部，点击 **"Delete release"** 按钮

### Q: 预发布版本和正式版本有什么区别？

- **预发布版本**：标记为 "Pre-release"，通常用于测试
- **正式版本**：不标记为预发布，用于正式发布

用户可以在 Releases 页面选择是否显示预发布版本。

---

## 📚 相关文档

- [GitHub Actions 使用指南](GITHUB_ACTIONS.md)
- [发布版本快速指南](RELEASE_GUIDE.md)
- [如何触发构建](HOW_TO_TRIGGER_BUILD.md)

---

**最后更新**：2026-02-03
