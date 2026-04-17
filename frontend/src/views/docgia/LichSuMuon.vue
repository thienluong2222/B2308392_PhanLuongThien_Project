<template>
    <div class="lichsu-page">
        <h2 class="fw-bold mb-4 text-primary">Lịch Sử Mượn Sách Cá Nhân</h2>

        <div class="card border-0 modern-shadow modern-radius overflow-hidden">
            <!-- Kiểm tra trạng thái load dữ liệu -->
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p class="text-muted mt-2">Đang tải lịch sử...</p>
            </div>

            <!-- Bảng Data -->
            <div v-else-if="lichSu.length > 0" class="table-responsive">
                <table class="table table-hover align-middle mb-0 text-center">
                    <thead class="table-light text-muted">
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Mã Sách</th>
                            <th>Ngày Mượn</th>
                            <th>Trạng Thái</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="phieu in lichSu" :key="phieu._id">
                            <td class="fw-medium text-muted">
                                #{{ phieu._id.substring(phieu._id.length - 6) }}
                            </td>
                            <td class="fw-bold text-dark">
                                {{ phieu.maSach }}
                            </td>
                            <td>
                                {{
                                    phieu.ngayMuon
                                        ? new Date(
                                              phieu.ngayMuon,
                                          ).toLocaleDateString("vi-VN")
                                        : "Chưa có"
                                }}
                            </td>

                            <!-- Hiển thị Trạng thái (0: Chờ duyệt, 1: Đang mượn, 2: Bị từ chối, 3: Chờ nhận trả, 4: Đã trả xong) -->
                            <td>
                                <span
                                    v-if="phieu.trangThai === 0"
                                    class="badge bg-warning text-dark py-2 px-3"
                                    >Chờ Admin Duyệt</span
                                >
                                <span
                                    v-else-if="phieu.trangThai === 1"
                                    class="badge bg-primary py-2 px-3"
                                    >Đang Mượn</span
                                >
                                <span
                                    v-else-if="phieu.trangThai === 2"
                                    class="badge bg-danger py-2 px-3"
                                    >Bị Từ Chối</span
                                >
                                <span
                                    v-else-if="phieu.trangThai === 3"
                                    class="badge bg-info text-dark py-2 px-3"
                                    >Chờ Nhận Lại Sách</span
                                >
                                <span v-else class="badge bg-success py-2 px-3"
                                    >Đã Trả Xong</span
                                >
                            </td>

                            <!-- Nút Thao tác (Chỉ hiện nút "Xin Trả" khi sách Đang Mượn TrangThai == 1) -->
                            <td>
                                <button
                                    v-if="phieu.trangThai === 1"
                                    @click="xinTraSach(phieu._id)"
                                    class="btn btn-sm btn-outline-danger modern-radius fw-medium"
                                >
                                    <i class="bi bi-arrow-return-left me-1"></i>
                                    Trả sách
                                </button>
                                <span v-else class="text-muted small">---</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Không có dữ liệu -->
            <div v-else class="text-center py-5">
                <i
                    class="bi bi-card-checklist text-muted"
                    style="font-size: 3rem"
                ></i>
                <p class="text-muted mt-2 mb-0">
                    Bạn chưa từng mượn cuốn sách nào!
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import theodoiService from "../../services/theodoimuonsach.service";
import authService from "../../services/auth.service";

export default {
    setup() {
        const router = useRouter();
        const lichSu = ref([]);
        const isLoading = ref(true);

        // Kéo thẻ thông tin User từ Local Storage
        const currentUser = authService.getCurrentUser();

        // Gọi API lấy danh sách mượn (Lọc theo maDocGia của mình)
        const loadLichSu = async () => {
            // Bảo vệ trang: Chặn người lạ xâm nhập nếu chưa login
            if (!currentUser) {
                alert("Bạn phải đăng nhập để xem lịch sử!");
                router.push("/login");
                return;
            }

            try {
                isLoading.value = true;
                // Gọi lên backend với query string (?maDocGia=DGxxx)
                const params = { maDocGia: currentUser.maDocGia };
                // Giả sử theodoiService có hàm getAll nhận params
                // Chúng ta sẽ cần cập nhật hàm getAll bên service.js để truyền params này
                const response = await theodoiService.getAll(params);
                lichSu.value = response;
            } catch (err) {
                console.error("Lỗi khi kéo lịch sử: ", err);
            } finally {
                isLoading.value = false;
            }
        };

        // Hàm gọi API Xin trả sách (PUT: /yeu-cau-tra)
        const xinTraSach = async (idPhieu) => {
            if (confirm("Bạn đã mang sách này ra thư viện trả rồi chứ?")) {
                try {
                    // Goi hàm yeuCauTra từ service (sẽ tạo ở bước tiếp theo)
                    const res = await theodoiService.yeuCauTra(idPhieu);
                    alert(res.message);
                    loadLichSu(); // Load lại bảng để thấy nó chuyển sang màu Xanh "Chờ Nhận Lại Sách"
                } catch (err) {
                    alert(err.response?.data?.message || "Có lỗi xảy ra!");
                }
            }
        };

        onMounted(() => {
            loadLichSu();
        });

        return { lichSu, isLoading, xinTraSach, currentUser };
    },
};
</script>
