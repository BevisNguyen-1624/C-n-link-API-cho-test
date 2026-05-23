import { MongoClient, ObjectId } from "mongodb";
import type { VercelRequest, VercelResponse } from "@vercel/node";


const uri = process.env.MONGODB_URI!;
let client: MongoClient;

async function getDb() {
  if (!client) client = await new MongoClient(uri).connect();
  return client.db("hoyota");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = await getDb();
    const action = req.method === "GET"
      ? req.query.action as string
      : req.body?.action;

    // ── GET IDEAS ──────────────────────────────────────────
    if (action === "getIdeas") {
      const reviewerId = (req.query.reviewerId as string)?.trim().toUpperCase();
      const reviewer = await db.collection("reviewers").findOne({
        reviewerId: { $regex: new RegExp(`^${reviewerId}$`, "i") }
      });
      if (!reviewer) return res.json({ ok: false, error: "Mã không hợp lệ" });

      // Lấy ideas theo assignedSheets
      const assignedWithPrefix = reviewer.assignedSheets?.length > 0
  ? reviewer.assignedSheets.map((s: string) => `T5. ${s}`)
  : [];
      const filter = assignedWithPrefix.length > 0
  ? { sheetName: { $in: assignedWithPrefix } }
  : {};
      const allIdeas = await db.collection("ideas").find(filter).toArray();

      // Lọc ra ideas người này chưa chấm
      const myScores = await db.collection("scores")
        .find({ reviewerId: reviewer.reviewerId })
        .toArray();
      const scoredIds = new Set(myScores.map(s => s.ideaId.toString()));

      const ideas = allIdeas
        .filter(i => !scoredIds.has(i._id.toString()))
        .map(i => ({
          id:         i._id.toString(),
          sheetName:  i.sheetName  || "",
          maNV:       i.maNV       || "",
          tenYT:      i.tenYT      || "",
          level:      i.level      || "",
          vanDe:      i.vanDe      || "",
          moTa:       i.moTa       || "",
          hieuQua:    i.hieuQua    || "",
          nguonLuc:   i.nguonLuc   || "",
          giaTri:     i.giaTri     || "",
          vungPB:     i.vungPB     || "",
          pbLienQuan: i.pbLienQuan || "",
          thuNghiem:  i.thuNghiem  || "",
          link:       i.link       || "",
          scoreN: "", scoreO: "", scoreP: "", scoreQ: "",
          goodJob: false, baoVe: false, feedback: "",
        }));
        if (action === "verifyReviewer") {
  const reviewerId = (req.query.reviewerId as string)?.trim().toUpperCase();
  const reviewer = await db.collection("reviewers").findOne({
    reviewerId: { $regex: new RegExp(`^${reviewerId}$`, "i") }
  });
  if (!reviewer) return res.json({ ok: false, error: "Mã không hợp lệ" });

  const filter = reviewer.assignedSheets?.length > 0
    ? { sheetName: { $in: reviewer.assignedSheets } }
    : {};
  
  const allIdeas = await db.collection("ideas").find(filter).toArray();
  const myScores = await db.collection("scores")
    .find({ reviewerId: reviewer.reviewerId })
    .toArray();

  // ── DEBUG ──
  const sampleIdea = allIdeas[0];
  const sampleScore = myScores[0];
  return res.json({
    ok: false,
    debug: {
      totalIdeas: allIdeas.length,
      totalMyScores: myScores.length,
      sampleIdeaId: sampleIdea?._id?.toString(),
      sampleIdeaIdType: typeof sampleIdea?._id,
      sampleScoreIdeaId: sampleScore?.ideaId,
      sampleScoreIdeaIdType: typeof sampleScore?.ideaId,
      assignedSheets: reviewer.assignedSheets,
      sampleSheetName: sampleIdea?.sheetName,
    }
  });
  // ── HẾT DEBUG ──

      // Tính sheetUrl nếu có
      const sheetUrl = reviewer.sheetUrls?.[reviewer.assignedSheets?.[0]] || null;

      return res.json({
        ok: true,
        ideas,
        isAssigner: reviewer.isAssigner || false,
        pendingCount: ideas.length,
        sheetUrl,
      });
    }

    // ── VERIFY REVIEWER ────────────────────────────────────
    if (action === "verifyReviewer") {
      const reviewerId = (req.query.reviewerId as string)?.trim().toUpperCase();
      const reviewer = await db.collection("reviewers").findOne({
        reviewerId: { $regex: new RegExp(`^${reviewerId}$`, "i") }
      });
      if (!reviewer) return res.json({ ok: false, error: "Mã không hợp lệ" });

      const filter = reviewer.assignedSheets?.length > 0
        ? { sheetName: { $in: reviewer.assignedSheets } }
        : {};
      const allIdeas = await db.collection("ideas").find(filter).toArray();
      const myScores = await db.collection("scores")
        .find({ reviewerId: reviewer.reviewerId })
        .toArray();
      const scoredIds = new Set(myScores.map(s => s.ideaId.toString()));
      const pendingCount = allIdeas.filter(i => !scoredIds.has(i._id.toString())).length;

      return res.json({
        ok: true,
        reviewerId: reviewer.reviewerId,
        name: reviewer.name,
        isAssigner: reviewer.isAssigner || false,
        pendingCount,
      });
    }

    // ── SUBMIT SCORE ───────────────────────────────────────
    if (action === "submitScore" && req.method === "POST") {
      const body = req.body;

      // Kiểm tra đã chấm chưa
      const existing = await db.collection("scores").findOne({
        ideaId:     body.ideaId,
        reviewerId: body.reviewerId,
      });
      if (existing) return res.json({ ok: false, error: "Bạn đã chấm sáng kiến này rồi" });

      // Lưu điểm
      await db.collection("scores").insertOne({
        ideaId:       body.ideaId,
        sheetName:    body.sheetName,
        reviewerId:   body.reviewerId,
        reviewerName: body.reviewerName,
        scoreN:       Number(body.scoreN),
        scoreO:       Number(body.scoreO),
        scoreP:       Number(body.scoreP),
        scoreQ:       Number(body.scoreQ),
        goodJob:      body.goodJob,
        baoVe:        body.baoVe,
        feedback:     body.feedback,
        timestamp:    new Date(),
      });

      // Tính trung bình tất cả người đã chấm idea này
      const allScores = await db.collection("scores")
        .find({ ideaId: body.ideaId })
        .toArray();
      const count = allScores.length;
      const avg = (key: string) =>
        Math.round(allScores.reduce((s, r) => s + Number(r[key]), 0) / count * 10) / 10;

      // Cập nhật idea với điểm trung bình
      await db.collection("ideas").updateOne(
        { _id: new ObjectId(body.ideaId) },
        {
          $set: {
            avgN:          avg("scoreN"),
            avgO:          avg("scoreO"),
            avgP:          avg("scoreP"),
            avgQ:          avg("scoreQ"),
            avgTotal:      avg("scoreN") + avg("scoreO") + avg("scoreP") + avg("scoreQ"),
            goodJob:       (avg("scoreN") + avg("scoreO") + avg("scoreP") + avg("scoreQ")) >= 7,
            baoVe:         allScores.some(r => r.baoVe === true),
            feedback:      allScores.map(r => r.feedback).filter(Boolean).join(" | "),
            reviewerNames: allScores.map(r => r.reviewerName).join(" - "),
            scoredCount:   count,
          }
        }
      );

      return res.json({ ok: true });
    }

    return res.json({ ok: false, error: "Unknown action" });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}