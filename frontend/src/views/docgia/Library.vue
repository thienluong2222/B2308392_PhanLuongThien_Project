<template>
    <div class="library-page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold text-dark mb-0">Thư Viện Sách</h2>

            <!-- Thanh tìm kiếm -->
            <div class="search-box w-50">
                <div
                    class="input-group modern-shadow modern-radius overflow-hidden"
                >
                    <span class="input-group-text bg-white border-0"
                        ><i class="bi bi-search text-muted"></i
                    ></span>
                    <!-- Dùng v-model="searchText" để lọc sách realtime -->
                    <input
                        type="text"
                        v-model="searchText"
                        class="form-control border-0 py-2 shadow-none"
                        placeholder="Tìm tên sách, tác giả..."
                    />
                </div>
            </div>
        </div>

        <!-- Lưới chứa NHỮNG QUYỂN SÁCH TỪ BACKEND -->
        <div class="row row-cols-1 row-cols-md-4 g-4 mt-2">
            <!-- Vòng lặp v-for hiển thị sách trong mảng filteredBooks -->
            <div class="col" v-for="book in filteredBooks" :key="book._id">
                <div
                    class="card h-100 border-0 modern-shadow modern-radius p-2 transition-hover"
                >
                    <!-- Hình ảnh bìa sách lấy từ DB -->
                    <div
                        class="bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center"
                        style="height: 250px; overflow: hidden"
                    >
                        <img
                            :src="
                                book.hinhBia ||
                                'https://via.placeholder.com/150'
                            "
                            alt="Bìa sách"
                            class="img-fluid h-100 object-fit-cover"
                        />
                    </div>
                    <!-- Thông tin Sách -->
                    <div class="card-body p-2">
                        <h5
                            class="card-title fw-bold text-truncate"
                            :title="book.tenSach"
                        >
                            {{ book.tenSach }}
                        </h5>
                        <p class="card-text text-muted small mb-2">
                            {{ book.tacGia }}
                        </p>
                        <div
                            class="d-flex justify-content-between align-items-center"
                        >
                            <span class="badge bg-primary rounded-pill"
                                >Kho: {{ book.soQuyen }}</span
                            >
                            <!-- Nút chuyển tới trang chi tiết (mình sẽ làm route này bước sau) -->
                            <router-link
                                :to="'/sach/' + book._id"
                                class="btn btn-outline-primary btn-sm modern-radius fw-medium px-3"
                            >
                                Chi Tiết
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nếu không có sách nào thỏa tìm kiếm -->
        <div
            v-if="filteredBooks.length === 0"
            class="text-center mt-5 text-muted"
        >
            <i class="bi bi-inbox fs-1"></i>
            <p class="mt-2">Không tìm thấy quyển sách nào...</p>
        </div>
    </div>
</template>

<script>
// Thêm thẻ script để viết tính năng động cho Vue
import { ref, computed, onMounted } from "vue";
import sachService from "../../services/sach.service";

export default {
    setup() {
        const books = ref([]); // Biến chứa tất cả sách từ DB
        const searchText = ref(""); // Biến chứa chữ người dùng gõ vào ô tìm kiếm

        // Hàm gọi API để thu thập sách
        const retrieveBooks = async () => {
            try {
                books.value = await sachService.getAll();
            } catch (error) {
                console.log("Lỗi khi tải sách: ", error);
            }
        };

        // Hàm tự động tính toán (lọc) lại mảng sách dựa vào searchText
        const filteredBooks = computed(() => {
            if (!searchText.value) return books.value;
            const lowerSearch = searchText.value.toLowerCase();
            return books.value.filter(
                (book) =>
                    book.tenSach.toLowerCase().includes(lowerSearch) ||
                    book.tacGia.toLowerCase().includes(lowerSearch),
            );
        });

        // Lúc component vừa load lên thì chạy hàm retrieveBooks
        onMounted(() => {
            retrieveBooks();
        });

        return {
            books,
            searchText,
            filteredBooks,
        };
    },
};
</script>

<style scoped>
.transition-hover {
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}
.transition-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}
</style>
