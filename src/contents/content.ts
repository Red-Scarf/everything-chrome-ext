// 定义 Vue 3 特性标志以消除 ESM 常量警告
// @ts-ignore
Object.assign(globalThis, {
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
})

import { getConfig, getDefaultConfig } from "~src/utils/config"
import { searchEverything, parseSearchText } from "~src/utils/search"
import { Card } from "~src/utils/card"
import "~src/contents/styles/card.css"

// 全局变量
let mouseX = 0
let mouseY = 0
let cardObj: Card | null = null

// 页面加载时初始化卡片
function initCard() {
  if (!cardObj) {
    cardObj = new Card()
  }
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.todo === "searchFilm") {
    performSearch(request.data)
    sendResponse("searchFilm processed")
  } else if (request.todo === "showCard") {
    // 使用来自后台的数据显示卡片
    initCard()
    if (cardObj) {
      cardObj.enable()
      cardObj.updateContent(request.data)
      cardObj.updateCursor(mouseX, mouseY)
    }
    sendResponse("showCard processed")
  }
})

// 追踪鼠标位置
document.addEventListener("mouseup", (ev) => {
  // 右键点击
  if (ev.button === 2) {
    mouseX = ev.clientX
    mouseY = ev.clientY
  }
})

/**
 * 执行搜索并显示结果
 */
async function performSearch(searchText: string) {
  if (!searchText.trim()) {
    console.warn("Search text is empty")
    return
  }

  // 需要时初始化卡片
  initCard()

  try {
    const config = await getConfig()
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    // 显示加载状态
    if (cardObj) {
      cardObj.enable()
      cardObj.showLoading()
      cardObj.updateCursor(mouseX || centerX, mouseY || centerY)
    }

    // 执行搜索
    const results = await searchEverything(
      searchText,
      config.baseUrl,
      config.params,
      config.searchBehavior,
      config.columns,
      config.limit
    )

    // 显示结果
    if (cardObj) {
      cardObj.updateContent(results, searchText)
      cardObj.updateCursor(mouseX || centerX, mouseY || centerY)
    }
  } catch (error) {
    console.error("Search failed:", error)
    if (cardObj) {
      cardObj.updateContent(null)
      cardObj.updateCursor(mouseX, mouseY)
    }
  }
}

/**
 * 在特定网站（如 JavDB）注入搜索按钮，并自动检测本地状态
 */
async function injectJavDbButtons(config: any) {
  const copyBtns = document.querySelectorAll('.copy-to-clipboard[title="複製番號"]')

  copyBtns.forEach(async (btn) => {
    // 避免重复注入
    if (btn.nextElementSibling?.tagName === "BUTTON" && (btn.nextElementSibling as HTMLElement).innerText.includes("本地")) {
      return
    }

    const code = btn.getAttribute("data-clipboard-text")
    if (code) {
      const searchBtn = document.createElement("button")
      searchBtn.className = "button is-info is-small" // 初始样式
      searchBtn.style.marginLeft = "8px"
      searchBtn.style.cursor = "pointer"
      searchBtn.innerHTML = '<span class="icon is-small"><i class="icon-search"></i></span> <span>搜本地</span>'

      searchBtn.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // 更新鼠标位置以便放置卡片
        mouseX = (e as MouseEvent).clientX
        mouseY = (e as MouseEvent).clientY
        performSearch(code)
      }

      btn.parentNode?.insertBefore(searchBtn, btn.nextSibling)

      // 自动检查本地是否存在
      try {
        const results = await searchEverything(
          code,
          config.baseUrl,
          config.params,
          config.searchBehavior,
          config.columns,
          1 // 只需要知道有没有，限制 1 条即可
        )
        if (results && results.length > 0) {
          searchBtn.classList.remove("is-info")
          searchBtn.classList.add("is-success")
          searchBtn.innerHTML = '<span class="icon is-small">✔</span> <span>本地已有</span>'
        }
      } catch (e) {
        // 搜索失败不影响基础功能
      }
    }
  })
}

// 核心逻辑初始化
async function checkAndInit() {
  try {
    const config = await getConfig()
    const hostname = window.location.hostname

    // 如果未配置任何站点，则默认全局生效
    if (!config.allowedSites || config.allowedSites.length === 0) {
      runCoreLogic(config)
      return
    }

    // 检查当前站点是否在白名单中 (支持后缀匹配)
    const isAllowed = config.allowedSites.some((site: string) =>
      hostname === site || hostname.endsWith("." + site)
    )

    if (isAllowed) {
      runCoreLogic(config)
    } else {
      console.log(`[Everything] 当前站点 ${hostname} 未在白名单中，跳过注入。`)
    }
  } catch (e: any) {
    // 处理扩展上下文失效等异常
    if (e.message?.includes("Extension context invalidated")) {
      console.warn("[Everything] 扩展上下文已失效，请刷新页面。")
    }
  }
}

