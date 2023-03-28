chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("接收到消息：", request);
    if (request.todo == "searchFilm") {
        searchEverything(request.data);
        sendResponse('测试返回数据');
    } else if (request.todo == "showCard") {
        // 展示卡片
        cardObj.enable();
        cardObj.updateCursor(mouseX + 120, mouseY - 20);
        cardObj.updateContent(request.data);
    }

    // 在content_scripts中只能使用部分API，所以将输入的内容交给background页面处理
    // chrome.runtime.sendMessage(chrome.runtime.id, {
    //     todo: "returnSearch",
    //     data: '返回信息',
    // });
});

mouseX = 0;
mouseY = 0;
// 获取鼠标位置
document.addEventListener('mouseup', (ev) => {
    console.log('点击鼠标', ev);
    // 鼠标右键
    if (ev.button == 2) {
        mouseX = ev.pageX;
        mouseY = ev.pageY;
    } else {
        // cardObj.disable();
    }
});

// 请求everything服务
function searchEverything(str) {
    let keyArr = exposeStr(str);

    chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
        let config = defaultConfig();
        // 获取本地配置信息或者默认配置
        url = config.baseUrl;
        if (result['baseUrl']) url = result['baseUrl'];
        params = config.params;
        if (result['params']) params = result['params'];
        url += '?search=' + keyArr.join('+');
        $.ajax({
            url: url,
            type: "GET",
            data: params,
            success: function (data) {
                console.log('返回结果 success:', data);
                // 展示数据
                cardObj.enable();
                cardObj.updateCursor(mouseX + 120, mouseY - 20);
                cardObj.updateContent(data.results);
            },
            error: function (data) {
                console.log('返回结果 failure:', data);
            }
        });
    })
}

// 分解关键字
function exposeStr(str) {
    // 正则表达式来根据空格、横杠或下划线
    let keyArr = str.split(/[ \-_]/);
    if (keyArr.length > 1) return keyArr;

    // 没有分隔符的，根据英文和数值分组
    keyArr = str.match(/([\u4e00-\u9fa5]+)|([a-zA-Z]+)|(\d+)/g);
    return keyArr;
}