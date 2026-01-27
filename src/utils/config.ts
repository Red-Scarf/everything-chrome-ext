/**
 * 默认配置
 */
export function getDefaultConfig() {
  return {
    baseUrl: "http://127.0.0.1:8181",
    params: {
      c: 5, // 限制5条
      j: 1, // json返回
      size_column: 1, // 文件大小
      sort: "size", // 按大小排序
      ascending: 0 // 降序
    }
  }
}

/**
 * 获取配置（从 storage 或默认值）
 */
export async function getConfig() {
  const defaultConfig = getDefaultConfig()
  const result = await chrome.storage.local.get(["baseUrl", "params"])

  return {
    baseUrl: result.baseUrl || defaultConfig.baseUrl,
    params: result.params || defaultConfig.params
  }
}

/**
 * 保存配置到 storage
 */
export async function saveConfig(baseUrl: string, params?: Record<string, any>) {
  const data: Record<string, any> = { baseUrl }
  if (params) {
    data.params = params
  }
  return chrome.storage.local.set(data)
}
