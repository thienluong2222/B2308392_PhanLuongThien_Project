import createApiClient from "./api.service";

class TheoDoiService {
    constructor(baseUrl = "/api/theodoimuonsach") { 
        this.api = createApiClient("http://localhost:3000" + baseUrl);
    }
    
    async yeuCauMuon(data) {
        return (await this.api.post("/", data)).data;
    }
    
    // 1. Cập nhật sửa đoạn này để gửi Params (như query ?maDocGia) lên server
    async getAll(params) {
        return (await this.api.get("/", { params })).data;
    }

    // 2. Thêm hàm gọi PUT trả sách này vào
    async yeuCauTra(id) {
        return (await this.api.put(`/${id}/yeu-cau-tra`)).data;
    }

    async duyetMuon(id, msnv, isDuyet, hanTraMoi) {
        return (await this.api.put(`/${id}/duyet-muon`, { msnv, isDuyet, hanTraMoi })).data;
    }
    
    async giaHan(id, hanTraMoi) {
        return (await this.api.put(`/${id}/gia-han`, { hanTraMoi })).data;
    }

    async duyetTra(id, msnv) {
        return (await this.api.put(`/${id}/duyet-tra`, { msnv })).data;
    }
}
export default new TheoDoiService();