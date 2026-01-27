import { formatFileSize } from "./search"

interface SearchResult {
  name: string
  size: number
}

export class Card {
  private el: HTMLElement
  private cursorX: number = 0
  private cursorY: number = 0
  private mouseDownX: number = 0
  private mouseDownY: number = 0
  private elementX: number = 0
  private elementY: number = 0

  constructor() {
    this.el = document.createElement("div")
    this.el.style.position = "absolute"
    this.el.style.display = "none"
    this.el.style.zIndex = "10000"
    this.el.className = "mySearchCard"
    this.el.innerHTML = this.getHtml()

    this.setupEventListeners()
    document.body.appendChild(this.el)
  }

  private getHtml(): string {
    return `
      <div class="mySearchCard">
        <div class="mySearchCard-header">
          <h2>搜索结果</h2>
          <button class="close-button">&times;</button>
        </div>
        <div class="mySearchCard-content">
          <p>等待搜索结果...</p>
        </div>
      </div>
    `
  }

  // 绑定 this 上下文的 mouseMove 函数
  private onMouseMoveBound = (event: MouseEvent) => this.onMouseMove(event)

  private setupEventListeners(): void {
    const cardHeader = this.el.querySelector(".mySearchCard-header") as HTMLElement
    const closeButton = this.el.querySelector(".close-button") as HTMLElement

    if (cardHeader) {
      cardHeader.addEventListener("mousedown", (ev) => this.onHeaderMouseDown(ev))
    }

    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", this.onMouseMoveBound)
    })

    if (closeButton) {
      closeButton.addEventListener("click", () => this.disable())
    }
  }

  private onHeaderMouseDown(ev: MouseEvent): void {
    ev.preventDefault()
    this.mouseDownX = ev.clientX
    this.mouseDownY = ev.clientY

    const rect = this.el.getBoundingClientRect()
    this.elementX = rect.left
    this.elementY = rect.top

    document.addEventListener("mousemove", this.onMouseMoveBound)
  }

  private onMouseMove(event: MouseEvent): void {
    const deltaX = event.clientX - this.mouseDownX
    const deltaY = event.clientY - this.mouseDownY

    this.el.style.left = this.elementX + deltaX + window.scrollX + "px"
    this.el.style.top = this.elementY + deltaY + window.scrollY + "px"
  }

  enable(): void {
    this.el.style.display = "flex"
  }

  disable(): void {
    this.el.style.display = "none"
  }

  showLoading(): void {
    const content = this.el.querySelector(".mySearchCard-content") as HTMLElement
    if (content) {
      content.innerHTML = `<div style="text-align: center; padding: 20px;">正在搜索...</div>`
    }
  }

  updateContent(records: SearchResult[] | null): void {
    const content = this.el.querySelector(".mySearchCard-content") as HTMLElement
    if (!content) return

    if (!records || records.length === 0) {
      content.innerHTML = `<div style="padding: 20px; text-align: center;">没有结果</div>`
      return
    }

    let tableRows = ""
    for (const record of records) {
      const sizeStr = formatFileSize(record.size)
      tableRows += `<tr><td>${this.escapeHtml(record.name)}</td><td>${sizeStr}</td></tr>`
    }

    const table = `
      <table>
        <tr>
          <th>文件名</th>
          <th>大小</th>
        </tr>
        ${tableRows}
      </table>
    `
    content.innerHTML = table
  }

  updateCursor(cursorX: number, cursorY: number): void {
    const cursorPadding = 10
    const windowPadding = 20

    this.cursorX = cursorX
    this.cursorY = cursorY

    const width = this.el.scrollWidth
    const height = this.el.scrollHeight

    // 计算左侧位置
    let left: number
    if (
      this.cursorX + width + windowPadding >
      window.scrollX + window.innerWidth
    ) {
      // 向右溢出，放在左侧
      left = this.cursorX - cursorPadding - width
    } else {
      left = this.cursorX + cursorPadding
    }
    this.el.style.left = `${left}px`

    // 计算顶部位置
    let top: number
    if (
      this.cursorY + height + windowPadding >
      window.scrollY + window.innerHeight
    ) {
      // 向下溢出，放在顶部
      top = this.cursorY - cursorPadding - height
    } else {
      top = this.cursorY + cursorPadding
    }
    this.el.style.top = `${top}px`
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}
