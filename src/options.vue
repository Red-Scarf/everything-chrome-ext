<script setup lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance, watch, nextTick } from "vue"
import { getConfig, saveConfig } from "./utils/config"
import { ElMessage } from "element-plus"
import { registerGlobalComponents } from "./utils/element-plus"
import "element-plus/dist/index.css"

const app = getCurrentInstance()!.appContext.app
registerGlobalComponents(app)

const form = reactive({
  protocol: "http",
  host: "127.0.0.1",
  port: "8181",
  params: "{}",
  // 搜索行为
  searchBehavior: {
    i: false,
    w: false,
    r: false,
    p: false,
    m: false
  },
  // 返回列
  columns: {
    path: true,
    size: true,
    date_modified: false,
    date_created: false,
    attributes: false
  },
  limit: 5,
  offset: 0,
  sort: "name",
  ascending: false,
  allowedSites: [] as string[],
  autoOpenCard: true
})

const newSite = ref("")

const loading = ref(false)
const testing = ref(false)
let isInternalUpdate = false

// 1. 监听可视化表单变动 -> 更新 JSON 框
watch(
  () => {
    const { params, ...rest } = form
    return JSON.parse(JSON.stringify(rest))
  },
  (newVal) => {
    if (isInternalUpdate) return
    isInternalUpdate = true
    form.params = JSON.stringify(newVal, null, 4)
    nextTick(() => { isInternalUpdate = false })
  },
  { deep: true }
)

// 2. 监听 JSON 框手动输入 -> 更新可视化表单
watch(
  () => form.params,
  (newVal) => {
    if (isInternalUpdate) return
    try {
      const parsed = JSON.parse(newVal)
      isInternalUpdate = true
      // 只更新 form 中存在的已知字段，避免污染
      Object.keys(parsed).forEach(key => {
        if (key !== 'params' && key in form) {
          (form as any)[key] = parsed[key]
        }
      })
      nextTick(() => { isInternalUpdate = false })
    } catch (e) {
      // 正在输入过程中的非法 JSON 不处理
    }
  }
)

const fullUrl = computed(() => {
  const baseUrl = `${form.protocol}://${form.host}${form.port ? ":" + form.port : ""}`
  const params = new URLSearchParams()
  params.append("search", "test")
  params.append("j", "1")
  
  // 附加可视化参数
  if (form.searchBehavior.i) params.append("i", "1")
  if (form.searchBehavior.w) params.append("w", "1")
  if (form.searchBehavior.r) params.append("r", "1")
  if (form.searchBehavior.p) params.append("p", "1")
  if (form.searchBehavior.m) params.append("m", "1")

  // 附加返回列参数
  if (form.columns.path) params.append("path_column", "1")
  if (form.columns.size) params.append("size_column", "1")
  if (form.columns.date_modified) params.append("date_modified_column", "1")
  if (form.columns.date_created) params.append("date_created_column", "1")
  if (form.columns.attributes) params.append("attributes_column", "1")
  
  params.append("c", String(form.limit))
  params.append("o", String(form.offset))
  params.append("sort", form.sort)
  params.append("ascending", form.ascending ? "1" : "0")
  
  return `${baseUrl}/?${params.toString()}`
})

const handleError = (e: any) => {
  console.error("Operation failed:", e)
  if (e.message?.includes("Extension context invalidated")) {
    ElMessage.error({
      message: '扩展上下文已失效，请刷新页面后重试',
      duration: 0,
      showClose: true,
      onClose: () => {
        window.location.reload()
      }
    })
    // 自动刷新尝试
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } else {
    ElMessage.error(e.message || "操作失败")
  }
}

onMounted(async () => {
  try {
    const config = await getConfig()
    isInternalUpdate = true // 初始化时不触发同步
    form.protocol = config.protocol
    form.host = config.host
    form.port = config.port
    form.searchBehavior = { ...config.searchBehavior }
    form.columns = { ...config.columns }
    form.limit = config.limit
    form.offset = config.offset
    form.sort = config.sort
    form.ascending = config.ascending
    form.allowedSites = Array.isArray(config.allowedSites) ? [...config.allowedSites] : []
    form.autoOpenCard = config.autoOpenCard
    
    // 初始化 JSON 框显示
    const { params, ...cleanForm } = form
    form.params = JSON.stringify(cleanForm, null, 4)
    nextTick(() => { isInternalUpdate = false })
  } catch (e) {
    handleError(e)
  }
})

const addSite = () => {
  const site = newSite.value.trim().toLowerCase()
  if (!site) return
  if (form.allowedSites.includes(site)) {
    ElMessage.warning("该站点已在列表中")
    return
  }
  form.allowedSites.push(site)
  newSite.value = ""
}

