chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo == "searchFilm") {
        searchEverything(request.data);
        sendResponse('searchFilm 测试返回数据');
    } else if (request.todo == "showCard") {
        // 展示卡片
        cardObj.enable();
        cardObj.updateContent(request.data);
        cardObj.updateCursor(mouseX, mouseY);
        sendResponse('showCard 测试返回数据');
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
    // 鼠标右键
    if (ev.button == 2) {
        mouseX = ev.clientX;
        mouseY = ev.clientY;
    } else {
        // cardObj.disable();
    }
});

// 注入按钮
function addBtn() {
    const container = document.querySelector('.panel-block.first-block');
    if (!container) return; // 页面里没有目标元素就啥也不做

    // 防止重复插入
    if (container.querySelector('.my-custom-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'my-custom-btn';
    btn.textContent = '搜索影片';
    btn.style.marginTop = '6px'; // 随便调
    btn.addEventListener('click', () => {
        // alert('按钮被点了！');
        const fullCode = container.querySelector('.value')?.textContent.trim();
        doSearchFilm(fullCode);
    });

    container.appendChild(btn);
}

// 第一次
addBtn();

// 如果页面是 SPA，节点可能被重新渲染，用 MutationObserver 保活
const observer = new MutationObserver(() => addBtn());
observer.observe(document.body, { childList: true, subtree: true });

// 搜索影片函数
function doSearchFilm(searchText) {
    if (!searchText) {
        console.warn('搜索文本为空');
        return;
    }

    // 分解关键字(与 background.js 中的逻辑一致)
    function exposeStr(str) {
        // 正则表达式来根据空格、横杠或下划线分割
        let keyArr = str.split(/[ \-_]/);
        if (keyArr.length > 1) return keyArr;

        // 没有分隔符的，根据英文和数值分组
        keyArr = str.match(/([\u4e00-\u9fa5]+)|([a-zA-Z]+)|(\d+)/g);
        return keyArr || [str];
    }

    // 获取配置并发起搜索
    chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
        // 获取默认配置
        const config = defaultConfig();
        let url = result['baseUrl'] || config.baseUrl;
        let params = result['params'] || config.params;

        // 构建搜索 URL
        let keyArr = exposeStr(searchText);
        url += '?search=' + keyArr.join('+');
        let urlParams = [];
        for (const key in params) {
            urlParams.push(key + '=' + params[key]);
        }
        url += '&' + urlParams.join('&');

        // 立即展示加载状态
        cardObj.enable();
        cardObj.showLoading();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        cardObj.updateCursor(mouseX || centerX, mouseY || centerY);

        // 发起请求
        fetch(url).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        }).then(data => {
            // 展示搜索结果
            cardObj.updateContent(data.results);
            // 结果返回后再次更新位置(以防内容高度变化)
            cardObj.updateCursor(mouseX || centerX, mouseY || centerY);
        }).catch(error => {
            console.error('搜索请求失败:', error);
            // 展示错误提示
            cardObj.updateContent(null);
            cardObj.updateCursor(mouseX || centerX, mouseY || centerY);
        });
    });
}