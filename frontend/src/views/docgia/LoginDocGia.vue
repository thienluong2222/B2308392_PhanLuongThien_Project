<template>
    <div class="row justify-content-center pt-5">
        <div class="col-md-6 col-lg-5">
            <div
                class="card border-0 modern-shadow modern-radius overflow-hidden"
            >
                <!-- Tabs Chuyển Đổi cho Độc Giả -->
                <div
                    class="d-flex bg-light text-center fw-bold text-muted"
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

                <div class="card-body p-4 p-md-5">
                    <h3 class="text-center fw-bold mb-4 text-primary">
                        Thư Viện <br />
                        LibManager
                    </h3>

                    <!-- Cảnh báo trạng thái Form -->
                    <div
                        v-if="errorMessage"
                        class="alert alert-danger py-2 fs-6"
                    >
                        <i class="bi bi-exclamation-triangle-fill me-2"></i
                        >{{ errorMessage }}
                    </div>
                    <div
                        v-if="successMessage"
                        class="alert alert-success py-2 fs-6"
                    >
                        <i class="bi bi-check-circle-fill me-2"></i
                        >{{ successMessage }}
                    </div>

                    <!-- ===================== FORM ĐĂNG NHẬP ===================== -->
                    <form v-if="isLogin" @submit.prevent="handleLogin">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-medium"
                                >Tên Đăng Nhập</label
                            >
                            <input
                                type="text"
                                v-model="loginUser.tenTaiKhoan"
                                class="form-control form-control-lg bg-light border-0"
                                required
                            />
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted small fw-medium"
                                >Mật Khẩu</label
                            >
                            <input
                                type="password"
                                v-model="loginUser.matKhau"
                                class="form-control form-control-lg bg-light border-0"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            class="btn btn-primary w-100 py-2 fs-5 fw-bold modern-radius mb-2"
                            :disabled="isLoading"
                        >
                            <span
                                v-if="isLoading"
                                class="spinner-border spinner-border-sm me-2"
                            ></span>
                            Đăng Nhập
                        </button>
                        <p class="text-center mt-3 text-muted small">
                            Tài khoản cho sinh viên và bạn đọc.
                        </p>
                    </form>

                    <!-- ===================== FORM ĐĂNG KÝ ===================== -->
                    <form v-else @submit.prevent="handleRegister">
                        <!-- Mã Độc Giả -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-medium"
                                >Mã Độc Giả *</label
                            >
                            <input
                                type="text"
                                v-model="registerUser.maDocGia"
                                class="form-control bg-light border-0"
                                required
                            />
                        </div>
                        <!-- Họ Tên -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-medium"
                                >Họ và Tên *</label
                            >
                            <input
                                type="text"
                                v-model="registerUser.hoTen"
                                class="form-control bg-light border-0"
                                required
                            />
                        </div>
                        <!-- Tên Đăng Nhập -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-medium"
                                >Tên Đăng Nhập *</label
                            >
                            <input
                                type="text"
                                v-model="registerUser.tenTaiKhoan"
                                class="form-control bg-light border-0"
                                required
                            />
                        </div>
                        <!-- Mật Khẩu -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-medium"
                                >Mật Khẩu *</label
                            >
                            <input
                                type="password"
                                v-model="registerUser.matKhau"
                                class="form-control bg-light border-0"
                                required
                            />
                        </div>
                        <!-- Điện thoại -->
                        <div class="mb-4">
                            <label class="form-label text-muted small fw-medium"
                                >Số Điện Thoại</label
                            >
                            <input
                                type="text"
                                v-model="registerUser.dienThoai"
                                class="form-control bg-light border-0"
                            />
                        </div>

                        <button
                            type="submit"
                            class="btn btn-success w-100 py-2 fs-5 fw-bold modern-radius"
                            :disabled="isLoading"
                        >
                            <span
                                v-if="isLoading"
                                class="spinner-border spinner-border-sm me-2"
                            ></span>
                            Đăng Ký Thẻ
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import authService from "../../services/auth.service";

export default {
    setup() {
        const router = useRouter();
        const isLogin = ref(true);
        const isLoading = ref(false);

        const errorMessage = ref("");
        const successMessage = ref("");

        const loginUser = reactive({ tenTaiKhoan: "", matKhau: "" });
        const registerUser = reactive({
            maDocGia: "",
            tenTaiKhoan: "",
            matKhau: "",
            hoTen: "",
            dienThoai: "",
        });

        const handleLogin = async () => {
            try {
                errorMessage.value = "";
                successMessage.value = "";
                isLoading.value = true;

                await authService.login(loginUser);
                router.push("/");
                setTimeout(() => window.location.reload(), 100);
            } catch (err) {
                errorMessage.value =
                    err.response?.data?.message ||
                    "Đăng nhập thất bại. Hãy thử lại.";
            } finally {
                isLoading.value = false;
            }
        };

        const handleRegister = async () => {
            try {
                errorMessage.value = "";
                successMessage.value = "";
                isLoading.value = true;

                // Gửi lệnh tạo mới Độc Giá đến Server
                await authService.register(registerUser);

                // Hiện thông báo và chuyển qua Tab Login
                successMessage.value =
                    "TẠO THẺ THÀNH CÔNG! Hãy tiến hành Đăng Nhập.";
                isLogin.value = true;

                // Tự động rinh "Tên tài khoản" qua ô Login cho tiện
                loginUser.tenTaiKhoan = registerUser.tenTaiKhoan;
                loginUser.matKhau = "";
            } catch (err) {
                errorMessage.value =
                    err.response?.data?.message ||
                    "Đăng ký thất bại. Có thể Mã thẻ hoặc Tên tài khoản đã tồn tại.";
            } finally {
                isLoading.value = false;
            }
        };

        return {
            isLogin,
            loginUser,
            registerUser,
            errorMessage,
            successMessage,
            isLoading,
            handleLogin,
            handleRegister,
        };
    },
};
</script>
