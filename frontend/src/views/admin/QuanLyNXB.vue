<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="fw-bold mb-0">🏠 Quản Lý Nhà Xuất Bản</h3>
            <button
                class="btn btn-primary px-4 shadow-sm"
                @click="openModalModal(null)"
            >
                <i class="bi bi-plus-circle me-2"></i>Thêm NXB mới
            </button>
        </div>

        <!-- Bảng danh sách Nhà xuất bản -->
        <div class="card border-0 modern-shadow modern-radius">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Mã NXB</th>
                                <th>Tên Nhà Xuất Bản</th>
                                <th>Địa Chỉ</th>
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="publishers.length === 0">
                                <td
                                    colspan="4"
                                    class="text-center text-muted py-4"
                                >
                                    Chưa có nhà xuất bản nào
                                </td>
                            </tr>
                            <tr v-for="nxb in publishers" :key="nxb._id">
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

        <!-- Custom Modal Thêm/Sửa (Lớp phủ mờ) -->
        <div
            v-if="showModal"
            class="modal-backdrop-custom d-flex align-items-center justify-content-center"
        >
            <div
                class="card border-0 modern-shadow modern-radius"
                style="width: 500px; max-width: 90vw"
            >
                <div
                    class="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center"
                >
                    <h5 class="fw-bold mb-0">
                        {{ isEdit ? "✏️ Cập nhật NXB" : "✨ Thêm NXB mới" }}
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="card-body p-4">
                    <form @submit.prevent="submitForm">
                        <!-- Mã NXB -->
                        <div class="mb-3">
                            <label class="form-label fw-medium text-muted"
                                >Mã NXB *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.maNXB"
                                required
                                placeholder="VD: NXB001"
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
                                class="form-control"
                                v-model="formData.tenNXB"
                                required
                                placeholder="Nhập tên nhà xuất bản..."
                            />
                        </div>
                        <!-- Địa chỉ -->
                        <div class="mb-4">
                            <label class="form-label fw-medium text-muted"
                                >Địa chỉ</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.diaChi"
                                placeholder="Nhập địa chỉ nhà xuất bản..."
                            />
                        </div>

                        <!-- Nút Hành Động -->
                        <div class="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                class="btn btn-light px-4"
                                @click="closeModal"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary px-4 shadow-sm"
                            >
                                {{ isEdit ? "Lưu thay đổi" : "Tạo mới" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import nhaxuatbanService from "../../services/nhaxuatban.service";

export default {
    setup() {
        const publishers = ref([]);
        const showModal = ref(false);
        const isEdit = ref(false);

        // Trạng thái Form
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

        // Mở Form
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

        // Đóng Form
        const closeModal = () => {
            showModal.value = false;
        };

        // Lưu dữ liệu
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
            if (confirm("⚠️ Bạn có chắc chắn muốn xóa Nhà Xuất Bản này?")) {
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
