// 创建上下文菜单
const contextMenus = [
    { id: "searchFilm", title: "搜索影片", matchUrl: ["<all_urls>"] },
];
for (let menu of contextMenus) {
    chrome.contextMenus.create({
        id: menu.id,
        type: "normal",
        title: menu.title,
        contexts: ["selection"], // 右键点击选中文字时显示
        documentUrlPatterns: menu.matchUrl, // 限制菜单选项仅应用于URL匹配给定模式之一的页面
    });
}

// 监听菜单按钮点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('监听菜单按钮点击事件');
    console.log('info', info);
    console.log('tab', tab);
    if (info.menuItemId == 'searchFilm') {
        // info.selectionText // 选中的文本名称
        let response = chrome.tabs.sendMessage(tab.id, {
            todo: 'searchFilm',
            data: info.selectionText, // 文本
        });
        console.log('response', response);
    }
});
// 监听content_scripts页面发来的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("接收到content_scripts消息：", request);
    if (request.todo === "returnSearch") {
    }
});

