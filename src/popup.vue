<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue"
import { getConfig, saveConfig } from "./utils/config"
import { searchEverything, formatFileSize, formatDate } from "./utils/search"
import { ElMessage } from "element-plus"
import { registerGlobalComponents } from "./utils/element-plus"
import SearchResultList from "./components/SearchResultList.vue"
import "element-plus/dist/index.css"
import "./assets/styles/common-card.css"

const app = getCurrentInstance()!.appContext.app
registerGlobalComponents(app)

const searchText = ref("")
const results = ref<any[]>([])
const loading = ref(false)
const checkLoading = ref(false)
const serviceStatus = ref<'unknown' | 'online' | 'offline'>('unknown')
const lastSearchText = ref("")
const currentConfig = ref<any>(null)

// 检测 Everything 服务状态
const checkServiceStatus = async (manual: boolean) => {
  if (manual) checkLoading.value = true
  try {
    const config = await getConfig()
    const testUrl = `${config.baseUrl}/?search=test&count=1&j=1`
    const res = await fetch(testUrl)
    serviceStatus.value = res.ok ? 'online' : 'offline'
    
    if (manual) {
      if (res.ok) ElMessage.success("连接检查成功：Everything 服务运行中")
      else ElMessage.warning("Everything 服务响应异常，请检查配置")
    }
  } catch (e) {
    serviceStatus.value = 'offline'
    if (manual) ElMessage.error("连接失败：请确认 Everything 已开启且配置了 CORS")
  } finally {
    if (manual) checkLoading.value = false
  }
}

const handleManualCheckStatus = () => {
  checkServiceStatus(true)
}

const handleSearch = async () => {
  if (!searchText.value.trim()) return

  loading.value = true
  lastSearchText.value = searchText.value
  try {
    const config = await getConfig()
    currentConfig.value = config
    const data = await searchEverything(
      searchText.value,
      config.baseUrl,
      config.params,
      config.searchBehavior,
      config.columns,
      config.limit,
      config.offset,
      config.sort,
      config.ascending
    )
    results.value = data
    serviceStatus.value = 'online'
  } catch (e: any) {
    console.error("Popup search failed:", e)
    serviceStatus.value = 'offline'
    ElMessage.error("搜索失败: 无法连接 Everything 服务")
  } finally {
    loading.value = false
  }
}

const toggleAutoOpen = async (val: boolean) => {
  try {
    const config = await getConfig()
    await saveConfig({
      ...config,
      autoOpenCard: val
    })
    currentConfig.value.autoOpenCard = val
  } catch (e) {
    ElMessage.error("保存设置失败")
  }
}

const openOptions = () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open(chrome.runtime.getURL("options.html"))
  }
}

onMounted(async () => {
  checkServiceStatus(false)
  currentConfig.value = await getConfig()
})
</script>

<template>
  <div class="popup-menu-wrapper everything-card">
    <!-- 头部：状态与品牌 -->
    <header class="popup-header everything-card-header">
      <div class="brand">
        <div class="logo-circle">E</div>
        <div class="brand-text">
          <h2>Everything Help</h2>
          <span :class="['status-dot', serviceStatus]">
            {{ serviceStatus === 'online' ? '服务已连接' : serviceStatus === 'offline' ? '服务未就绪' : '检查状态中...' }}
          </span>
        </div>
      </div>
      <el-button 
        circle 
        icon="Setting" 
        size="small"
        @click="openOptions"
        title="打开设置"
      />
    </header>

    <!-- 顶部状态栏：自动打开开关 -->
    <div class="popup-toolbar">
      <div class="toolbar-item">
        <span class="toolbar-label">自动打开页内弹窗</span>
        <el-switch 
          v-if="currentConfig"
          v-model="currentConfig.autoOpenCard" 
          size="small"
          @change="toggleAutoOpen"
        />
      </div>
    </div>

    <!-- 快捷菜单 -->
    <div class="menu-list">
      <div class="menu-item search-bar-container">
        <el-input
          v-model="searchText"
          placeholder="快速搜索本地文件..."
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :loading="loading" @click="handleSearch">Go</el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果预览 (仅在有结果或搜索过时显示) -->
      <transition name="el-fade-in-linear">
        <div v-if="results.length > 0 || (lastSearchText && !loading)" class="result-box everything-result-box">
          <div class="result-header everything-result-header">
            <span>找到 {{ results.length }} 条结果</span>
            <el-link type="primary" :underline="false" size="small" @click="results = []; lastSearchText = ''">清除</el-link>
          </div>
          <SearchResultList 
            :results="results"
            :config="currentConfig"
            :loading="loading"
            :last-search-text="lastSearchText"
          />
        </div>
      </transition>

      <!-- 磁贴式菜单 -->
      <div class="tiles-grid">
        <div class="tile" @click="openOptions">
          <el-icon :size="24" color="#409eff"><Setting /></el-icon>
          <span>扩展设置</span>
        </div>
        <div 
          class="tile" 
          v-loading="checkLoading"
          @click="handleManualCheckStatus"
        >
          <el-icon :size="24" :color="serviceStatus === 'online' ? '#67c23a' : '#f56c6c'">
            <Connection />
          </el-icon>
          <span>连接检查</span>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="popup-footer">
      <p>Everything Chrome Extension v1.0.0</p>
    </footer>
  </div>
</template>

<style scoped>
.popup-menu-wrapper {
  width: 330px;
  background: #fff;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  border-radius: 0; /* 插件弹窗不需要外层圆角 */
  border: none;
  box-shadow: none;
}

.popup-header {
  background: linear-gradient(135deg, #1f2f3d 0%, #304156 100%);
  color: #fff;
  height: 54px; /* 增加头部高度以容纳品牌信息 */
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.brand-text h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff; /* 覆盖公共样式的深色文字 */
}

.status-dot {
  font-size: 11px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.online::before { background: #67c23a; box-shadow: 0 0 5px #67c23a; }
.status-dot.offline::before { background: #f56c6c; box-shadow: 0 0 5px #f56c6c; }
.status-dot.unknown::before { background: #909399; }

.popup-toolbar {
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 11px;
  color: #909399;
}

.menu-list {
  padding: 16px;
}

.search-bar-container {
  margin-bottom: 16px;
}

.tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tile {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.tile:hover {
  background: #ecf5ff;
  border-color: #d9ecff;
}

.tile span {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.tile .el-icon {
  font-size: 20px;
}

/* 结果区域 - 对齐公共样式 */
.result-box {
  margin-bottom: 16px;
}

.result-header {
  font-size: 11px; /* 补回一个微调样式以避免空规则 */
}

.popup-footer {
  padding: 10px;
  text-align: center;
  background: #fcfcfd;
  border-top: 1px solid #f2f6fc;
}

.popup-footer p {
  margin: 0;
  font-size: 10px;
  color: #c0c4cc;
}
</style>
