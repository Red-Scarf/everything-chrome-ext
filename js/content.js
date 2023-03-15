chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("接收到消息：", request);
    if (request.todo == "searchFilm") {
        searchEverything(request.data);
        sendResponse('测试返回数据');
    }

    // 在content_scripts中只能使用部分API，所以将输入的内容交给background页面处理
    // chrome.runtime.sendMessage(chrome.runtime.id, {
    //     todo: "returnSearch",
    //     data: '返回信息',
    // });
});

// 请求everything服务
function searchEverything(str) {
    let keyArr = exposeStr(str);

    chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
        let defaultConfig = $.defaultConfig();
        // 获取本地配置信息或者默认配置
        url = defaultConfig.baseUrl;
        if (result['baseUrl']) url = result['baseUrl'];
        params = defaultConfig.params;
        if (result['params']) params = result['params'];
        params['search'] = keyArr.join('+');
        $.ajax({
            url: url,
            type: "GET",
            data: params,
            success: function (data) {
                console.log('返回结果 success:', data);
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
    keyArr = str.match(/[a-zA-Z]+|\d+/g);
    return keyArr;
}