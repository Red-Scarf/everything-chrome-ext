function cardHtml(data) {
    return `
        <div style="width: 100px; border: 5px solid;">
            <p>搜索结果</p>
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

cardObj = new Card();