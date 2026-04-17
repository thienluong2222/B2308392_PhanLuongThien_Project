<template>
    <div class="home-page">
        <!-- Banner -->
        <div class="p-5 mb-4 bg-primary text-white modern-radius modern-shadow">
            <div class="py-5">
                <h1 class="display-5 fw-bold">Chào mừng đến với LibManager</h1>
                <p class="col-md-8 fs-4 mt-3">
                    Hệ thống thư viện hiện đại, cung cấp kho tàng tri thức bất
                    tận. Quản lý mượn trả tự động, nhanh chóng và dễ dàng.
                </p>
                <router-link
                    to="/thuvien"
                    class="btn btn-light btn-lg fw-bold text-primary mt-3 modern-radius px-4"
                >
                    Khám phá Sách Ngay
                </router-link>
            </div>
        </div>

        <!-- Giới thiệu ngắn -->
        <div class="row text-center mt-5 mb-4">
            <div class="col-md-4">
                <i class="bi bi-book text-primary" style="font-size: 3rem"></i>
                <h4 class="fw-bold mt-2">Hàng ngàn đầu sách</h4>
                <p class="text-muted">
                    Đa dạng thể loại từ văn học, kỹ năng đến giáo trình chuyên
                    ngành.
                </p>
            </div>
            <div class="col-md-4">
                <i
                    class="bi bi-lightning-charge text-warning"
                    style="font-size: 3rem"
                ></i>
                <h4 class="fw-bold mt-2">Mượn trả siêu tốc</h4>
                <p class="text-muted">
                    Chỉ với 1 click, yêu cầu mượn của bạn sẽ được xử lý tự động.
                </p>
            </div>
            <div class="col-md-4">
                <i
                    class="bi bi-shield-check text-success"
                    style="font-size: 3rem"
                ></i>
                <h4 class="fw-bold mt-2">Theo dõi thông minh</h4>
                <p class="text-muted">
                    Cập nhật chính xác lịch sử mượn, nhắc nhở trước khi trễ hạn.
                </p>
            </div>
        </div>
    </div>
</template>
