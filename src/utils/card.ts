// 定义 Vue 3 特性标志以消除 ESM 常量警告
// @ts-ignore
Object.assign(globalThis, {
  __VUE_OPTIONS_API__: true,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
})

import { createApp, reactive, h } from "vue"
import SearchResultList from "../components/SearchResultList.vue"
import { registerGlobalComponents } from "./element-plus"
import { getConfig } from "./config"

interface SearchResult {
  name: string
  size: number
  path?: string
  date_modified?: number
  attributes?: string
  [key: string]: any
}

export class Card {
  private el: HTMLElement
  private vueApp: any
  private state = reactive({
    results: [] as SearchResult[],
    config: null as any,
    loading: false,
    lastSearchText: ""
  })
  private hideTimer: any = null

  private cursorX: number = 0
  private cursorY: number = 0
  private mouseDownX: number = 0
  private mouseDownY: number = 0
  private elementX: number = 0
  private elementY: number = 0

  constructor() {
    this.el = document.createElement("div")
    this.el.className = "mySearchCard everything-card"
    this.el.style.zIndex = "2147483647" // 最高优先级
    this.el.style.display = "none"
    this.el.style.position = "fixed"

    this.el.innerHTML = `
      <div class="mySearchCard-header everything-card-header">
        <h2>搜索结果</h2>
        <button class="close-button everything-close-btn">&times;</button>
      </div>
      <div class="mySearchCard-vue-root everything-card-content"></div>
    `

    // 添加卡片自身的 Hover 维持逻辑
    this.el.addEventListener("mouseenter", () => this.cancelHideTimer())
    this.el.addEventListener("mouseleave", () => this.startHideTimer())

    this.setupEventListeners()
    document.body.appendChild(this.el)

    // 初始化 Vue 应用，使用渲染函数确保响应式
    const vueRoot = this.el.querySelector(".mySearchCard-vue-root") as HTMLElement
    this.vueApp = createApp({
      render: () => h(SearchResultList, {
        results: this.state.results,
        config: this.state.config,
        loading: this.state.loading,
        lastSearchText: this.state.lastSearchText
      })
    })

    // 注入全局组件和图标
    registerGlobalComponents(this.vueApp)

    this.vueApp.mount(vueRoot)

    // 初始化配置
    this.refreshConfig()
  }

  private async refreshConfig() {
    this.state.config = await getConfig()
  }

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
    this.refreshConfig() // 每次打开时刷新配置，以确保同步字段设置
  }

  disable(): void {
    this.el.style.display = "none"
  }

  showLoading(): void {
    this.state.loading = true
    this.state.results = []
  }

  updateContent(records: SearchResult[] | null, searchText: string = ""): void {
    this.state.loading = false
    this.state.results = records || []
    this.state.lastSearchText = searchText

    // 手动更新 Vue 根组件的 Props (由于是命令式调用，直接通过 state 即可)
    // 但在 createApp 时传入的是响应式状态，所以这里 state 的变更会触发渲染
  }

  startHideTimer(delay = 300): void {
    this.cancelHideTimer()
    this.hideTimer = setTimeout(() => {
      this.disable()
    }, delay)
  }

  cancelHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
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
