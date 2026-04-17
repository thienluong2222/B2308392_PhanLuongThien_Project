<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="fw-bold mb-0">💼 Quản Lý Nhân Viên</h3>
            <button
                class="btn btn-primary px-4 shadow-sm"
                @click="openModal(null)"
            >
                <i class="bi bi-person-badge me-2"></i>Thêm Nhân Viên
            </button>
        </div>

        <!-- Bảng danh sách Nhân Viên -->
        <div class="card border-0 modern-shadow modern-radius">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Mã NV</th>
                                <th>Họ Tên Nhân Viên</th>
                                <th>Chức Vụ</th>
                                <!-- <th>Điện Thoại</th> -->
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="nv in staffs" :key="nv._id">
                                <td class="ps-4 fw-bold text-secondary">
                                    {{ nv.MSNV }}
                                </td>
                                <td class="fw-medium text-dark">
                                    {{ nv.HoTenNV }}
                                </td>
                                <td>
                                    <span class="badge bg-info text-dark">{{
                                        nv.ChucVu || "Thủ Thư"
                                    }}</span>
                                </td>
                                <!-- <td class="text-muted">
                                    {{ nv.SoDienThoai || "Trống" }}
                                </td> -->
                                <td class="text-end pe-4">
                                    <button
                                        class="btn btn-sm btn-outline-primary rounded-circle me-2"
                                        @click="openModal(nv)"
                                    >
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger rounded-circle"
                                        @click="deleteStaff(nv._id)"
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

        <!-- Modal Thêm/Sửa -->
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
                        {{
                            isEdit
                                ? "✏️ Cập nhật Nhân Viên"
                                : "✨ Thêm Nhân Viên"
                        }}
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        @click="showModal = false"
                    ></button>
                </div>
                <div class="card-body p-4">
                    <form @submit.prevent="submitForm">
                        <div class="mb-3">
                            <label class="form-label text-muted"
                                >Mã Nhân Viên *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.MSNV"
                                :disabled="isEdit"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted"
                                >Họ và Tên *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.HoTenNV"
                                required
                            />
                        </div>
                        <div class="mb-3" v-if="!isEdit">
                            <label class="form-label text-muted"
                                >Mật Khẩu *</label
                            >
                            <input
                                type="password"
                                class="form-control"
                                v-model="formData.Password"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted">Chức Vụ</label>
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.ChucVu"
                            />
                        </div>
                        <div class="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                class="btn btn-light px-4"
                                @click="showModal = false"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary px-4 shadow-sm"
                            >
                                Lưu
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
import nhanVienService from "../../services/nhanvien.service";

export default {
    setup() {
        const staffs = ref([]);
        const showModal = ref(false);
        const isEdit = ref(false);
        const currentId = ref(null);
        const formData = ref({
            MSNV: "",
            HoTenNV: "",
            Password: "",
            ChucVu: "Admin",
        });

        const fetchStaffs = async () => {
            staffs.value = await nhanVienService.getAll();
        };

        const openModal = (nv) => {
            isEdit.value = !!nv;
            if (nv) {
                currentId.value = nv._id;
                formData.value = { ...nv };
            } else {
                formData.value = {
                    MSNV: "",
                    HoTenNV: "",
                    Password: "",
                    ChucVu: "Thủ Thư",
                };
            }
            showModal.value = true;
        };

        const submitForm = async () => {
            try {
                isEdit.value
                    ? await nhanVienService.update(
                          currentId.value,
                          formData.value,
                      )
                    : await nhanVienService.create(formData.value);
                showModal.value = false;
                fetchStaffs();
            } catch (err) {
                alert("Lỗi! Mã số nhân viên đã bị trùng lặp.");
            }
        };

        const deleteStaff = async (id) => {
            if (confirm("Chắc chắn xóa nhân sự này?")) {
                await nhanVienService.delete(id);
                fetchStaffs();
            }
        };

        onMounted(fetchStaffs);
        return {
            staffs,
            showModal,
            isEdit,
            formData,
            openModal,
            submitForm,
            deleteStaff,
        };
    },
};
</script>

<style scoped>
.modern-radius {
    border-radius: 12px;
}
.modern-shadow {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
