// import-to-mongo.mjs
// Chạy: node import-to-mongo.mjs
// Cần cài: npm install mongodb

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

// ← Thay bằng connection string của bạn
const MONGODB_URI = "mongodb+srv://binhnh:hellohoho1624@hoyota.toogehf.mongodb.net/";
const DB_NAME = "hoyota";

const ideas = JSON.parse(readFileSync("./ideas.json", "utf-8"));

async function main() {
  console.log(`🔌 Connecting to MongoDB...`);
  const client = await new MongoClient(MONGODB_URI).connect();
  const db = client.db(DB_NAME);

  // ── Import Ideas ──────────────────────────────────────
  console.log(`📦 Importing ${ideas.length} ideas...`);
  const ideasCol = db.collection("ideas");

  // Xóa data cũ nếu có
  await ideasCol.deleteMany({});

  // Thêm metadata
  const ideasWithMeta = ideas
    .filter(i => i.maNV && i.tenYT) // bỏ dòng trống
    .map(i => ({
      ...i,
      createdAt: new Date(),
      avgN: null, avgO: null, avgP: null, avgQ: null,
      avgTotal: null,
      goodJob: null,
      baoVe: false,
      feedback: "",
      reviewerNames: "",
      scoredCount: 0,
    }));

  const result = await ideasCol.insertMany(ideasWithMeta);
  console.log(`✅ Inserted ${result.insertedCount} ideas`);

  // ── Tạo Indexes ───────────────────────────────────────
  await ideasCol.createIndex({ sheetName: 1 });
  await ideasCol.createIndex({ maNV: 1 });
  console.log(`✅ Created indexes for ideas`);

  // ── Tạo Scores collection ─────────────────────────────
  await db.createCollection("scores").catch(() => {}); // ignore nếu đã có
  const scoresCol = db.collection("scores");
  await scoresCol.createIndex({ ideaId: 1, reviewerId: 1 }, { unique: true });
  console.log(`✅ Scores collection ready`);

  // ── Import Reviewers ──────────────────────────────────
  const reviewers = [
    { reviewerId: "YD0001",  name: "Nguyễn Việt Hòa",       isAssigner: false, assignedSheets: ["Dương Sơn Tùng"] },
    { reviewerId: "FGG0001", name: "Nguyễn Kim Thanh",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD5591",  name: "Lê Đình Vãng",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD6666",  name: "Đỗ Quang Hiếu",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0067",  name: "Phạm Quang Trung",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0089",  name: "Bùi Thị Ngân",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD24797", name: "Tăng Duy Phương",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0003",  name: "Tạ Thị Mận",             isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23442", name: "Nguyễn Hoàng Đoàn",      isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0026",  name: "Đinh Trung Sơn",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD21885", name: "Trần Thị Hồng",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD11228", name: "Đào Hồng Nhung",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD26002", name: "Lê Việt Hà",             isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0077",  name: "Dương Sơn Tùng",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD12965", name: "Nguyễn Văn Trung",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD22313", name: "Trương Diễm Mi",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD2077",  name: "Trần Xuân Đức",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD5700",  name: "Lê Thị Bình",            isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD5707",  name: "Vũ Thị Loan",            isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD3865",  name: "Vũ Hoài Linh",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD4553",  name: "Phạm Thị Dung",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD2215",  name: "Nguyễn Thị Hương",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD4149",  name: "Nguyễn Đức Lộc",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD2279",  name: "Mạc Đức Thắng",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD5596",  name: "Ngô Thị Ngân",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23558", name: "Nguyễn Khang Thịnh",     isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD24002", name: "Nguyễn Thành Tuấn",      isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD14348", name: "Nguyễn Công Văn",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0098",  name: "Trịnh Thị Quỳnh",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23526", name: "Phan Anh",               isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD21475", name: "Nguyễn Trọng Dương",     isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23603", name: "Nguyễn Văn Quảng",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23650", name: "Nguyễn Tuấn Anh",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23651", name: "Hoàng Xuân Quý",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23758", name: "Hoàng Tiến Thành",       isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD17932", name: "Đinh Thanh Bình",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD23529", name: "Trần Duy Ngự",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "HT1081",  name: "Lê Minh Quang",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "HT1023",  name: "Vũ Thị Hồng Nhung",      isAssigner: false, assignedSheets: [] },
    { reviewerId: "HT1045",  name: "Bùi Thị Bích Thiềm",     isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0337",  name: "Bùi Thị Then",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "HT1065",  name: "Phạm Thị Dung",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD0585",  name: "Phạm Hải Linh",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD16261", name: "Nguyễn Thị Thúy Hằng",   isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD19573", name: "Trần Thị Hằng",          isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD24268", name: "Lý Minh Phương",         isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD24638", name: "Tạ Thu Trang",           isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD25601", name: "Nguyễn Huy Bình",        isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD26006", name: "Nguyễn Dương Bảo Ngọc",  isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD26299", name: "Nguyễn Thị Thùy Duyên",  isAssigner: false, assignedSheets: [] },
    { reviewerId: "YD26331", name: "Lê Đức Huy",             isAssigner: false, assignedSheets: [] },
  ];

  const reviewersCol = db.collection("reviewers");
  await reviewersCol.deleteMany({});
  await reviewersCol.insertMany(reviewers);
  await reviewersCol.createIndex({ reviewerId: 1 }, { unique: true });
  console.log(`✅ Inserted ${reviewers.length} reviewers`);

  // ── Summary ───────────────────────────────────────────
  console.log("\n📊 Database summary:");
  const sheets = [...new Set(ideasWithMeta.map(i => i.sheetName))].sort();
  sheets.forEach(s => {
    const count = ideasWithMeta.filter(i => i.sheetName === s).length;
    console.log(`  ${s}: ${count} sáng kiến`);
  });

  console.log("\n🎉 Import hoàn tất!");
  console.log("⚠️  Nhớ cập nhật assignedSheets cho từng reviewer trong MongoDB Atlas UI");

  await client.close();
}

main().catch(console.error);