/**
 * 运行核心业务逻辑
 */
function runCoreLogic(config: any) {
  injectJavDbButtons(config)
  autoSearchJavDb(config)
  batchCheckLocalMovies(config)
}

// 加载时运行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkAndInit)
} else {
  checkAndInit()
}

/**
 * 页面加载后自动搜索番号 (详情页)
 */
function autoSearchJavDb(config: any) {
  if (config.autoOpenCard === false) {
    console.log("[Everything] 自动打开卡片策略已禁用。")
    return
  }

  const copyBtn = document.querySelector('.copy-to-clipboard[title="複製番號"]')
  if (copyBtn) {
    const code = copyBtn.getAttribute("data-clipboard-text")
    if (code) {
      console.log("[Everything] 检测到番号元素，启动自动搜索:", code)
      // 设置弹窗位置为页面右侧 (模拟鼠标位置)
      // Card 组件会检测溢出并自动将其放置在光标左侧，所以这里设置在最右侧即可
      mouseX = window.innerWidth - 40
      mouseY = 160 // 距离顶部一定距离

      performSearch(code)
    }
  }
}

/**
 * 批量检查页面上的影片是否在本地存在 (列表页 & 详情页相关推荐)
 */
async function batchCheckLocalMovies(config: any) {
  // 查找列表页 items 和详情页的 tile-items
  const selectors = [
    ".movie-list .item",
    ".tile-item",
    "#related-movies .item"
  ]
  const items = document.querySelectorAll(selectors.join(","))

  if (items.length === 0) return

  console.log(`[Everything] 发现 ${items.length} 个影片元素，开始检查本地状态...`)

  try {
    // 处理提取番号的逻辑 (提取自 .item 或 .tile-item)
    const getCode = (item: Element) => {
      // 方式 1: 列表页常见结构 (.video-title strong)
      const strongTitle = item.querySelector(".video-title strong")
      if (strongTitle?.textContent?.trim()) return strongTitle.textContent.trim()

      // 方式 2: tile-item 结构 (video-number 或 uid)
      const videoNumber = item.querySelector(".video-number")
      if (videoNumber?.textContent?.trim()) return videoNumber.textContent.trim()

      const uidElem = item.querySelector(".uid")
      if (uidElem?.textContent?.trim()) return uidElem.textContent.trim()

      // 方式 3: 兜底找 video-title 的首行或特定类名
      const titleElem = item.querySelector(".video-title") || item.querySelector(".title")
      return titleElem?.textContent?.trim().split(/\s+/)[0] || "" // 尝试取第一个词作为番号
    }

    // 并发执行搜索
    const checks = Array.from(items).map(async (item) => {
      const code = getCode(item)
      if (!code || code.length < 3) return // 防止误触过短字符

      try {
        const results = await searchEverything(
          code,
          config.baseUrl,
          config.params,
          config.searchBehavior,
          config.columns,
          config.limit
        )
        if (results && results.length > 0) {
          addLocalBadge(item, results.length, results, code)
        }
      } catch (err) {
        // 忽略单个搜索错误
      }
    })

    await Promise.all(checks)
    console.log("[Everything] 批量检查完成")
  } catch (error) {
    console.error("[Everything] 批量检查失败:", error)
  }
}

/**
 * 添加本地资源角标，并支持 Hover 显示结果
 */
function addLocalBadge(item: Element, count: number, results: any[], searchText: string) {
  // 优先添加到封面图容器，视觉效果最好
  const container = item.querySelector(".cover") || item.querySelector(".box") || item

  if (!container) return

  // 确保容器有定位上下文
  if (container instanceof HTMLElement) {
    const style = window.getComputedStyle(container)
    if (style.position === "static") {
      container.style.position = "relative"
    }
  }

  // 避免重复添加
  if (container.querySelector(".local-badge")) return

  const badge = document.createElement("div")
  badge.className = "local-badge"
  badge.textContent = "本地"
  badge.title = `发现 ${count} 个本地文件 (悬停查看详情)`

  // 鼠标移入显示列表
  badge.onmouseenter = (e) => {
    initCard()
    if (cardObj) {
      cardObj.cancelHideTimer() // 取消任何潜在的隐藏计划
      cardObj.enable()
      cardObj.updateContent(results, searchText)
      cardObj.updateCursor(e.clientX, e.clientY)
    }
  }

  // 鼠标移出处理
  badge.onmouseleave = (e) => {
    if (cardObj) {
      cardObj.startHideTimer() // 启动延时隐藏计划 (300ms)
    }
  }

  container.appendChild(badge)
}
