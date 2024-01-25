import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 阿里巴巴字体图标
import "@/assets/font/iconfont.css"

// element-ui
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 自定义指令
import registerDirectives from './directives'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
registerDirectives(app)

app.mount('#app')
