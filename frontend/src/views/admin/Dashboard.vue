<template>
    <div>
        <h2 class="fw-bold mb-1">Good morning, Admin!</h2>
        <p class="text-muted mb-4">
            Đây là các công việc bạn cần xử lý hôm nay.
        </p>

        <div class="row">
            <!-- CỘT 1: YÊU CẦU MƯỢN (Trạng thái 0) -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 modern-shadow modern-radius p-4 h-100">
                    <h5 class="fw-bold text-primary mb-3">
                        <i class="bi bi-bell-fill me-2"></i> Yêu Cầu Mượn Sách
                    </h5>
                    <div class="mb-3">
                        <input type="text" class="form-control form-control-sm modern-radius bg-light border-0" placeholder="Tìm sách, người mượn..." v-model="searchChoMuon" />
                    </div>

                    <div v-if="filteredChoMuon.length === 0" class="text-muted small">
                        Tuyệt vời, không có yêu cầu nào chờ xử lý.
                    </div>

                    <div class="list-group list-group-flush">
                        <div
                            v-for="phieu in filteredChoMuon"
                            :key="phieu._id"
                            class="list-group-item bg-light modern-radius mb-2 p-3"
                        >
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="fw-bold mb-1">
                                        Sách: <span class="text-primary">{{ phieu.tenSach || phieu.maSach }}</span>
                                    </h6>
                                    <p class="mb-0 small text-muted">Người mượn: <b>{{ phieu.tenDocGia || phieu.maDocGia }}</b></p>
                                </div>
                            </div>
                            
                            <!-- Hiển thị ngày khách mong muốn trả -->
                            <div class="mt-2 bg-white p-2 rounded border">
                                <p class="small mb-2">
                                    <span class="text-muted fw-bold">Khách dự kiến trả lúc:</span><br>
                                    <span class="text-primary fw-bold">{{ phieu.hanTraTemp || 'Chưa hẹn' }}</span>
                                </p>
                                
                                <div class="d-flex gap-1">
                                    <button
                                        @click="xuLyMuon(phieu, true)"
                                        class="btn btn-sm btn-success flex-fill modern-radius fw-medium"
                                    >
                                        <i class="bi bi-check-lg"></i> Duyệt
                                    </button>
                                    <button
                                        @click="xuLyMuon(phieu, false)"
                                        class="btn btn-sm btn-danger flex-fill modern-radius fw-medium"
                                    >
                                        <i class="bi bi-x-lg"></i> Từ Chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CỘT 2: ĐANG CHO MƯỢN (GIA HẠN) (Trạng thái 1) -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 modern-shadow modern-radius p-4 h-100">
                    <h5 class="fw-bold text-warning mb-3">
                        <i class="bi bi-clock-history me-2"></i> Sách Đang Mượn
                    </h5>
                    <div class="mb-3">
                        <input type="text" class="form-control form-control-sm modern-radius bg-light border-0" placeholder="Tìm sách, người mượn..." v-model="searchDangMuon" />
                    </div>

                    <div v-if="filteredDangMuon.length === 0" class="text-muted small">
                        Không có sách nào đang ở ngoài thư viện.
                    </div>

                    <div class="list-group list-group-flush">
                        <div
                            v-for="phieu in filteredDangMuon"
                            :key="phieu._id"
                            class="list-group-item bg-light modern-radius mb-2 p-3"
                        >
                            <h6 class="fw-bold mb-1 border-bottom pb-2">
                                Sách: <span class="text-dark">{{ phieu.tenSach || phieu.maSach }}</span>
                            </h6>
                            <p class="mb-2 small text-muted">Đang mượn bởi: <b>{{ phieu.tenDocGia || phieu.maDocGia }}</b></p>
                            
                            <div class="d-flex align-items-center gap-2">
                                <input type="date" v-model="phieu.hanTraTemp" class="form-control form-control-sm" />
                                <button
                                    @click="xuLyGiaHan(phieu)"
                                    class="btn btn-sm btn-outline-warning text-dark fw-bold text-nowrap"
                                >
                                    Gia Hạn
                                </button>
                            </div>
                            <small class="text-danger mt-1 d-block" v-if="isTreHan(phieu.hanTra)">
                                <i class="bi bi-exclamation-triangle-fill"></i> Đã trễ hạn trả sách!
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CỘT 3: YÊU CẦU TRẢ (Trạng thái 3) -->
            <div class="col-md-4 mb-4">
                <div class="card border-0 modern-shadow modern-radius p-4 h-100">
                    <h5 class="fw-bold text-info mb-3">
                        <i class="bi bi-arrow-return-left me-2"></i> Xác Nhận Khách Trả
                    </h5>
                    <div class="mb-3">
                        <input type="text" class="form-control form-control-sm modern-radius bg-light border-0" placeholder="Tìm sách, khách trả..." v-model="searchChoTra" />
                    </div>

                    <div v-if="filteredChoTra.length === 0" class="text-muted small">
                        Không có đầu sách nào chờ nhận.
                    </div>

                    <div class="list-group list-group-flush">
                        <div
                            v-for="phieu in filteredChoTra"
                            :key="phieu._id"
                            class="list-group-item bg-light modern-radius mb-2 p-3"
                        >
                            <h6 class="fw-bold mb-1">
                                Sách: {{ phieu.tenSach || phieu.maSach }}
                                <span v-if="isTreHan(phieu.hanTra)" class="badge bg-danger ms-2" style="font-size: 0.65rem;">
                                    Trễ Hạn Phạt
                                </span>
                            </h6>
                            <p class="mb-3 small text-muted">Trả bởi: <b>{{ phieu.tenDocGia || phieu.maDocGia }}</b></p>
                            <button
                                @click="xuLyTra(phieu._id)"
                                class="btn btn-sm btn-primary modern-radius w-100 fw-medium"
                            >
                                Xác nhận nhận lại sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import theodoiService from "../../services/theodoimuonsach.service";

