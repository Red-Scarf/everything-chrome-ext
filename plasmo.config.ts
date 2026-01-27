import type { PlasmoConfig } from "plasmo"

const config: PlasmoConfig = {
  manifest: {
    name: "Everything Chrome Extension",
    description: "在浏览器中使用 Everything 搜索本地文件",
    permissions: ["contextMenus", "storage", "tabs"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "Everything 搜索",
      default_popup: "src/pages/popup/index.html"
    },
    options_ui: {
      page: "src/pages/options/index.html",
      open_in_tab: true
    }
  },
  excludeFileProtocols: ["icon"],
  build: {
    excludeAssets: ["**/*icon*"]
  }
}

export default config
