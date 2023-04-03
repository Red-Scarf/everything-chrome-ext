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