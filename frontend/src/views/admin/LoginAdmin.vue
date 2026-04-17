<template>
    <div
        class="login-admin-bg d-flex align-items-center justify-content-center"
    >
        <div
            class="card border-0 modern-shadow modern-radius"
            style="width: 450px; overflow: hidden"
        >
            <div class="row g-0">
                <!-- Phần Tab Chuyển đổi -->
                <div
                    class="d-flex bg-light text-center fw-bold text-muted pointer"
                    style="cursor: pointer"
                >
                    <div
                        :class="[
                            'p-3 w-50',
                            isLogin ? 'bg-primary text-white' : '',
                        ]"
                        @click="isLogin = true"
                    >
                        ĐĂNG NHẬP
                    </div>
                    <div
                        :class="[
                            'p-3 w-50',
                            !isLogin ? 'bg-primary text-white' : '',
                        ]"
                        @click="isLogin = false"
                    >
                        ĐĂNG KÝ
                    </div>
                </div>

                <div class="card-body p-5">
                    <h4 class="text-center fw-bold mb-4 text-primary">
                        Quản trị hệ thống
                    </h4>

                    <!-- FORM ĐĂNG NHẬP -->
                    <form v-if="isLogin" @submit.prevent="handleLogin">
                        <div class="mb-3">
                            <label class="form-label text-muted fw-medium"
                                >Mã Nhân Viên</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="loginData.MSNV"
                                required
                                placeholder=""
                            />
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted fw-medium"
                                >Mật khẩu</label
                            >
                            <input
                                type="password"
                                class="form-control"
                                v-model="loginData.Password"
                                required
                                placeholder=""
                            />
                        </div>
                        <button
                            type="submit"
                            class="btn btn-primary w-100 fw-bold modern-radius py-2"
                        >
                            Bắt đầu ca làm việc
                        </button>
                    </form>

                    <!-- FORM ĐĂNG KÝ -->
                    <form v-else @submit.prevent="handleRegister">
                        <div class="mb-3">
                            <label class="form-label text-muted fw-medium"
                                >Mã Nhân Viên</label
                            >
                            <input
                                type="text"
                                class="form-control shadow-none"
                                v-model="registerData.MSNV"
                                required
                                placeholder=""
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted fw-medium"
                                >Họ và Tên</label
                            >
                            <input
                                type="text"
                                class="form-control shadow-none"
                                v-model="registerData.HoTenNV"
                                required
                                placeholder=""
                            />
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted fw-medium"
                                >Mật Khẩu</label
                            >
                            <input
                                type="password"
                                class="form-control shadow-none"
                                v-model="registerData.Password"
                                required
                                placeholder=""
                            />
                        </div>
                        <button
                            type="submit"
                            class="btn btn-success w-100 fw-bold modern-radius py-2"
                        >
                            Tạo tài khoản quản trị
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "../../services/auth.service";

export default {
    setup() {
        const router = useRouter();
        const isLogin = ref(true);

        const loginData = ref({ MSNV: "", Password: "" });
        const registerData = ref({
            MSNV: "",
            HoTenNV: "",
            Password: "",
            ChucVu: "Admin",
        });

        const handleLogin = async () => {
            try {
                await authService.loginAdmin(loginData.value);
                alert("Chào mừng Admin quay lại!");
                router.push("/admin"); // Đăng nhập xong nhảy thẳng vào Bảng điều khiển
            } catch (error) {
                alert("Sai tài khoản hoặc mật khẩu, vui lòng thử lại!");
            }
        };

        const handleRegister = async () => {
            try {
                await authService.registerAdmin(registerData.value);
                alert(
                    "Tạo tài khoản thành công! Xác nhận để đăng nhập ngay!",
                );
                isLogin.value = true; // Chuyển nấp lại sang tab Đăng nhập
                // Tự điền sẵn mã NV cho tiện
                loginData.value.MSNV = registerData.value.MSNV;
            } catch (error) {
                alert("Có lỗi xảy ra hoặc Mã NV đã bị trùng!");
            }
        };

        return {
            isLogin,
            loginData,
            registerData,
            handleLogin,
            handleRegister,
        };
    },
};
</script>

<style scoped>
.login-admin-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #e3f2fd 0%, #1e88e5 100%);
}
.modern-radius {
    border-radius: 12px;
}
.modern-shadow {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
</style>
