<template>
    <div>
        <h2 class="fw-bold mb-1">Good morning, Admin!</h2>
        <p class="text-muted mb-4">
            Đây là các công việc bạn cần xử lý hôm nay.
        </p>

        <div class="row">
            <!-- CỘT 1: YÊU CẦU MƯỢN (Trạng thái 0) -->
            <div class="col-md-6 mb-4">
                <div
                    class="card border-0 modern-shadow modern-radius p-4 h-100"
                >
                    <h5 class="fw-bold text-primary mb-3">
                        <i class="bi bi-bell-fill me-2"></i> Yêu Cầu Mượn Sách
                    </h5>

                    <div
                        v-if="phieuChoMuon.length === 0"
                        class="text-muted small"
                    >
                        Tuyệt vời, không có yêu cầu nào chờ xử lý.
                    </div>

                    <div class="list-group list-group-flush">
                        <div
                            v-for="phieu in phieuChoMuon"
                            :key="phieu._id"
                            class="list-group-item bg-light modern-radius mb-2 p-3"
                        >
                            <div
                                class="d-flex justify-content-between align-items-start"
                            >
                                <div>
                                    <h6 class="fw-bold mb-1">
                                        Sách:
                                        <span class="text-primary">{{
                                            phieu.maSach
                                        }}</span>
                                    </h6>
                                    <p class="mb-0 small text-muted">
                                        Người mượn: {{ phieu.maDocGia }}
                                    </p>
                                </div>
                                <div class="text-end">
                                    <button
                                        @click="xuLyMuon(phieu._id, true)"
                                        class="btn btn-sm btn-success modern-radius me-1"
                                    >
                                        <i class="bi bi-check-lg"></i> Duyệt
                                    </button>
                                    <button
                                        @click="xuLyMuon(phieu._id, false)"
                                        class="btn btn-sm btn-danger modern-radius"
                                    >
                                        <i class="bi bi-x-lg"></i> Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CỘT 2: YÊU CẦU TRẢ (Trạng thái 3) -->
            <div class="col-md-6 mb-4">
                <div
                    class="card border-0 modern-shadow modern-radius p-4 h-100"
                >
                    <h5 class="fw-bold text-info mb-3">
                        <i class="bi bi-arrow-return-left me-2"></i> Xác Nhận
                        Khách Trả
                    </h5>

                    <div
                        v-if="phieuChoTra.length === 0"
                        class="text-muted small"
                    >
                        Không có đầu sách nào đang chờ nhận vào kho.
                    </div>

                    <div class="list-group list-group-flush">
                        <div
                            v-for="phieu in phieuChoTra"
                            :key="phieu._id"
                            class="list-group-item bg-light modern-radius mb-2 p-3"
                        >
                            <div
                                class="d-flex justify-content-between align-items-start"
                            >
                                <div>
                                    <h6 class="fw-bold mb-1">
                                        Sách: {{ phieu.maSach }}
                                    </h6>
                                    <p class="mb-0 small text-muted">
                                        Khách trả: {{ phieu.maDocGia }}
                                    </p>
                                </div>
                                <div>
                                    <!-- Nút Cất vào kho -->
                                    <button
                                        @click="xuLyTra(phieu._id)"
                                        class="btn btn-sm btn-primary modern-radius"
                                    >
                                        Xác nhận nhận sách
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import theodoiService from "../../services/theodoimuonsach.service";

export default {
    setup() {
        const phieuChoMuon = ref([]); // Trạng thái = 0
        const phieuChoTra = ref([]); // Trạng thái = 3
        const msnvTemp = "NV01"; // Tạm thời dùng MSNV rác, sau này viết login admin sẽ lấy từ Token giống bên Độc giả

        const fetchData = async () => {
            try {
                // Lấy tất cả yêu cầu có `trangThai == 0`
                phieuChoMuon.value = await theodoiService.getAll({
                    trangThai: 0,
                });
                // Lấy tất cả yêu cầu có `trangThai == 3`
                phieuChoTra.value = await theodoiService.getAll({
                    trangThai: 3,
                });
            } catch (e) {
                console.log("Lỗi load dữ liệu admin", e);
            }
        };

        const xuLyMuon = async (id, isDuyet) => {
            try {
                const res = await theodoiService.duyetMuon(
                    id,
                    msnvTemp,
                    isDuyet,
                );
                alert(res.message);
                fetchData(); // Refresh lại danh sách
            } catch (e) {
                alert(e.response?.data?.message || "Lỗi xử lý");
            }
        };

        const xuLyTra = async (id) => {
            try {
                const res = await theodoiService.duyetTra(id, msnvTemp);
                alert(res.message);
                fetchData();
            } catch (e) {
                alert("Lỗi khi duyệt trả sách");
            }
        };

        onMounted(() => fetchData());

        return { phieuChoMuon, phieuChoTra, xuLyMuon, xuLyTra };
    },
};
</script>
