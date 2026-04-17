<template>
    <div id="app-container">
        <!-- ================= TRẠNG THÁI 1: TRANG ĐĂNG NHẬP ADMIN ================= -->
        <!-- Sống biệt lập, không có Navbar ولا Sidebar -->
        <div v-if="isLoginAdminRoute">
            <router-view></router-view>
        </div>

        <!-- ================= TRẠNG THÁI 2: LAYOUT ĐỘC GIẢ (Top Navbar) ================= -->
        <div v-else-if="!isAdminRoute">
            <nav
                class="navbar navbar-expand-lg navbar-light bg-white modern-shadow py-3 mb-4"
            >
                <div class="container">
                    <router-link
                        class="navbar-brand fw-bold text-primary fs-4"
                        to="/"
                    >
                        <i class="bi bi-box-seam-fill me-2"></i>LibManager
                    </router-link>

                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
                            <li class="nav-item px-2">
                                <router-link
                                    class="nav-link"
                                    to="/"
                                    exact-active-class="text-primary fw-bold"
                                    >Trang Chủ</router-link
                                >
                            </li>
                            <li class="nav-item px-2">
                                <router-link
                                    class="nav-link"
                                    to="/thuvien"
                                    active-class="text-primary fw-bold"
                                    >Thư Viện</router-link
                                >
                            </li>
                            <li class="nav-item px-2">
                                <router-link
                                    class="nav-link"
                                    to="/lichsu"
                                    active-class="text-primary fw-bold"
                                    >Lịch Sử Mượn</router-link
                                >
                            </li>
                        </ul>

                        <div class="d-flex align-items-center">
                            <template v-if="!currentUser">
                                <router-link
                                    to="/login"
                                    class="btn btn-outline-primary fw-medium modern-radius me-2"
                                    >Đăng Nhập</router-link
                                >
                                <router-link
                                    to="/login"
                                    class="btn btn-primary fw-medium modern-radius"
                                >
                                    Đăng Ký
                                </router-link>
                            </template>
                            <template v-else>
                                <span class="me-3 fw-bold text-dark"
                                    >Xin chào,
                                    <span class="text-primary">{{
                                        currentUser.hoTen ||
                                        currentUser.tenTaiKhoan
                                    }}</span></span
                                >
                                <router-link
                                    to="/profile"
                                    class="btn btn-light border fw-medium modern-radius me-2"
                                    ><i class="bi bi-person-circle me-1"></i> Hồ
                                    Sơ</router-link
                                >
                                <button
                                    @click="dangXuat"
                                    class="btn btn-danger fw-medium modern-radius"
                                >
                                    <i class="bi bi-box-arrow-right"></i> Đăng
                                    Xuất
                                </button>
                            </template>
                        </div>
                    </div>
                </div>
            </nav>
            <div class="container main-content pb-5">
                <router-view></router-view>
            </div>
        </div>

        <!-- ================= TRẠNG THÁI 3: LAYOUT ADMIN (Sidebar trái) ================= -->
        <div v-else class="d-flex" id="wrapper">
            <div
                class="bg-white border-end sidebar"
                style="width: 260px; min-height: 100vh"
            >
                <div
                    class="sidebar-heading text-primary fw-bold text-center py-4 fs-4 border-bottom"
                >
                    <i class="bi bi-box-seam-fill me-2"></i>Admin CPL
                </div>
                <div class="list-group list-group-flush px-3 mt-3">
                    <router-link
                        to="/admin"
                        class="list-group-item list-group-item-action rounded-3 mb-2"
                        exact-active-class="active"
                    >
                        <i class="bi bi-speedometer2 me-3"></i> Bảng điều khiển
                    </router-link>
                    <router-link
                        to="/admin/sach"
                        class="list-group-item list-group-item-action rounded-3 mb-2"
                        active-class="active"
                    >
                        <i class="bi bi-book-half me-3"></i> Quản lý Sách
                    </router-link>
                    <router-link
                        to="/admin/nhaxuatban"
                        class="list-group-item list-group-item-action rounded-3 mb-2"
                        active-class="active"
                    >
                        <i class="bi bi-building me-3"></i> Quản lý NXB
                    </router-link>
                    <router-link
                        to="/admin/docgia"
                        class="list-group-item list-group-item-action rounded-3 mb-2"
                        active-class="active"
                    >
                        <i class="bi bi-people-fill me-3"></i> Quản lý Độc Giả
                    </router-link>
                    <router-link
                        to="/admin/nhanvien"
                        class="list-group-item list-group-item-action rounded-3 mb-2"
                        active-class="active"
                    >
                        <i class="bi bi-person-badge-fill me-3"></i> Quản lý
                        Nhân Viên
                    </router-link>
                </div>
            </div>

            <!-- Vùng hiển thị Router View cho Admin -->
            <div
                id="page-content-wrapper"
                class="w-100"
                style="background-color: #f7f9fc"
            >
                <div class="container-fluid p-4">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import authService from "./services/auth.service";

export default {
    setup() {
        const currentUser = ref(null);
        const router = useRouter();
        const route = useRoute();

        // 1. Kiểm tra xem cõ phải màn hình Đăng Nhập cho Admin không
        const isLoginAdminRoute = computed(() => {
            return route.path === "/admin-login";
        });

        // 2. Chặn điều kiện đúng cho Admin: Url chứa chữ `/admin` nhưng KHÔNG PHẢI là trang login.
        const isAdminRoute = computed(() => {
            return (
                route.path.startsWith("/admin") && route.path !== "/admin-login"
            );
        });

        onMounted(() => {
            currentUser.value = authService.getCurrentUser();
        });

        const dangXuat = () => {
            authService.logout();
            currentUser.value = null;
            router.push("/login");
        };

        // Quan trọng: Trả về để <template> xài được!
        return { currentUser, dangXuat, isLoginAdminRoute, isAdminRoute };
    },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
body {
    font-family: "Inter", sans-serif;
    background-color: #f7f9fc;
}
.modern-radius {
    border-radius: 1rem !important;
}
.modern-shadow {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}
.list-group-item {
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s;
    border: none;
}
.list-group-item.active {
    background-color: #0d6efd !important;
    color: #fff !important;
}
.list-group-item:hover:not(.active) {
    background-color: #f8f9fa;
    color: #212529 !important;
}
</style>
