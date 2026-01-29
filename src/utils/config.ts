/**
 * 检查扩展上下文是否有效
 */
function isContextValid() {
  return typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id
}

/**
 * 默认配置
 */
export const getDefaultConfig = () => ({
  protocol: "http",
  host: "127.0.0.1",
  port: "8181",
  params: {
    // 基础 JSON 参数
    c: 5,   // count
    j: 1,   // json
  },
  // 可视化搜索行为
  searchBehavior: {
    i: false, // case sensitive
    w: false, // whole word
    r: false, // regex
    p: false, // full path
    m: false, // diacritics
  },
  // 排序与限制
  limit: 5,
  offset: 0,
  sort: "name", // name, path, size, date_modified
  ascending: false,
  // 增加：返回列配置
  columns: {
    path: true,
    size: true,
    date_modified: false,
    date_created: false,
    attributes: false
  },
  // 增加：允许运行的站点列表
  allowedSites: ["javdb.com"],
  // 增加：自动打开页内弹窗控制
  autoOpenCard: true
})

/**
 * 获取配置（从 storage 或默认值）
 */
export async function getConfig() {
  if (!isContextValid()) {
    throw new Error("Extension context invalidated. Please refresh the page.")
  }
  const defaultConfig = getDefaultConfig()
  const result = await chrome.storage.local.get([
    "protocol",
    "host",
    "port",
    "params",
    "baseUrl",
    "searchBehavior",
    "limit",
    "offset",
    "sort",
    "ascending",
    "columns",
    "allowedSites",
    "autoOpenCard"
  ])

  let protocol = result.protocol || defaultConfig.protocol
  let host = result.host || defaultConfig.host
  let port = result.port || defaultConfig.port

  if (result.baseUrl && !result.protocol) {
    try {
      const url = new URL(result.baseUrl)
      protocol = url.protocol.replace(":", "")
      host = url.hostname
      port = url.port || (protocol === "https" ? "443" : "80")
    } catch (e) {
      console.error("解析旧 baseUrl 失败:", e)
    }
  }

  // 合并 params
  const params = { ...defaultConfig.params, ...(result.params || {}) }

  // 处理可视化参数
  const searchBehavior = { ...defaultConfig.searchBehavior, ...(result.searchBehavior || {}) }

  // 处理返回列参数
  const columns = { ...defaultConfig.columns, ...(result.columns || {}) }

  // 处理允许的站点
  const allowedSites = Array.isArray(result.allowedSites) ? result.allowedSites : defaultConfig.allowedSites

  // 处理自动打开设置
  const autoOpenCard = typeof result.autoOpenCard !== 'undefined' ? result.autoOpenCard : defaultConfig.autoOpenCard

  return {
    protocol,
    host,
    port,
    baseUrl: `${protocol}://${host}${port ? ":" + port : ""}`,
    params,
    searchBehavior,
    columns,
    allowedSites,
    autoOpenCard,
    limit: typeof result.limit !== 'undefined' ? result.limit : defaultConfig.limit,
    offset: typeof result.offset !== 'undefined' ? result.offset : defaultConfig.offset,
    sort: result.sort || defaultConfig.sort,
    ascending: typeof result.ascending !== 'undefined' ? result.ascending : defaultConfig.ascending
  }
}

/**
 * 保存配置到 storage
 */
export async function saveConfig(config: {
  protocol: string
  host: string
  port: string
  params?: Record<string, any>
  searchBehavior?: Record<string, boolean>
  columns?: Record<string, boolean>
  allowedSites?: string[]
  autoOpenCard?: boolean
  limit?: number
  offset?: number
  sort?: string
  ascending?: boolean
}) {
  if (!isContextValid()) {
    throw new Error("Extension context invalidated. Please refresh the page.")
  }
  const baseUrl = `${config.protocol}://${config.host}${config.port ? ":" + config.port : ""}`
  const data: Record<string, any> = {
    protocol: config.protocol,
    host: config.host,
    port: config.port,
    baseUrl: baseUrl
  }

  if (config.params) data.params = config.params
  if (config.searchBehavior) data.searchBehavior = config.searchBehavior
  if (config.columns) data.columns = config.columns
  if (Array.isArray(config.allowedSites)) data.allowedSites = config.allowedSites
  if (typeof config.autoOpenCard !== 'undefined') data.autoOpenCard = config.autoOpenCard
  if (typeof config.limit !== 'undefined') data.limit = config.limit
  if (typeof config.offset !== 'undefined') data.offset = config.offset
  if (config.sort) data.sort = config.sort
  if (typeof config.ascending !== 'undefined') data.ascending = config.ascending

  return chrome.storage.local.set(data)
}
