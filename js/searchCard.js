function cardHtml(data) {
    return `
        <div class="mySearchCard">
            <div class="mySearchCard-header">
                <h2>标题</h2>
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
    this.el.innerHTML = cardHtml(this.data);
    this.isMove = false; // 是否拖拽移动
    this.el.addEventListener('transitionend', () => {
        this.updateCursor(this.cursorX, this.cursorY); // CSS动画过渡完毕后更新位置
    })

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

    if (this.el) {
        let width = this.el.scrollWidth;
        let height = this.el.scrollHeight;

        if (this.cursorX + width + windowPadding > window.scrollX + window.innerWidth) {
            // Will overflow to the right, put it on the left
            this.el.style.left = `${this.cursorX - cursorPadding - width}px`;
        } else {
            this.el.style.left = `${this.cursorX + cursorPadding}px`;
        }

        if (this.cursorY + height + windowPadding > window.scrollY + window.innerHeight) {
            // Will overflow to the bottom, put it on the top
            this.el.style.top = `${this.cursorY - cursorPadding - height}px`;
        } else {
            this.el.style.top = `${this.cursorY + cursorPadding}px`;
        }
    }
}

// 更新内容
Card.prototype.updateContent = function (records) {
    let content = this.el.querySelector('.card-content');
    content.innerHTML = null;
    // 清空原有数据再展示
    if (records) {
        let tableLine = '';
        for (let index = 0; index < records.length; index++) {
            let element = records[index];
            console.log(element);
            tableLine += `<tr><td>${element['name']}</td><td>${element['size']}</td></tr>`;
        }
        let table = `<table><tr><th>文件名</th><th>大小</th></tr>${tableLine}</table>`;
        content.innerHTML = table;
    } else {
        content.innerHTML = `没有结果`; 
    }
}

// 移动
Card.prototype.moveCard = function (deltaX, deltaY) {
    let rect = this.el.getBoundingClientRect();
    this.el.style.top = rect.y + deltaY + 'px';
    this.el.style.left = rect.x + deltaX + 'px';
}

cardObj = new Card();
cardHeader = cardObj.el.querySelector('.card-header');
closeButton = cardObj.el.querySelector('.close-button');
// 拖拽功能
// 鼠标按住
var mouseDownX = 0;
var mouseDownY = 0;
cardHeader.addEventListener('mousedown', (ev) => {
    // ev.preventDefault(); // 阻止默认事件
    // 记录鼠标初始位置
    mouseDownX = ev.pageX;
    mouseDownY = ev.pageY;
    cardObj.isMove = true;
})
cardHeader.addEventListener('mouseup', () => {
    cardObj.isMove = false;
})
cardHeader.addEventListener('mousemove', (ev) => {
    if (cardObj.isMove) {
        cardObj.moveCard(ev.pageX - mouseDownX, ev.pageY - mouseDownY);
        mouseDownX = ev.pageX;
        mouseDownY = ev.pageY;
    }
})
closeButton.addEventListener('click', () => {
    cardObj.disable(); // 关闭弹窗
})