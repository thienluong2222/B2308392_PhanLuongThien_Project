const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'QuanLyMuonSach'; 

// DÙNG 20 MÃ ISBN KINH ĐIỂN QUỐC TẾ - LÚC NÀO CŨNG LOAD ĐƯỢC TỪ OPEN LIBRARY CDN
const MOCK_BOOKS = [
    { title: "Đắc Nhân Tâm", author: "Dale Carnegie", publisher: "Simon & Schuster", year: "1936", cover: "https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg" },
    { title: "Nhà Giả Kim", author: "Paulo Coelho", publisher: "HarperCollins", year: "1988", cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg" },
    { title: "Lược Sử Loài Người", author: "Yuval Noah Harari", publisher: "Harper", year: "2011", cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" },
    { title: "Bố Giàu Bố Nghèo", author: "Robert T. Kiyosaki", publisher: "Plata Publishing", year: "1997", cover: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg" },
    { title: "Đi Tìm Lẽ Sống", author: "Viktor E. Frankl", publisher: "Beacon Press", year: "1946", cover: "https://covers.openlibrary.org/b/isbn/9780807014295-L.jpg" },
    { title: "Thói Quen Atom", author: "James Clear", publisher: "Avery", year: "2018", cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
    { title: "7 Thói Quen Của Người Thành Đạt", author: "Stephen R. Covey", publisher: "Free Press", year: "1989", cover: "https://covers.openlibrary.org/b/isbn/9781451639612-L.jpg" },
    { title: "Đại Gia Gatsby", author: "F. Scott Fitzgerald", publisher: "Scribner", year: "1925", cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
    { title: "Suối Nguồn", author: "Ayn Rand", publisher: "Signet", year: "1943", cover: "https://covers.openlibrary.org/b/isbn/9780451191151-L.jpg" },
    { title: "Hoàng Tử Bé", author: "Antoine de Saint-Exupéry", publisher: "Harcourt", year: "1943", cover: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg" },
    { title: "Cuốn Theo Chiều Gió", author: "Margaret Mitchell", publisher: "Scribner", year: "1936", cover: "https://covers.openlibrary.org/b/isbn/9781451635621-L.jpg" },
    { title: "Giết Con Chim Nhại", author: "Harper Lee", publisher: "Harper Perennial", year: "1960", cover: "https://covers.openlibrary.org/b/isbn/9780060935467-L.jpg" },
    { title: "Bắt Trẻ Đồng Xanh", author: "J.D. Salinger", publisher: "Little, Brown", year: "1951", cover: "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg" },
    { title: "1984", author: "George Orwell", publisher: "Signet Classic", year: "1949", cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
    { title: "Tội Ác Và Hình Phạt", author: "Fyodor Dostoevsky", publisher: "Bantam Classics", year: "1866", cover: "https://covers.openlibrary.org/b/isbn/9780451530066-L.jpg" },
    { title: "Dám Bị Ghét", author: "Ichiro Kishimi", publisher: "Atria Books", year: "2013", cover: "https://covers.openlibrary.org/b/isbn/9781501197274-L.jpg" },
    { title: "Nghĩ Giàu Làm Giàu", author: "Napoleon Hill", publisher: "TarcherPerigee", year: "1937", cover: "https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg" },
    { title: "Sức Mạnh Của Thói Quen", author: "Charles Duhigg", publisher: "Random House", year: "2012", cover: "https://covers.openlibrary.org/b/isbn/9780812981605-L.jpg" },
    { title: "Chúa Tể Những Chiếc Nhẫn", author: "J.R.R. Tolkien", publisher: "Houghton Mifflin", year: "1954", cover: "https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg" },
    { title: "Harry Potter và Hòn Đá Phù Thủy", author: "J.K. Rowling", publisher: "Scholastic", year: "1997", cover: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg" }
];

async function seedData() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const sachCollection = db.collection('Sach');
        const nxbCollection = db.collection('NhaXuatBan');

        console.log("🧹 Đang dọn dẹp xoá hết sách và NXB bị lỗi/trùng ảnh trên hệ thống...");
        // XOÁ TOÀN BỘ SÁCH VÀ NXB ĐỂ CHUẨN BỊ LÀM LÁI DATA CLONE ĐẸP 20 CUỐN
        await sachCollection.deleteMany({});
        await nxbCollection.deleteMany({});

        console.log("🌍 Bắt đầu nạp 20 quyển sách CHẤT LƯỢNG CAO vào thư viện...");

        const newPublishers = [];
        const booksToInsert = [];
        const publisherMap = new Map(); // Trống hoàn toàn vì đã Clear Db

        for (const item of MOCK_BOOKS) {
            const tenNXBThat = item.publisher;
            let maNXB = publisherMap.get(tenNXBThat);
            
            if (!maNXB) {
                maNXB = `NXB_${Date.now().toString().slice(-4)}_${newPublishers.length}`;
                const nxbMoi = { maNXB: maNXB, tenNXB: tenNXBThat, diaChi: "Quốc Tế - Worldwide" };
                newPublishers.push(nxbMoi);
                publisherMap.set(tenNXBThat, maNXB);
            }

            let randomPrice = Math.floor(Math.random() * 150000) + 50000; 

            const sach = {
                maSach: `S${Date.now().toString().slice(-4)}${Math.random().toString().slice(2, 6)}`,
                tenSach: item.title,
                donGia: randomPrice,
                soQuyen: Math.floor(Math.random() * 20) + 5, 
                namXuatBan: item.year,
                maNXB: maNXB,
                tacGia: item.author,
                hinhBia: item.cover,
            };
            
            booksToInsert.push(sach);
        }

        console.log(`🏭 Đã tạo mới ${newPublishers.length} Tuyến Nhà Xuất Bản tiêu chuẩn.`);
        await nxbCollection.insertMany(newPublishers);

        console.log(`📚 Đang xếp ${booksToInsert.length} quyển sách lên kệ...`);
        const result = await sachCollection.insertMany(booksToInsert);
        
        console.log(`✨ BÙM! HOÀN TẤT! Đã nhập thành công ${result.insertedCount} cuốn sách vào CSDL!`);

    } catch (error) {
        console.error("Bị lỗi:", error);
    } finally {
        await client.close();
    }
}
seedData();