export default {
    setup() {
        const phieuChoMuon = ref([]); 
        const phieuDangMuon = ref([]); 
        const phieuChoTra = ref([]); 
        const msnvTemp = "NV01"; 

        const searchChoMuon = ref("");
        const searchDangMuon = ref("");
        const searchChoTra = ref("");

        const filteredChoMuon = computed(() => {
            if (!searchChoMuon.value) return phieuChoMuon.value;
            const q = searchChoMuon.value.toLowerCase().trim();
            return phieuChoMuon.value.filter(p => 
                (p.tenSach || p.maSach || '').toLowerCase().includes(q) ||
                (p.tenDocGia || p.maDocGia || '').toLowerCase().includes(q)
            );
        });

        const filteredDangMuon = computed(() => {
            if (!searchDangMuon.value) return phieuDangMuon.value;
            const q = searchDangMuon.value.toLowerCase().trim();
            return phieuDangMuon.value.filter(p => 
                (p.tenSach || p.maSach || '').toLowerCase().includes(q) ||
                (p.tenDocGia || p.maDocGia || '').toLowerCase().includes(q)
            );
        });

        const filteredChoTra = computed(() => {
            if (!searchChoTra.value) return phieuChoTra.value;
            const q = searchChoTra.value.toLowerCase().trim();
            return phieuChoTra.value.filter(p => 
                (p.tenSach || p.maSach || '').toLowerCase().includes(q) ||
                (p.tenDocGia || p.maDocGia || '').toLowerCase().includes(q)
            );
        });

        const formatIsoDate = (dateCode) => {
            if (!dateCode) return "";
            return new Date(dateCode).toISOString().split('T')[0];
        };

        const fetchData = async () => {
            try {
                // 1. Phieu cho muon
                const data0 = await theodoiService.getAll({ trangThai: 0 });
                phieuChoMuon.value = data0.map(p => ({
                    ...p,
                    hanTraTemp: formatIsoDate(p.hanTra) || formatIsoDate(new Date(new Date().setDate(new Date().getDate() + 7)))
                }));

                // 2. Phieu dang muon
                const data1 = await theodoiService.getAll({ trangThai: 1 });
                phieuDangMuon.value = data1.map(p => ({
                    ...p,
                    hanTraTemp: formatIsoDate(p.hanTra)
                }));

                // 3. Phieu cho tra
                phieuChoTra.value = await theodoiService.getAll({ trangThai: 3 });
            } catch (e) {
                console.log("Lỗi load dữ liệu admin", e);
            }
        };

        const xuLyMuon = async (phieu, isDuyet) => {
            try {
                const res = await theodoiService.duyetMuon(
                    phieu._id,
                    msnvTemp,
                    isDuyet,
                    phieu.hanTraTemp // Gửi ngày hẹn trả do Admin chốt về
                );
                alert(res.message);
                fetchData();
            } catch (e) {
                alert(e.response?.data?.message || "Lỗi xử lý");
            }
        };

        const xuLyGiaHan = async (phieu) => {
            if (confirm(`Xác nhận gia hạn sách này đến ngày ${phieu.hanTraTemp}?`)) {
                try {
                    const res = await theodoiService.giaHan(phieu._id, phieu.hanTraTemp);
                    alert(res.message || "Gia hạn thành công!");
                    fetchData();
                } catch (e) {
                    alert(e.response?.data?.message || "Lỗi khi gia hạn");
                }
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

        const isTreHan = (hanTraString) => {
            if (!hanTraString) return false;
            return new Date(hanTraString).getTime() < new Date().getTime();
        };

        onMounted(() => fetchData());

        return { 
            phieuChoMuon, phieuDangMuon, phieuChoTra, 
            searchChoMuon, searchDangMuon, searchChoTra,
            filteredChoMuon, filteredDangMuon, filteredChoTra,
            xuLyMuon, xuLyGiaHan, xuLyTra, isTreHan 
        };
    },
};
</script>
