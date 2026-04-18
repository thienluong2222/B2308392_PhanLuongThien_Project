const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'QuanLyMuonSach';

async function fixDuplicates() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log("🔄 Đang kết nối tới MongoDB...");
        await client.connect();
        const db = client.db(DB_NAME);
        const sachCollection = db.collection('Sach');
        const nxbCollection = db.collection('NhaXuatBan');

        // Lấy toàn bộ Nhà xuất bản
        const tatCaNXB = await nxbCollection.find({}).toArray();
        
        // Gom nhóm NXB theo tên NXB
        const nxbGroupByTen = {};
        for (const nxb of tatCaNXB) {
            const ten = nxb.tenNXB.trim();
            if (!nxbGroupByTen[ten]) {
                nxbGroupByTen[ten] = [];
            }
            nxbGroupByTen[ten].push(nxb);
        }

        let soGomNhom = 0;
        let soNXBBiXoa = 0;
        let soSachCapNhat = 0;

        for (const [ten, danhSachGiongNhau] of Object.entries(nxbGroupByTen)) {
            // Nếu có nhiều hơn 1 NXB có cùng tên -> trùng lặp
            if (danhSachGiongNhau.length > 1) {
                soGomNhom++;
                // Chọn thằng đầu tiên làm NXB CHUẨN (giữ lại)
                const nxbChuan = danhSachGiongNhau[0];
                
                // Những thằng còn lại sẽ BỊ XÓA (lấy danh sách mã của chúng)
                const danhSachMaNXBCanXoa = [];
                for (let i = 1; i < danhSachGiongNhau.length; i++) {
                    danhSachMaNXBCanXoa.push(danhSachGiongNhau[i].maNXB);
                }

                if (danhSachMaNXBCanXoa.length > 0) {
                    console.log(`🔧 Xử lý NXB bị trùng: [${ten}]`);
                    console.log(`   - Giữ lại Mã Chuẩn: ${nxbChuan.maNXB}`);
                    console.log(`   - Chuyển Sách từ các mã cũ: ${danhSachMaNXBCanXoa.join(', ')}`);

                    // Cập nhật SÁCH: Sửa những sách nào đang xài maNXB cũ thành maNXB CHUẨN
                    const updateResult = await sachCollection.updateMany(
                        { maNXB: { $in: danhSachMaNXBCanXoa } },
                        { $set: { maNXB: nxbChuan.maNXB } }
                    );
                    soSachCapNhat += updateResult.modifiedCount;

                    // XÓA CÁC NXB TRÙNG LẶP
                    const deleteResult = await nxbCollection.deleteMany(
                        { maNXB: { $in: danhSachMaNXBCanXoa } }
                    );
                    soNXBBiXoa += deleteResult.deletedCount;
                }
            }
        }

        console.log("-----------------------------------------");
        if (soGomNhom === 0) {
            console.log("✅ Hệ thống làm sạch: Không phát hiện Nhà Xuất Bản nào bị trùng tên!");
        } else {
            console.log("✅ HOÀN TẤT LỌC VÀ DỌN DẸP NXB TRÙNG LẶP!");
            console.log(`   - Tập tên NXB đã gom: ${soGomNhom}`);
            console.log(`   - Bão xoá (số NXB dư thừa bị xoá): ${soNXBBiXoa}`);
            console.log(`   - Cập nhật nối lại thẻ chuẩn cho sách: ${soSachCapNhat} cuốn sách`);
        }

    } catch (error) {
        console.error("Bị lỗi:", error);
    } finally {
        await client.close();
        console.log("Đã đóng cổng cơ sở dữ liệu.");
    }
}

fixDuplicates();
