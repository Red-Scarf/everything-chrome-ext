const config = {
  manifest: {
    name: "Everything Chrome Extension",
    description: "在浏览器中使用 Everything 搜索本地文件",
    permissions: ["contextMenus", "storage", "tabs"],
    host_permissions: ["<all_urls>"]
  },
  excludeFileProtocols: ["icon"],
  build: {
    excludeAssets: ["**/*icon*"]
  }
}

export default config
