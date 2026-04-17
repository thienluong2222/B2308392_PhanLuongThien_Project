import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Nạp CSS của Bootstrap và Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
// (Tùy chọn) Nạp JS của Bootstrap nếu cần dùng Dropdown, Modal
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)

// Sử dụng Vue Router
app.use(router)

app.mount('#app')