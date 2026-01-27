import { getConfig } from "~src/utils/config"
import { searchEverything, parseSearchText } from "~src/utils/search"

// 安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchEverything",
    type: "normal",
    title: "使用 Everything 搜索",
    contexts: ["selection"],
    documentUrlPatterns: ["<all_urls>"]
  })
})

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "searchEverything" && tab?.id) {
    try {
      const config = await getConfig()
      const results = await searchEverything(
        info.selectionText || "",
        config.baseUrl,
        config.params
      )

      // 发送结果给内容脚本
      chrome.tabs.sendMessage(
        tab.id,
        {
          todo: "showCard",
          data: results
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "内容脚本不可用:",
              chrome.runtime.lastError.message
            )
          }
        }
      )
    } catch (error) {
      console.error("搜索失败:", error)
    }
  }
})

// 监听来自内容脚本的消息（如果未来需要）
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.todo === "searchFilm") {
    // 处理来自内容脚本的搜索请求
    sendResponse("searchFilm processed")
  }
})
