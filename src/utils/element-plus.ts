import type { App } from "vue"
import ElementPlus from "element-plus"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"

export function registerGlobalComponents(app: App) {
    // 安装 Element Plus 插件
    app.use(ElementPlus)

    // 注册所有图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
    }
}
