import createApiClient from "./api.service";

class AuthService {
    constructor(baseUrl = "/api/docgia") {
        this.api = createApiClient("http://localhost:3000" + baseUrl);
    }
    
    // --- CHO ĐỘC GIẢ ---
    async login(credentials) {
        const response = await this.api.post("/login", credentials);
        if (response.data && response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data.docGia));
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    }

    async register(data) {
        return (await this.api.post("/", data)).data;
    }

    // --- CHO NHÂN VIÊN / ADMIN ---
    async loginAdmin(credentials) {
        const apiAdmin = createApiClient("http://localhost:3000/api/nhanvien");
        const response = await apiAdmin.post("/login", credentials);
        if (response.data && response.data.token) {
            // Gắn thêm 1 huy hiệu "role: admin" để lát nữa giao diện tự phân biệt
            const adminUser = { ...response.data.nhanVien, role: 'admin' };
            localStorage.setItem("user", JSON.stringify(adminUser));
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    }

    async registerAdmin(data) {
        const apiAdmin = createApiClient("http://localhost:3000/api/nhanvien");
        return (await apiAdmin.post("/", data)).data;
    }

    // --- CHUNG ---
    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    getCurrentUser() {
        const userStr = localStorage.getItem("user");
        if (userStr) return JSON.parse(userStr);
        return null;
    }
}
export default new AuthService();