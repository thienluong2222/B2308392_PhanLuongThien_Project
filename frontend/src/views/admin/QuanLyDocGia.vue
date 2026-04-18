<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="fw-bold mb-0">Quản Lý Độc Giả</h3>
            
            <div class="d-flex gap-3">
                <!-- Thanh Tìm Kiếm -->
                <div class="input-group" style="width: 300px;">
                    <span class="input-group-text bg-white border-end-0 border-light modern-shadow">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input 
                        type="text" 
                        class="form-control border-start-0 border-light modern-shadow ps-0" 
                        placeholder="Tìm theo Mã, Họ Tên, SĐT..." 
                        v-model="searchQuery"
                    >
                </div>

                <button
                    class="btn btn-primary px-4 shadow-sm text-nowrap"
                    @click="openModal(null)"
                >
                    <i class="bi bi-person-plus-fill me-2"></i>Thêm Độc Giả
                </button>
            </div>
        </div>

        <!-- Bảng danh sách Độc Giả -->
        <div class="card border-0 modern-shadow modern-radius">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Mã Độc Giả</th>
                                <th>Họ Tên</th>
                                <th>Tên Đăng Nhập</th>
                                <th>Điện Thoại</th>
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="dg in filteredReaders" :key="dg._id">
                                <td class="ps-4 fw-bold text-secondary">
                                    {{ dg.maDocGia }}
                                </td>
                                <td class="fw-medium text-dark">
                                    {{ dg.hoTen }}
                                </td>
                                <td class="text-muted">{{ dg.tenTaiKhoan }}</td>
                                <td class="text-muted">
                                    {{ dg.dienThoai || "Trống" }}
                                </td>
                                <td class="text-end pe-4">
                                    <button
                                        class="btn btn-sm btn-outline-primary rounded-circle me-2"
                                        @click="openModal(dg)"
                                    >
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger rounded-circle"
                                        @click="deleteReader(dg._id)"
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
                        {{ isEdit ? "✏️ Cập nhật Độc giả" : "✨ Thêm Độc giả" }}
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
                                >Mã Độc Giả *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.maDocGia"
                                :disabled="isEdit"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted"
                                >Họ Tên *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.hoTen"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted"
                                >Tên Đăng Nhập *</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.tenTaiKhoan"
                                :disabled="isEdit"
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
                                v-model="formData.matKhau"
                                required
                            />
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted"
                                >Điện Thoại</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                v-model="formData.dienThoai"
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
import { ref, computed, onMounted } from "vue";
import docGiaService from "../../services/docgia.service";

export default {
    setup() {
        const readers = ref([]);
        const searchQuery = ref("");
        
        const filteredReaders = computed(() => {
            if (!searchQuery.value) return readers.value;
            const q = searchQuery.value.toLowerCase().trim();
            return readers.value.filter(dg => 
                (dg.maDocGia || '').toLowerCase().includes(q) ||
                (dg.hoTen || '').toLowerCase().includes(q) ||
                (dg.tenTaiKhoan || '').toLowerCase().includes(q) ||
                (dg.dienThoai || '').toLowerCase().includes(q)
            );
        });
        const showModal = ref(false);
        const isEdit = ref(false);
        const currentId = ref(null);
        const formData = ref({
            maDocGia: "",
            hoTen: "",
            tenTaiKhoan: "",
            matKhau: "",
            dienThoai: "",
        });

        const fetchReaders = async () => {
            readers.value = await docGiaService.getAll();
        };

        const openModal = (dg) => {
            isEdit.value = !!dg;
            if (dg) {
                currentId.value = dg._id;
                formData.value = { ...dg };
            } else {
                formData.value = {
                    maDocGia: "",
                    hoTen: "",
                    tenTaiKhoan: "",
                    matKhau: "",
                    dienThoai: "",
                };
            }
            showModal.value = true;
        };

        const submitForm = async () => {
            try {
                isEdit.value
                    ? await docGiaService.update(
                        currentId.value,
                        formData.value,
                    )
                    : await docGiaService.create(formData.value);
                showModal.value = false;
                fetchReaders();
            } catch (err) {
                alert("Lỗi! Mã thẻ hoặc tên đăng nhập bị trùng.");
            }
        };

        const deleteReader = async (id) => {
            if (confirm("Chắc chắn xóa độc giả này?")) {
                await docGiaService.delete(id);
                fetchReaders();
            }
        };

        onMounted(fetchReaders);
        return {
            readers,
            searchQuery,
            filteredReaders,
            showModal,
            isEdit,
            formData,
            openModal,
            submitForm,
            deleteReader,
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
