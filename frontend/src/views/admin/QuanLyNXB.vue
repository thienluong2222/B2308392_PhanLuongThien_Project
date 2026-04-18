<template>
    <div>
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h3 class="fw-bold mb-0">Quản Lý Nhà Xuất Bản</h3>
            
            <div class="d-flex gap-3">
                <!-- Thanh Tìm Kiếm -->
                <div class="input-group" style="width: 300px;">
                    <span class="input-group-text bg-white border-end-0 border-light modern-shadow" id="search-icon">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input 
                        type="text" 
                        class="form-control border-start-0 border-light modern-shadow ps-0" 
                        placeholder="Tìm theo Mã, Tên NXB..." 
                        v-model="searchQuery"
                    >
                </div>

                <button
                    class="btn btn-primary fw-medium px-4 modern-radius shadow-sm text-nowrap"
                    @click="openModalModal(null)"
                >
                    <i class="bi bi-plus-lg me-1"></i> Thêm NXB Mới
                </button>
            </div>
        </div>

        <!-- Bảng danh sách Nhà xuất bản -->
        <div class="card border-0 modern-shadow modern-radius overflow-hidden">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle bg-white mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Mã NXB</th>
                                <th>Tên Nhà Xuất Bản</th>
                                <th>Địa Chỉ</th>
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredPublishers.length === 0">
                                <td
                                    colspan="4"
                                    class="text-center text-muted py-4"
                                >
                                    Không tìm thấy nhà xuất bản nào phù hợp.
                                </td>
                            </tr>
                            <tr v-for="nxb in filteredPublishers" :key="nxb._id">
                                <td class="ps-4 fw-bold text-secondary">
                                    {{ nxb.maNXB }}
                                </td>
                                <td class="fw-medium text-dark">
                                    {{ nxb.tenNXB }}
                                </td>
                                <td class="text-muted">
                                    {{ nxb.diaChi || "Trống" }}
                                </td>
                                <td class="text-end pe-4">
                                    <button
                                        class="btn btn-sm btn-outline-primary rounded-circle me-2"
                                        @click="openModalModal(nxb)"
                                        title="Sửa thẻ"
                                    >
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger rounded-circle"
                                        @click="deletePublisher(nxb._id)"
                                        title="Xóa"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal sửa -->
        <div
            v-if="showModal"
            class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3"
        >
            <div
                class="card border-0 modern-shadow modern-radius w-100 p-4"
                style="max-width: 500px; max-height: 90vh; overflow-y: auto;"
            >
                <div
                    class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3"
                >
                    <h5 class="fw-bold text-primary mb-0">
                        {{ isEdit ? "Cập nhật NXB" : "Thêm NXB mới" }}
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        @click="closeModal"
                    ></button>
                </div>
                <form @submit.prevent="submitForm">
                    <!-- Mã NXB -->
                    <div class="mb-3">
                        <label class="form-label fw-medium text-muted"
                            >Mã NXB *</label
                        >
                        <input
                            type="text"
                            class="form-control bg-light border-0"
                            v-model="formData.maNXB"
                            required
                            :disabled="isEdit"
                        />
                        <small class="text-danger" v-if="isEdit"
                            >Không thể sửa mã NXB</small
                        >
                    </div>
                    <!-- Tên NXB -->
                    <div class="mb-3">
                        <label class="form-label fw-medium text-muted"
                            >Tên NXB *</label
                        >
                        <input
                            type="text"
                            class="form-control bg-light border-0"
                            v-model="formData.tenNXB"
                            required
                        />
                    </div>
                    <!-- Địa chỉ -->
                    <div class="mb-4">
                        <label class="form-label fw-medium text-muted"
                            >Địa chỉ</label
                        >
                        <input
                            type="text"
                            class="form-control bg-light border-0"
                            v-model="formData.diaChi"
                        />
                    </div>

                    <!-- Nút Hành Động -->
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button
                            type="button"
                            class="btn btn-light modern-radius fw-medium px-4"
                            @click="closeModal"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            class="btn btn-primary modern-radius fw-medium px-4 shadow-sm"
                        >
                            {{ isEdit ? "Lưu thay đổi" : "Tạo mới" }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import nhaxuatbanService from "../../services/nhaxuatban.service";

export default {
    setup() {
        const publishers = ref([]);
        const showModal = ref(false);
        const isEdit = ref(false);
        const searchQuery = ref(""); // Biến lưu từ khóa tìm kiếm

        const currentId = ref(null);
        const formData = ref({
            maNXB: "",
            tenNXB: "",
            diaChi: "",
        });

        // Hàm Tải Dữ Liệu
        const fetchPublishers = async () => {
            try {
                publishers.value = await nhaxuatbanService.getAll();
            } catch (error) {
                console.error("Lỗi khi tải NXB:", error);
            }
        };

        // BỘ LỌC TÌM KIẾM THEO THỜI GIAN THỰC
        const filteredPublishers = computed(() => {
            if (!searchQuery.value) return publishers.value;
            
            const lowerCaseQuery = searchQuery.value.toLowerCase().trim();
            
            return publishers.value.filter((nxb) => {
                // Tìm kiếm theo Mã NXB hoặc Tên NXB
                const maNXB = (nxb.maNXB || "").toLowerCase();
                const tenNXB = (nxb.tenNXB || "").toLowerCase();
                
                return maNXB.includes(lowerCaseQuery) || tenNXB.includes(lowerCaseQuery);
            });
        });

        const openModalModal = (nxb) => {
            if (nxb) {
                isEdit.value = true;
                currentId.value = nxb._id;
                formData.value = { ...nxb };
            } else {
                isEdit.value = false;
                currentId.value = null;
                formData.value = { maNXB: "", tenNXB: "", diaChi: "" };
            }
            showModal.value = true;
        };

        const closeModal = () => {
            showModal.value = false;
        };

        const submitForm = async () => {
            try {
                if (isEdit.value) {
                    await nhaxuatbanService.update(
                        currentId.value,
                        formData.value,
                    );
                    alert("✓ Cập nhật thành công!");
                } else {
                    await nhaxuatbanService.create(formData.value);
                    alert("✓ Đã thêm NXB mới!");
                }
                closeModal();
                fetchPublishers();
            } catch (error) {
                console.error(error);
                alert(
                    "Có lỗi xảy ra, vui lòng kiểm tra lại mã NXB bị trùng không!",
                );
            }
        };

        // Xóa Dữ Liệu
        const deletePublisher = async (id) => {
            if (confirm("Bạn có chắc chắn muốn xóa Nhà Xuất Bản này?")) {
                try {
                    await nhaxuatbanService.delete(id);
                    alert("Đã xóa NXB thành công!");
                    fetchPublishers();
                } catch (error) {
                    console.error(error);
                    alert("Lỗi khi xóa tài liệu này!");
                }
            }
        };

        onMounted(() => {
            fetchPublishers();
        });

        return {
            publishers,
            filteredPublishers,
            searchQuery,
            showModal,
            isEdit,
            formData,
            openModalModal,
            closeModal,
            submitForm,
            deletePublisher,
        };
    },
};
</script>

<style scoped>
/* Class CSS đang dùng chung với QuanLySach */
.modern-radius {
    border-radius: 12px;
}
.modern-shadow {
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 1px 3px rgba(0, 0, 0, 0.03);
}
.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    backdrop-filter: blur(2px);
}
</style>