const removeSite = (site: string) => {
  form.allowedSites = form.allowedSites.filter(s => s !== site)
}

const handleSave = async () => {
  loading.value = true
  try {
    // 直接从 form 对象保存（此时 form 与 JSON 框已同步）
    await saveConfig({
      protocol: form.protocol,
      host: form.host,
      port: form.port,
      params: {}, // 高级参数现在已融合在主对象中，或者如果需要独立存储额外参数，可以在此扩展
      searchBehavior: form.searchBehavior,
      columns: form.columns,
      limit: form.limit,
      offset: form.offset,
      sort: form.sort,
      ascending: form.ascending,
      allowedSites: form.allowedSites,
      autoOpenCard: form.autoOpenCard
    })
    ElMessage({
      message: '设置已成功保存',
      type: 'success',
      plain: true,
    })
  } catch (e) {
     handleError(e)
  } finally {
    loading.value = false
  }
}

const testConnection = async () => {
  testing.value = true
  try {
    const testUrl = `${fullUrl.value}/?search=test&count=1&j=1`
    const res = await fetch(testUrl)
    if (res.ok) {
      ElMessage({
        message: '连接成功！Everything 服务响应正常',
        type: 'success',
        icon: 'Connection',
      })
    } else {
      throw new Error(`HTTP Error: ${res.status}`)
    }
  } catch (e: any) {
    console.error("Test connection failed:", e)
    ElMessage.error(`连接失败: ${e.message || "请检查服务是否启动以及跨域设置"}`)
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="options-wrapper">
    <div class="options-container">
      <header class="header">
        <div class="logo-box">
          <el-icon :size="28" color="#fff"><Setting /></el-icon>
        </div>
        <div class="title-box">
          <h1>Everything 扩展设置</h1>
          <p>配置本地搜索服务连接与高级参数</p>
        </div>
      </header>

      <el-row :gutter="24">
        <el-col :span="16">
          <el-card class="settings-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon :size="18"><Connection /></el-icon>
                <span>基础连接设置</span>
              </div>
            </template>

            <el-form label-position="top" size="large">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="通讯协议">
                    <el-select v-model="form.protocol" placeholder="选择协议">
                      <el-option label="HTTP" value="http" />
                      <el-option label="HTTPS" value="https" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="服务主机 (Host)">
                    <el-input v-model="form.host" placeholder="127.0.0.1" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="服务端口 (Port)">
                    <el-input v-model="form.port" placeholder="8181" />
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="behavior-item standalone-option">
                <span class="label">自动打开结果卡片</span>
                <el-switch v-model="form.autoOpenCard" size="small" />
                <span class="option-tip">开启后，识别到关键词将自动弹出搜索结果</span>
              </div>

              <el-divider content-position="left">搜索行为策略</el-divider>
              
              <div class="behavior-grid">
                <div class="behavior-item">
                  <span class="label">区分大小写</span>
                  <el-switch v-model="form.searchBehavior.i" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">全字匹配</span>
                  <el-switch v-model="form.searchBehavior.w" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">正则表达式</span>
                  <el-switch v-model="form.searchBehavior.r" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">匹配路径</span>
                  <el-switch v-model="form.searchBehavior.p" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">匹配变音符号</span>
                  <el-switch v-model="form.searchBehavior.m" size="small" />
                </div>
              </div>

              <el-divider content-position="left">结果限制与排序</el-divider>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="结果数量限制">
                    <el-input-number v-model="form.limit" :min="1" :max="1000" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="排序字段">
                    <el-select v-model="form.sort" style="width: 100%">
                      <el-option label="名称" value="name" />
                      <el-option label="路径" value="path" />
                      <el-option label="大小" value="size" />
                      <el-option label="修改日期" value="date_modified" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="排序顺序">
                    <el-radio-group v-model="form.ascending">
                      <el-radio :value="true">升序</el-radio>
                      <el-radio :value="false">降序</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">返回结果字段</el-divider>
              
              <div class="behavior-grid">
                <div class="behavior-item">
                  <span class="label">路径</span>
                  <el-switch v-model="form.columns.path" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">大小</span>
                  <el-switch v-model="form.columns.size" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">修改日期</span>
                  <el-switch v-model="form.columns.date_modified" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">创建日期</span>
                  <el-switch v-model="form.columns.date_created" size="small" />
                </div>
                <div class="behavior-item">
                  <span class="label">文件属性</span>
                  <el-switch v-model="form.columns.attributes" size="small" />
                </div>
              </div>

              <el-divider content-position="left">生效站点白名单</el-divider>
              <div class="sites-section">
                <div class="sites-tags">
                  <el-tag
                    v-for="site in form.allowedSites"
                    :key="site"
                    closable
                    @close="removeSite(site)"
                    class="site-tag"
                  >
                    {{ site }}
                  </el-tag>
                  <span v-if="form.allowedSites.length === 0" class="no-sites-text">
                    未配置站点，插件将在所有站点尝试运行
                  </span>
                </div>
                <div class="site-input-box">
                  <el-input
                    v-model="newSite"
                    placeholder="输入域名，如 sehuatang.org"
                    size="default"
                    @keyup.enter="addSite"
                  >
                    <template #append>
                      <el-button @click="addSite">添加站点</el-button>
                    </template>
                  </el-input>
                  <p class="site-tip">默认仅在 javdb.com 生效。留空则代表全局生效。</p>
                </div>
              </div>

              <div class="preview-section">
                <span class="label">生成的测试 URL 预览</span>
                <div class="url-badge">
                  <code>{{ fullUrl }}</code>
                </div>
              </div>

              <el-form-item label="高级搜索参数 (JSON 格式)" class="params-item">
                <el-input
                  v-model="form.params"
                  type="textarea"
                  :rows="8"
                  spellcheck="false"
                  placeholder='{"c": 5, "j": 1}'
                />
              </el-form-item>

              <div class="actions">
                <el-button type="primary" :loading="loading" @click="handleSave" class="btn-main">
                  保存当前配置
                </el-button>
                <el-button :loading="testing" @click="testConnection" plain>
                  测试连接状态
                </el-button>
              </div>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="help-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon :size="18"><Reading /></el-icon>
                <span>配置指南</span>
              </div>
            </template>
            
            <div class="help-content">
              <div class="help-step">
                <h4>1. 开启服务</h4>
                <p>在 Everything 选项中启用 <strong>HTTP 服务器</strong></p>
              </div>
              
              <div class="help-step">
                <h4>2. 允许跨域</h4>
                <p>在 <code>Everything.ini</code> 的 <code>[HTTP Server]</code> 节点下添加：</p>
                <div class="code-box">
                  <code>http_server_header=Access-Control-Allow-Origin: *</code>
                </div>
                <p class="tip">配置后需手动重启 Everything 软件生效</p>
              </div>

              <div class="help-step">
                <h4>3. 端口映射</h4>
                <p>确保此页面配置的端口与 Everything 选项中的端口一致。</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.options-wrapper {
  background-color: #f6f8fa;
  min-height: 100vh;
  padding: 48px 24px;
}

.options-container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.logo-box {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.title-box h1 {
  margin: 0;
  font-size: 26px;
  color: #1f2f3d;
  font-weight: 700;
}

.title-box p {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.sites-section {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.sites-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 32px;
  align-items: center;
}

.site-tag {
  font-weight: 500;
}

.no-sites-text {
  font-size: 13px;
  color: #a8abb2;
  font-style: italic;
}

.site-input-box {
  max-width: 400px;
}

.site-tip {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.settings-card {
  border: none;
  border-radius: 12px;
}

.behavior-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
  margin: 12px 0 20px 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.behavior-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

.behavior-item .label {
  font-size: 13px;
  color: #606266;
}

.behavior-item.standalone-option {
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 8px 16px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #d9ecff;
}

.behavior-item.standalone-option .label {
  font-weight: 600;
  color: #409eff;
}

.option-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.preview-section {
  margin-top: 24px;
  margin-bottom: 24px;
  background: #fdf6ec;
  padding: 16px;
  border-radius: 8px;
  border: 1px dashed #e6a23c88;
}

.preview-section .label {
  display: block;
  font-size: 12px;
  color: #e6a23c;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-badge code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 15px;
  color: #c97c10;
  word-break: break-all;
}

.params-item :deep(.el-textarea__inner) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: #fafafa;
}

.actions {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 16px;
}

.btn-main {
  padding-left: 32px;
  padding-right: 32px;
}

/* 帮助部分样式 */
.help-card {
  border-radius: 12px;
  background: transparent;
  border: 1px solid #ebeef5;
}

.help-step {
  margin-bottom: 24px;
}

.help-step h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.help-step p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.code-box {
  background: #282c34;
  padding: 10px;
  border-radius: 6px;
  margin: 8px 0;
}

.code-box code {
  color: #abb2bf;
  font-size: 12px;
  word-break: break-all;
}

.tip {
  color: #f56c6c !important;
  font-size: 12px !important;
  font-style: italic;
}
</style>
