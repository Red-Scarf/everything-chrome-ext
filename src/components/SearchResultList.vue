<script setup lang="ts">
import { formatFileSize, formatDate } from "../utils/search"

interface SearchResult {
  name: string
  size: number
  path?: string
  date_modified?: number
  date_created?: number
  attributes?: string
  [key: string]: any
}

defineProps<{
  results: SearchResult[]
  config: any
  loading?: boolean
  lastSearchText?: string
}>()
</script>

<template>
  <div class="search-result-list">
    <div v-if="results.length > 0" class="table-container">
      <el-table 
        :data="results" 
        style="width: 100%" 
        height="250" 
        size="small"
        stripe
        highlight-current-row
      >
        <!-- 文件名称列 (固定在左侧) -->
        <el-table-column 
          prop="name" 
          label="文件名" 
          min-width="150" 
          fixed="left"
          show-overflow-tooltip
        />
        
        <!-- 文件路径列 (动态显示) -->
        <el-table-column 
          v-if="config?.columns?.path"
          prop="path" 
          label="路径" 
          min-width="200"
          show-overflow-tooltip
        />

        <!-- 文件大小列 (动态显示) -->
        <el-table-column 
          v-if="config?.columns?.size"
          label="大小" 
          width="100"
          align="right"
        >
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>

        <!-- 修改时间列 (动态显示) -->
        <el-table-column 
          v-if="config?.columns?.date_modified"
          label="修改时间" 
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.date_modified) }}
          </template>
        </el-table-column>

        <!-- 创建时间列 (动态显示) -->
        <el-table-column 
          v-if="config?.columns?.date_created"
          label="创建时间" 
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.date_created) }}
          </template>
        </el-table-column>

        <!-- 属性列 (动态显示) -->
        <el-table-column 
          v-if="config?.columns?.attributes"
          prop="attributes" 
          label="属性" 
          width="100"
        />
      </el-table>
    </div>
    
    <div v-else-if="!loading && lastSearchText" class="empty-state">
      <el-icon :size="24"><InfoFilled /></el-icon>
      <p>未找到匹配 "{{ lastSearchText }}" 的文件</p>
    </div>
  </div>
</template>

<style scoped>
.search-result-list {
  width: 100%;
}

.table-container {
  width: 100%;
}

/* 适配 el-table 内部样式，确保紧凑 */
:deep(.el-table .cell) {
  padding: 0 8px;
  line-height: 24px;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.el-table__header th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: #c0c4cc;
}

.empty-state p {
  font-size: 13px;
  margin: 8px 0 0 0;
}
</style>
