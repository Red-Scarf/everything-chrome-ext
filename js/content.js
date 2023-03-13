chrome.runtime.onMessage.addListener((request) => {
    console.log("接收到background消息：", request);
    if (request.todo == "searchFilm") {
        searchEverything(request.data);
    }

    // 在content_scripts中只能使用部分API，所以将输入的内容交给background页面处理
    // chrome.runtime.sendMessage(chrome.runtime.id, {
    //     todo: "returnSearch",
    //     data: '返回信息',
    // });
});

function searchEverything(str) {
    let keyArr = exposeStr(str);
    let url = _getUrl();
    // url += '&search=' + ;
    $.ajax({
        url: url,
        type: "GET",
        data: {
            'c': 5, // 限制5条
            'j': 1, // json返回
            search: keyArr.join('+'),
        },
        success: function (data) {
            console.log('返回结果 success:', data);
        },
        error: function (data) {
            console.log('返回结果 failure:', data);
        }
    });
}

function _getUrl(baseUrl, params) {
    if (!baseUrl) baseUrl = 'http://172.17.208.1:3310';
    return baseUrl;
    if (!params) {
        params = {
            'c': 5, // 限制5条
            'j': 1, // json返回
        };
    }
    let paramsStr = [];
    for (const key in params) {
        paramsStr.push(key + '=' + params[key]);
    }
    paramsStr = paramsStr.join('&');
    return baseUrl + '/?' + paramsStr;
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