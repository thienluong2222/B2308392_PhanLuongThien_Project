<template>
    <div v-if="sach" class="chitiet-page">
        <div class="row bg-white modern-shadow modern-radius p-5">
            <!-- Cột trái chứa Hình Bìa Cỡ Lớn -->
            <div class="col-md-4 text-center">
                <img
                    :src="sach.hinhBia || 'https://via.placeholder.com/400'"
                    alt="Bìa Sách"
                    class="img-fluid rounded-4 shadow-sm"
                    style="max-height: 450px; object-fit: contain"
                />
            </div>

            <!-- Cột phải chứa Thông tin và Nút mượn -->
            <div class="col-md-8 pt-3 ps-md-5">
                <h2 class="fw-bold mb-1">{{ sach.tenSach }}</h2>
                <p class="text-primary fs-5 fw-medium mb-3">
                    Tác giả: {{ sach.tacGia }}
                </p>

                <div class="d-flex mb-4 gap-3">
                    <span class="badge bg-light text-dark fs-6 py-2 px-3 border"
                        ><i class="bi bi-tag-fill me-1"></i>Mã Sách:
                        {{ sach.maSach }}</span
                    >
                    <span class="badge bg-light text-dark fs-6 py-2 px-3 border"
                        ><i class="bi bi-calendar-check me-1"></i>Xuất bản:
                        {{ sach.namXuatBan }}</span
                    >
                </div>

                <h4 class="fw-bold text-danger mb-4">
                    {{ parseInt(sach.donGia).toLocaleString() }} VNĐ
                </h4>

                <p class="text-muted lh-lg mb-4">
                    Cuốn sách này thuộc NXB: <strong>{{ sach.maNXB }}</strong
                    >. Đây là một tài liệu vô cùng quý giá mà thư viện đã dày
                    công sưu tầm. Vui lòng bảo quản cẩn thận trong quá trình
                    mượn.
                </p>

                <hr class="mb-4" />

                <div
                    class="d-flex align-items-center bg-light p-3 modern-radius mb-4"
                >
                    <div class="me-4 text-center">
                        <h3 class="fw-bold mb-0 text-primary">
                            {{ sach.soQuyen }}
                        </h3>
                        <span class="small text-muted">Quyển có sẵn</span>
                    </div>
                    <div>
                        <p class="mb-0 text-muted small">
                            <i class="bi bi-info-circle-fill me-1"></i>Trạng
                            thái kho
                        </p>
                        <span v-if="sach.soQuyen > 0" class="badge bg-success"
                            >Còn Sách</span
                        >
                        <span v-else class="badge bg-danger">Tạm Hết</span>
                    </div>
                </div>

                <!-- Chỗ thao tác mượn -->
                <div class="d-flex gap-3">
                    <!-- Thông báo lỗi nếu mượn trượt -->
                    <div
                        v-if="errorMessage"
                        class="alert alert-danger mb-0 p-2"
                    >
                        {{ errorMessage }}
                    </div>

                    <button
                        @click="muonNgay"
                        :disabled="sach.soQuyen <= 0 || isSubmitting"
                        class="btn btn-primary btn-lg modern-radius px-5 shadow-sm fw-bold"
                    >
                        <i class="bi bi-basket3-fill me-2"></i>
                        {{ isSubmitting ? "Đang gửi..." : "Yêu Cầu Mượn Ngay" }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading Spin -->
    <div v-else class="text-center mt-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Đang tải thông tin sách...</p>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import sachService from "../../services/sach.service";
import theodoiService from "../../services/theodoimuonsach.service";
import authService from "../../services/auth.service";

export default {
    setup() {
        const route = useRoute(); // Lấy thông tin URL hiện tại
        const router = useRouter(); // Dùng để chuyển trang
        const sach = ref(null); // Biến lưu dữ liệu sách

        const errorMessage = ref(""); // Biến lưu chữ bị lỗi
        const isSubmitting = ref(false); // Biến hiển thị trạng thái nút Mượn đang quay

        // Lấy thông tin sách từ Backend dựa vào cái ID trên URL
        const getSachData = async (id) => {
            try {
                sach.value = await sachService.get(id);
            } catch (err) {
                console.log(err);
            }
        };

        // Khi người dùng bấm nút Mượn
        const muonNgay = async () => {
            // 1. Kiểm tra xem đã đăng nhập chưa
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                alert("Bạn phải đăng nhập để có thể mượn sách!");
                router.push("/login"); // Chưa đăng nhập thì đuổi qua trang Login
                return;
            }

            try {
                errorMessage.value = "";
                isSubmitting.value = true;

                // 2. Lấy đúng mã độc giả của người đang đăng nhập gán vào
                const payload = {
                    maDocGia: currentUser.maDocGia,
                    maSach: sach.value.maSach,
                };

                const taoPhieu = await theodoiService.yeuCauMuon(payload);

                alert(
                    "Đăng ký mượn thành công! Chờ nhân viên thư viện duyệt nhé.",
                );
                router.push("/lichsu"); // Chuyển về trang Lịch Sử để theo dõi chức năng duyệt
            } catch (err) {
                errorMessage.value =
                    err.response?.data?.message || "Có lỗi xảy ra khi mượn";
            } finally {
                isSubmitting.value = false;
            }
        };

        // Khi trang mới mở, tóm cổ cái ID trên link rồi quăng vào API
        onMounted(() => {
            getSachData(route.params.id);
        });

        return { sach, errorMessage, isSubmitting, muonNgay };
    },
};
</script>
