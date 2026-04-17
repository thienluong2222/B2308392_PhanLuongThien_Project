import createApiClient from "./api.service";

class NhaXuatBanService {
    constructor(baseUrl = "/api/nhaxuatban") {
        this.api = createApiClient("http://localhost:3000" + baseUrl);
    }

    async getAll() {
        return (await this.api.get("/")).data;
    }

    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getById(id) {
        return (await this.api.get(`/${id}`)).data;
    }
}

export default new NhaXuatBanService();
