import createApiClient from "./api.service";

class SachService {
    constructor(baseUrl = "/api/sach") {
        this.api = createApiClient("http://localhost:3000" + baseUrl);
    }
    
    // Lấy mọi dữ liệu
    async getAll() { return (await this.api.get("/")).data; }
    async get(id) { return (await this.api.get(`/${id}`)).data; }

    // Dành cho CRUD Admin
    async create(data) { return (await this.api.post("/", data)).data; }
    async update(id, data) { return (await this.api.put(`/${id}`, data)).data; }
    async delete(id) { return (await this.api.delete(`/${id}`)).data; }
}

export default new SachService();