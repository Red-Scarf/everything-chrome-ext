/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number | string | null): string {
  if (!bytes || bytes === "") {
    return "0 Bytes"
  }

  const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const srcsize = parseFloat(String(bytes))
  const index = Math.floor(Math.log(srcsize) / Math.log(1024))
  const size = srcsize / Math.pow(1024, index)

  return size.toFixed(2) + " " + unitArr[index]
}

/**
 * 格式化 Windows FILETIME (64-bit) 为日期字符串
 * Everything API 返回的是 100-nanosecond 间隔（自 1601-01-01）
 */
export function formatDate(fileTime: number | string | null): string {
  if (!fileTime) return ""

  try {
    const ticks = BigInt(fileTime)
    // Win32 Epoch (1601-01-01) 到 Unix Epoch (1970-01-01) 的 100ns 间隔数
    const EPOCH_OFFSET = 116444736000000000n

    // 转换为 Unix 毫秒
    const unixMs = Number((ticks - EPOCH_OFFSET) / 10000n)
    const date = new Date(unixMs)

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  } catch (e) {
    console.error("Date formatting failed:", e)
    return String(fileTime)
  }
}

/**
 * 分解关键字
 * 支持：空格、横杠、下划线分隔，或根据英文和数值分组
 */
export function parseSearchText(str: string): string[] {
  // 尝试用空格、横杠或下划线分割
  let keyArr = str.split(/[ \-_]/).filter(Boolean)
  if (keyArr.length > 1) return keyArr

  // 没有分隔符的，根据英文、数字和中文分组
  const match = str.match(/([\u4e00-\u9fa5]+)|([a-zA-Z]+)|(\d+)/g)
  return match || [str]
}

/**
 * 构建搜索 URL
 */
export function buildSearchUrl(
  baseUrl: string,
  searchText: string,
  params: Record<string, any>
): string {
  const keywords = parseSearchText(searchText)
  // 确保 baseUrl 以 / 结尾，或者至少在拼接时加上 /
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
  let url = normalizedBase + "?search=" + encodeURIComponent(keywords.join(" "))

  const urlParams: string[] = []
  for (const [key, value] of Object.entries(params)) {
    urlParams.push(`${key}=${encodeURIComponent(String(value))}`)
  }

  return url + "&" + urlParams.join("&")
}

/**
 * 执行 Everything 搜索
 */
export async function searchEverything(
  searchText: string,
  baseUrl: string,
  extraParams: Record<string, any> = {},
  searchBehavior: Record<string, boolean> = {},
  columns: Record<string, boolean> = {},
  limit: number = 5,
  offset: number = 0,
  sort: string = "name",
  ascending: boolean = false
): Promise<Array<{ name: string; size: number; path?: string; date_modified?: number;[key: string]: any }>> {
  // 构建综合参数
  const fullParams = { ...extraParams }

  // 添加可视化行为参数
  if (searchBehavior.i) fullParams.i = 1
  if (searchBehavior.w) fullParams.w = 1
  if (searchBehavior.r) fullParams.r = 1
  if (searchBehavior.p) fullParams.p = 1
  if (searchBehavior.m) fullParams.m = 1

  // 添加返回列参数
  if (columns.path) fullParams.path_column = 1
  if (columns.size) fullParams.size_column = 1
  if (columns.date_modified) fullParams.date_modified_column = 1
  if (columns.date_created) fullParams.date_created_column = 1
  if (columns.attributes) fullParams.attributes_column = 1

  // 添加分页和排序
  fullParams.c = String(limit)
  fullParams.o = String(offset)
  fullParams.sort = sort
  fullParams.ascending = ascending ? "1" : "0"
  fullParams.j = "1" // 强制开启 JSON

  const url = buildSearchUrl(baseUrl, searchText, fullParams)
  console.log("Searching Everything:", url)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Search request failed:", error)
    throw error
  }
}
