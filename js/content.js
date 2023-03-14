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
    _getUrl();
    let url = 'http://172.17.208.1:3310';
    let params = _getParams();
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

// 获取参数信息
function _getParams() {
    //
}

// 获取服务地址
function _getUrl() {
    // TODO 如何只在一处地方配置默认参数
    console.log('获取服务地址11');
    $.getJSON('../config.json', (data) => {
        console.log('获取服务地址22', data);
    });
    // let baseUrl = 'http://172.17.208.1:3310';
    // return baseUrl;
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