import { createRouter, createWebHistory } from "vue-router";

// Import các trang dành cho Độc Giả (Chúng ta sẽ tạo file ngay bước sau)
import Home from "../views/docgia/Home.vue";
import Library from "../views/docgia/Library.vue";
import ChiTietSach from "../views/docgia/ChiTietSach.vue";
import LoginDocGia from "../views/docgia/LoginDocGia.vue";
import LichSuMuon from "../views/docgia/LichSuMuon.vue";
import Dashboard from "../views/admin/Dashboard.vue";
import QuanLySach from "../views/admin/QuanLySach.vue";
import QuanLyNXB from "../views/admin/QuanLyNXB.vue";
import LoginAdmin from "../views/admin/LoginAdmin.vue";
import QuanLyDocGia from "../views/admin/QuanLyDocGia.vue";
import QuanLyNhanVien from "../views/admin/QuanLyNhanVien.vue";
import Profile from "../views/docgia/Profile.vue";

const routes = [
    { path: "/", component: Home },
    { path: "/thuvien", component: Library },
    { path: "/login", component: LoginDocGia },
    { path: "/lichsu", component: LichSuMuon },
    { path: '/profile', component: Profile },
    { path: "/sach/:id", component: ChiTietSach },
    { path: "/admin", component: Dashboard },
    { path: "/admin/sach", component: QuanLySach },
    { path: "/admin/nhaxuatban", component: QuanLyNXB },
    { path: "/admin-login", component: LoginAdmin },
    { path: "/admin/docgia", component: QuanLyDocGia },
    { path: "/admin/nhanvien", component: QuanLyNhanVien },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
