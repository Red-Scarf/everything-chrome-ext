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
    const results = await searchEverything(searchText, config.baseUrl, config.params)

    // 显示结果
    if (cardObj) {
      cardObj.updateContent(results)
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
 * 在特定网站（如 JavDB）注入搜索按钮
 */
function injectJavDbButtons() {
  const copyBtns = document.querySelectorAll('.copy-to-clipboard[title="複製番號"]')

  copyBtns.forEach((btn) => {
    // 避免重复注入
    if (btn.nextElementSibling?.tagName === "BUTTON" && (btn.nextElementSibling as HTMLElement).innerText.includes("搜本地")) {
      return
    }

    const code = btn.getAttribute("data-clipboard-text")
    if (code) {
      const searchBtn = document.createElement("button")
      searchBtn.className = "button is-info is-small" // 匹配网站样式
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
    }
  })
}

// 加载时运行注入和自动搜索
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectJavDbButtons()
    autoSearchJavDb()
    batchCheckLocalMovies()
  })
} else {
  injectJavDbButtons()
  autoSearchJavDb()
  batchCheckLocalMovies()
}

/**
 * 页面加载后自动搜索番号 (详情页)
 */
function autoSearchJavDb() {
  const copyBtn = document.querySelector('.copy-to-clipboard[title="複製番號"]')
  if (copyBtn) {
    const code = copyBtn.getAttribute("data-clipboard-text")
    if (code) {
      console.log("自动搜索番号:", code)
      // 设置弹窗位置为页面右侧 (模拟鼠标位置)
      // Card 组件会检测溢出并自动将其放置在光标左侧，所以这里设置在最右侧即可
      mouseX = window.innerWidth - 40
      mouseY = 160 // 距离顶部一定距离

      performSearch(code)
    }
  }
}

/**
 * 批量检查页面上的影片是否在本地存在 (列表页)
 */
async function batchCheckLocalMovies() {
  const movieList = document.querySelector(".movie-list")
  if (!movieList) return

  const items = movieList.querySelectorAll(".item")
  if (items.length === 0) return

  console.log(`[Everything] 发现影片列表，开始检查 ${items.length} 个影片的本地状态...`)

  try {
    const config = await getConfig()

    // 并发执行搜索
    const checks = Array.from(items).map(async (item) => {
      const titleElem = item.querySelector(".video-title strong")
      if (!titleElem) return

      const code = titleElem.textContent?.trim()
      if (!code) return

      try {
        const results = await searchEverything(code, config.baseUrl, config.params)
        if (results && results.length > 0) {
          addLocalBadge(item, results.length)
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
 * 添加本地资源角标
 */
function addLocalBadge(item: Element, count: number) {
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
  badge.title = `发现 ${count} 个本地文件`

  // 如果文件很多，显示具体数量? 暂时只显示"本地"保持简洁，Tooltip显示数量
  // badge.textContent = `本地(${count})`

  container.appendChild(badge)
}
