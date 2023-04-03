function cardHtml(data) {
    return `
        <div class="mySearchCard">
            <div class="mySearchCard-header">
                <h2>搜索结果</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="mySearchCard-content">
                <table>
                    <tr>
                        <th>文件名</th>
                        <th>大小</th>
                    </tr>
                    <tr>
                        <td>文件名1</td>
                        <td>10000</td>
                    </tr>
                    <tr>
                        <td>文件名2</td>
                        <td>10099</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function Card() {
    this.data = {};
    this.cursorX = 0;
    this.cursorY = 0;
    this.el = document.createElement('div');
    this.el.style.position = 'absolute'; // 位置绝对值
    this.el.style.display = 'none'; // 默认隐藏
    this.el.style['z-index'] = 999; // 顶层
    this.el.innerHTML = cardHtml(this.data);

    this.disable();
    document.body.appendChild(this.el);
}

// 隐藏
Card.prototype.disable = function () {
    this.el.style.display = 'none';
}

// 展示
Card.prototype.enable = function () {
    this.el.style.display = 'flex';
}

// 更新位置
Card.prototype.updateCursor = function (cursorX, cursorY) {
    const cursorPadding = 10;
    const windowPadding = 20;

    this.cursorX = cursorX;
    this.cursorY = cursorY;

    // console.log('mySearchCard', this.el.querySelector('.mySearchCard'));
    if (this.el) {
        let width = this.el.scrollWidth;
        let height = this.el.scrollHeight;

        let left = 0;
        // console.log('this.cursorX', this.cursorX, 'width', width, 'windowPadding', windowPadding);
        // console.log('window.scrollX', window.scrollX, 'window.innerWidth', window.innerWidth);
        if (this.cursorX + width + windowPadding > window.scrollX + window.innerWidth) {
            // Will overflow to the right, put it on the left
            left = this.cursorX - cursorPadding - width;
        } else {
            left = this.cursorX + cursorPadding;
        }
        this.el.style.left = `${left}px`;

        let top = 0;
        // console.log('this.cursorY', this.cursorY, 'height', height, 'windowPadding', windowPadding);
        // console.log('window.scrollY', window.scrollY, 'window.innerHeight', window.innerHeight);
        if (this.cursorY + height + windowPadding > window.scrollY + window.innerHeight) {
            // Will overflow to the bottom, put it on the top
            top = this.cursorY - cursorPadding - height;
        } else {
            top = this.cursorY + cursorPadding;
        }
        this.el.style.top = `${top}px`;
    }
}

// 更新内容
Card.prototype.updateContent = function (records) {
    let content = this.el.querySelector('.mySearchCard-content');
    content.innerHTML = null;
    // 清空原有数据再展示
    if (records) {
        let tableLine = '';
        for (let index = 0; index < records.length; index++) {
            let element = records[index];
            tableLine += `<tr><td>${element['name']}</td><td>${element['size']}</td></tr>`;
        }
        let table = `<table><tr><th>文件名</th><th>大小</th></tr>${tableLine}</table>`;
        content.innerHTML = table;
    } else {
        content.innerHTML = `没有结果`;
    }
}

cardObj = new Card();
cardHeader = cardObj.el.querySelector('.mySearchCard-header');
// 定义变量，记录鼠标按下时的坐标
var mouseDownX = 0;
var mouseDownY = 0;
// 定义变量，记录元素的初始位置
var elementX = 0;
var elementY = 0;
cardHeader.addEventListener('mousedown', (ev) => {
    ev.preventDefault(); // 阻止默认事件
    // 记录鼠标初始位置
    mouseDownX = ev.clientX;
    mouseDownY = ev.clientY;
    // 记录元素的当前位置
    var elementRect = cardObj.el.getBoundingClientRect();
    elementY = elementRect.top;
    elementX = elementRect.left;
    // 监听鼠标移动事件
    document.addEventListener('mousemove', onMouseMove);
})
// 监听鼠标松开事件
document.addEventListener('mouseup', function (event) {
    // 移除鼠标移动事件监听器
    document.removeEventListener('mousemove', onMouseMove);
});
// 鼠标移动事件处理函数
function onMouseMove(event) {
    // 计算鼠标移动的距离
    var deltaX = event.clientX - mouseDownX;
    var deltaY = event.clientY - mouseDownY;

    // 移动元素的位置 window.scrollX 计算页面滚动的偏移量
    cardObj.el.style.left = elementX + deltaX + window.scrollX + 'px';
    cardObj.el.style.top = elementY + deltaY + window.scrollY + 'px';
}

// 关闭弹窗
closeButton = cardObj.el.querySelector('.close-button');
closeButton.addEventListener('click', () => {
    cardObj.disable();
})