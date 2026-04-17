<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div
                    class="card border-0 modern-shadow modern-radius overflow-hidden"
                >
                    <!-- Phần Banner trên cùng -->
                    <div class="bg-primary text-white text-center py-5">
                        <i
                            class="bi bi-person-circle"
                            style="font-size: 5rem"
                        ></i>
                        <h3 class="fw-bold mt-2">
                            {{ formData.hoTen || "Đang tải..." }}
                        </h3>
                        <span class="badge bg-light text-primary"
                            >Mã thẻ: {{ formData.maDocGia || "Chưa rõ" }}</span
                        >
                    </div>

                    <!-- Thông tin form -->
                    <div class="card-body p-5">
                        <form @submit.prevent="updateProfile">
                            <div
                                v-if="successMsg"
                                class="alert alert-success mb-4 rounded-3"
                            >
                                <i class="bi bi-check-circle-fill me-2"></i
                                >{{ successMsg }}
                            </div>
                            <div
                                v-if="errorMsg"
                                class="alert alert-danger mb-4 rounded-3"
                            >
                                <i class="bi bi-x-circle-fill me-2"></i
                                >{{ errorMsg }}
                            </div>

                            <div class="row g-3">
                                <!-- Username (Không cho sửa) -->
                                <div class="col-md-6 mb-3">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Tên Đăng Nhập</label
                                    >
                                    <input
                                        type="text"
                                        class="form-control bg-light"
                                        v-model="formData.tenTaiKhoan"
                                        disabled
                                    />
                                    <small
                                        class="text-muted"
                                        style="font-size: 12px"
                                        >Không thể thay đổi tên đăng nhập</small
                                    >
                                </div>

                                <!-- Họ Tên -->
                                <div class="col-md-6 mb-3">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Họ Tên Độc Giả</label
                                    >
                                    <input
                                        type="text"
                                        class="form-control"
                                        v-model="formData.hoTen"
                                        required
                                    />
                                </div>

                                <!-- Số Điện Thoại -->
                                <div class="col-md-6 mb-3">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Số điện thoại</label
                                    >
                                    <input
                                        type="text"
                                        class="form-control"
                                        v-model="formData.dienThoai"
                                        placeholder="Nhập số điện thoại..."
                                    />
                                </div>

                                <!-- Giới Tính -->
                                <div class="col-md-6 mb-3">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Giới Tính</label
                                    >
                                    <select
                                        class="form-select"
                                        v-model="formData.gioiTinh"
                                    >
                                        <option value="" disabled>
                                            -- Chọn giới tính --
                                        </option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <!-- Ngày Sinh -->
                                <div class="col-md-12 mb-3">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Ngày Sinh (Tùy chọn)</label
                                    >
                                    <input
                                        type="text"
                                        class="form-control"
                                        v-model="formData.ngaySinh"
                                        placeholder="VD: 01/01/2000"
                                    />
                                </div>

                                <!-- Địa Chỉ -->
                                <div class="col-md-12 mb-4">
                                    <label
                                        class="form-label text-muted fw-medium"
                                        >Địa chỉ Cư Trú</label
                                    >
                                    <textarea
                                        class="form-control"
                                        rows="2"
                                        v-model="formData.diaChi"
                                        placeholder="Số nhà, đường..."
                                    ></textarea>
                                </div>
                            </div>

                            <div class="d-grid mt-2">
                                <button
                                    type="submit"
                                    class="btn btn-primary btn-lg modern-radius fw-bold"
                                    :disabled="isLoading"
                                >
                                    <span
                                        v-if="isLoading"
                                        class="spinner-border spinner-border-sm me-2"
                                    ></span>
                                    Lưu Thay Đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService from "../../services/auth.service";
import docGiaService from "../../services/docgia.service";

export default {
    setup() {
        const router = useRouter();
        const currentUser = authService.getCurrentUser();

        // Nếu chưa đăng nhập thì đá về trang login
        if (!currentUser || currentUser.role === "admin") {
            alert("Vui lòng đăng nhập bằng tài khoản Độc Giả!");
            router.push("/login");
        }

        const formData = ref({});
        const isLoading = ref(false);
        const successMsg = ref("");
        const errorMsg = ref("");

        // Rút dữ liệu cực mới từ Server về (Thay vì dùng luôn cái User cũ lúc mới đăng nhập)
        const fetchUserData = async () => {
            try {
                const data = await docGiaService.get(currentUser._id);
                formData.value = { ...data };
            } catch (error) {
                console.error(error);
                errorMsg.value = "Không thể lấy thông tin độc giả.";
            }
        };

        // Hàm cập nhật
        const updateProfile = async () => {
            try {
                isLoading.value = true;
                successMsg.value = "";
                errorMsg.value = "";

                // Gọi API Update
                await docGiaService.update(currentUser._id, formData.value);
                successMsg.value = "Cập nhật hồ sơ thành công!";

                // Cập nhật ngầm trong LocalStorage (để cái Navbar nó hiện tên mới liền)
                localStorage.setItem("user", JSON.stringify(formData.value));
                setTimeout(() => window.location.reload(), 1500); // Reload nhẹ
            } catch (error) {
                errorMsg.value = "Lỗi cập nhật. Vui lòng kiểm tra lại.";
            } finally {
                isLoading.value = false;
            }
        };

        onMounted(() => {
            fetchUserData();
        });

        return { formData, isLoading, successMsg, errorMsg, updateProfile };
    },
};
</script>

<style scoped>
.modern-radius {
    border-radius: 15px;
}
.modern-shadow {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}
</style>
