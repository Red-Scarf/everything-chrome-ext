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
  let url = baseUrl + "?search=" + keywords.join("+")

  const urlParams: string[] = []
  for (const [key, value] of Object.entries(params)) {
    urlParams.push(`${key}=${value}`)
  }

  return url + "&" + urlParams.join("&")
}

/**
 * 执行 Everything 搜索
 */
export async function searchEverything(
  searchText: string,
  baseUrl: string,
  params: Record<string, any>
): Promise<Array<{ name: string; size: number }>> {
  const url = buildSearchUrl(baseUrl, searchText, params)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Search request failed:", error)
    throw error
  }
}
