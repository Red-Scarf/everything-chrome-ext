importScripts('./config.js');

// 创建上下文菜单
const contextMenus = [
    { id: "searchFilm", title: "搜索影片", matchUrl: ["https://*.javdb.com/*"] },
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
    if (info.menuItemId == 'searchFilm') {
        let keyArr = exposeStr(info.selectionText);
        chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
            let config = defaultConfig();
            // 获取本地配置信息或者默认配置
            url = config.baseUrl;
            if (result['baseUrl']) url = result['baseUrl'];
            params = config.params;
            if (result['params']) params = result['params'];
            url += '?search=' + keyArr.join('+');
            let urlParams = [];
            for (const key in params) {
                urlParams.push(key + '=' + params[key]);
            }
            url += '&' + urlParams.join('&');
            fetch(url).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            }).then(data => {
                // 发送到content中进行结果的展示
                let res = chrome.tabs.sendMessage(tab.id, {
                    todo: 'showCard', // 展示结果
                    data: data.results,
                }, (response) => {
                    // console.log('sendMessage 的返回结果 response', response);
                });
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        })
    }
});

// 监听content_scripts页面发来的消息
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.todo === "returnSearch") {
//     }
// });

// 分解关键字
function exposeStr(str) {
    // 正则表达式来根据空格、横杠或下划线
    let keyArr = str.split(/[ \-_]/);
    if (keyArr.length > 1) return keyArr;

    // 没有分隔符的，根据英文和数值分组
    keyArr = str.match(/([\u4e00-\u9fa5]+)|([a-zA-Z]+)|(\d+)/g);
    return keyArr;
}