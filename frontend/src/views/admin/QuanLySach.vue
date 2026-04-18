<template>
    <div class="ql-sach-page">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h2 class="fw-bold text-dark mb-0">Quản Lý Danh Mục Sách</h2>

            <div class="d-flex gap-3">
                <!-- Thanh Tìm Kiếm -->
                <div class="input-group" style="width: 300px;">
                    <span class="input-group-text bg-white border-end-0 border-light modern-shadow" id="search-icon">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input 
                        type="text" 
                        class="form-control border-start-0 border-light modern-shadow ps-0" 
                        placeholder="Tìm theo Tên, Mã, Tác giả..." 
                        v-model="searchQuery"
                    >
                </div>

                <!-- Nút gọi form thêm mới sách -->
                <button
                    @click="openForm('add')"
                    class="btn btn-primary fw-medium px-4 modern-radius shadow-sm text-nowrap"
                >
                    <i class="bi bi-plus-lg me-1"></i> Thêm Sách Mới
                </button>
            </div>
        </div>

        <!-- Bảng Dữ Liệu Sách -->
        <div class="card border-0 modern-shadow modern-radius overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle bg-white mb-0 text-center">
                    <thead class="table-light">
                        <tr>
                            <th>Bìa</th>
                            <th>Mã Sách</th>
                            <th class="text-start">Tên Sách</th>
                            <th>Tác Giả</th>
                            <th>Tồn Kho</th>
                            <th>Đơn Giá</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredBooks.length === 0">
                            <td colspan="7" class="text-muted py-4">Không tìm thấy sách nào phù hợp.</td>
                        </tr>
                        <tr v-for="sach in filteredBooks" :key="sach._id">
                            <td>
                                <img
                                    :src="sach.hinhBia || 'https://via.placeholder.com/50'"
                                    alt="Bìa"
                                    class="rounded"
                                    style="width: 40px; height: 50px; object-fit: cover;"
                                />
                            </td>
                            <td class="fw-medium text-muted">
                                {{ sach.maSach }}
                            </td>
                            <td class="text-start fw-bold text-dark">
                                {{ sach.tenSach }}
                            </td>
                            <td class="text-muted">{{ sach.tacGia || 'Không có' }}</td>
                            <td>
                                <span :class="['badge rounded-pill', sach.soQuyen > 0 ? 'bg-success' : 'bg-danger']">
                                    {{ sach.soQuyen }}
                                </span>
                            </td>
                            <td class="text-danger fw-bold">
                                {{ sach.donGia.toLocaleString() }}đ
                            </td>
                            <td>
                                <!-- Hai Nút Thao Tác (Sửa và Xóa) -->
                                <button
                                    @click="openForm('edit', sach)"
                                    class="btn btn-sm btn-outline-primary modern-radius me-2"
                                    title="Chỉnh sửa"
                                >
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button
                                    @click="deleteBook(sach._id)"
                                    class="btn btn-sm btn-outline-danger modern-radius"
                                    title="Xóa"
                                >
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- KHU VỰC FORM ĐIỀN THÔNG TIN -->
        <div v-if="isActiveForm" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
            <div class="card border-0 modern-shadow modern-radius w-100 p-4" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h4 class="fw-bold text-primary mb-0">
                        {{ isEditMode ? "Cập Nhật Sách" : "Thêm Sách Mới" }}
                    </h4>
                    <button @click="closeForm" class="btn btn-light rounded-circle text-muted">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <form @submit.prevent="submitForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small fw-medium">Mã Sách *</label>
                            <input type="text" v-model="formData.maSach" class="form-control form-control-sm bg-light border-0" :disabled="isEditMode" required />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small fw-medium">Nhà Xuất Bản (Mã NXB) *</label>
                            <input type="text" v-model="formData.maNXB" class="form-control form-control-sm bg-light border-0" required />
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label text-muted small fw-medium">Tên Cuốn Sách *</label>
                            <input type="text" v-model="formData.tenSach" class="form-control bg-light border-0" required />
                        </div>
                        <div class="col-md-8 mb-3">
                            <label class="form-label text-muted small fw-medium">Tác Giả</label>
                            <input type="text" v-model="formData.tacGia" class="form-control form-control-sm bg-light border-0" />
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label text-muted small fw-medium">Năm Xuất Bản</label>
                            <input type="number" v-model="formData.namXuatBan" class="form-control form-control-sm bg-light border-0" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small fw-medium">Số lượng nhập kho *</label>
                            <input type="number" v-model="formData.soQuyen" min="0" class="form-control form-control-sm bg-light border-0" required />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small fw-medium">Đơn Giá VNĐ *</label>
                            <input type="number" v-model="formData.donGia" min="0" class="form-control form-control-sm bg-light border-0 text-danger fw-bold" required />
                        </div>
                        <div class="col-12 mb-4">
                            <label class="form-label text-muted small fw-medium">URL Ảnh Bìa</label>
                            <input type="text" v-model="formData.hinhBia" class="form-control form-control-sm bg-light border-0" placeholder="https://link-anh-bia-sach.jpg" />
                        </div>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button type="button" @click="closeForm" class="btn btn-light modern-radius fw-medium px-4">Hủy</button>
                        <button type="submit" class="btn btn-primary modern-radius fw-medium px-5">
                            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                            {{ isEditMode ? "Lưu Thay Đổi" : "Thêm Vào Kho" }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import sachService from "../../services/sach.service";

export default {
    setup() {
        const books = ref([]);
        const isLoading = ref(false);
        const searchQuery = ref(""); // Biến chứa từ khóa tìm kiếm

        const isActiveForm = ref(false);
        const isEditMode = ref(false);
        const activeEditId = ref(null); 

        const formData = ref({
            maSach: "", tenSach: "", maNXB: "", tacGia: "",
            namXuatBan: "", donGia: "", soQuyen: 0, hinhBia: "",
        });

        const fetchBooks = async () => {
            try {
                books.value = await sachService.getAll();
            } catch (err) {
                console.error("Lỗi get data book", err);
            }
        };

        // BỘ LỌC TÌM KIẾM THEO THỜI GIAN THỰC
        const filteredBooks = computed(() => {
            if (!searchQuery.value) return books.value; // Nếu không nhập gì -> Hiển thị tất cả
            
            const lowerCaseQuery = searchQuery.value.toLowerCase().trim();
            
            return books.value.filter((sach) => {
                // Tìm kiếm theo Tên Sách, Mã Sách hoặc Tên tác giả
                const tenSach = (sach.tenSach || "").toLowerCase();
                const maSach = (sach.maSach || "").toLowerCase();
                const tacGia = (sach.tacGia || "").toLowerCase();
                
                return tenSach.includes(lowerCaseQuery) || 
                       maSach.includes(lowerCaseQuery) || 
                       tacGia.includes(lowerCaseQuery);
            });
        });

        const openForm = (mode, bookItem = null) => {
            isActiveForm.value = true;
            if (mode === "edit") {
                isEditMode.value = true;
                activeEditId.value = bookItem._id;
                formData.value = { ...bookItem };
            } else {
                isEditMode.value = false;
                activeEditId.value = null;
                formData.value = { maSach: "", tenSach: "", maNXB: "", tacGia: "", namXuatBan: "", donGia: "", soQuyen: 0, hinhBia: "" };
            }
        };

        const closeForm = () => {
            isActiveForm.value = false;
        };

        const submitForm = async () => {
            try {
                isLoading.value = true;
                if (isEditMode.value) {
                    await sachService.update(activeEditId.value, formData.value);
                    alert("Cập nhật dữ liệu sách thành công!");
                } else {
                    await sachService.create(formData.value);
                    alert("Đã thêm sách mới vào kho!");
                }
                closeForm();
                fetchBooks();
            } catch (err) {
                alert(err.response?.data?.message || "Có lỗi từ máy chủ!");
            } finally {
                isLoading.value = false;
            }
        };

        const deleteBook = async (id) => {
            if (confirm("Bạn có chắc muốn vứt quyển sách này ra khỏi thư viện vĩnh viễn?")) {
                try {
                    await sachService.delete(id);
                    alert("Huỷ bỏ thành công");
                    fetchBooks();
                } catch (err) {
                    alert("Lỗi khi xoá");
                }
            }
        };

        onMounted(() => fetchBooks());

        return {
            books,
            searchQuery,
            filteredBooks,
            isActiveForm,
            isEditMode,
            formData,
            openForm,
            closeForm,
            submitForm,
            deleteBook,
            isLoading,
        };
    },
};
</script>

<style scoped>
.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1050; 
    backdrop-filter: blur(4px); 
}
</style>
