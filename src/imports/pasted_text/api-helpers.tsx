import { useState, useEffect, useRef } from "react";
import bgImage from "../KV_HÒ_YO_TA-01.jpeg";
import boatImage from "../boat.png";

const API_URL = "https://script.google.com/macros/s/AKfycbyB_o9sPex3tk7DfIIO3RmB7TZdmRe3TO7qShPN5wPz2SAQieYlsjZSkguJKzvKeGU/exec";
const USE_MOCK = false;
const ADMIN_PIN = "1234";
const LS_KEY = "hoYoTa_reviewers";
const LS_KEY_ASSIGNERS = "hoYoTa_assigners";
const LS_KEY_ASSIGNMENTS = "hoYoTa_assignments";
const LS_KEY_PROGRESS = "hoYoTa_progress";
const LS_KEY_COMPLETED = "hoYoTa_completed";
const PROGRESS_TRACKING_URL = "https://docs.google.com/spreadsheets/d/1oHkOgPVjNrvt8-YzDsp1dWOZqaNKdklh6BTFKx6nksI/edit?gid=2068815285#gid=2068815285";

// ═══ DANH SÁCH CỐ ĐỊNH — không phụ thuộc localStorage ═══
const DEFAULT_REVIEWERS = [
  { reviewerId: "YD0001",  name: "Nguyễn Việt Hòa" },
  { reviewerId: "FGG0001", name: "Nguyễn Kim Thanh" },
  { reviewerId: "YD5591",  name: "Lê Đình Vãng" },
  { reviewerId: "YD6666",  name: "Đỗ Quang Hiếu" },
  { reviewerId: "YD0067",  name: "Phạm Quang Trung" },
  { reviewerId: "YD0089",  name: "Bùi Thị Ngân" },
  { reviewerId: "YD24797", name: "Tăng Duy Phương" },
  { reviewerId: "YD0003",  name: "Tạ Thị Mận" },
  { reviewerId: "YD23442", name: "Nguyễn Hoàng Đoàn" },
  { reviewerId: "YD0026",  name: "Đinh Trung Sơn" },
  { reviewerId: "YD21885", name: "Trần Thị Hồng" },
  { reviewerId: "YD11228", name: "Đào Hồng Nhung" },
  { reviewerId: "YD26002", name: "Lê Việt Hà" },
  { reviewerId: "YD0077",  name: "Dương Sơn Tùng" },
  { reviewerId: "YD12965", name: "Nguyễn Văn Trung" },
  { reviewerId: "YD22313", name: "Trương Diễm Mi" },
  { reviewerId: "YD2077",  name: "Trần Xuân Đức" },
  { reviewerId: "YD5700",  name: "Lê Thị Bình" },
  { reviewerId: "YD5707",  name: "Vũ Thị Loan" },
  { reviewerId: "YD3865",  name: "Vũ Hoài Linh" },
  { reviewerId: "YD4553",  name: "Phạm Thị Dung" },
  { reviewerId: "YD2215",  name: "Nguyễn Thị Hương" },
  { reviewerId: "YD4149",  name: "Nguyễn Đức Lộc" },
  { reviewerId: "YD2279",  name: "Mạc Đức Thắng" },
  { reviewerId: "YD5596",  name: "Ngô Thị Ngân" },
  { reviewerId: "YD23558", name: "Nguyễn Khang Thịnh" },
  { reviewerId: "YD24002", name: "Nguyễn Thành Tuấn" },
  { reviewerId: "YD14348", name: "Nguyễn Công Văn" },
  { reviewerId: "YD0098",  name: "Trịnh Thị Quỳnh" },
  { reviewerId: "YD23526", name: "Phan Anh" },
  { reviewerId: "YD21475", name: "Nguyễn Trọng Dương" },
  { reviewerId: "YD23603", name: "Nguyễn Văn Quảng" },
  { reviewerId: "YD23650", name: "Nguyễn Tuấn Anh" },
  { reviewerId: "YD23651", name: "Hoàng Xuân Quý" },
  { reviewerId: "YD23758", name: "Hoàng Tiến Thành" },
  { reviewerId: "YD17932", name: "Đinh Thanh Bình" },
  { reviewerId: "YD23529", name: "Trần Duy Ngự" },
  { reviewerId: "HT1081",  name: "Lê Minh Quang" },
  { reviewerId: "HT1023",  name: "Vũ Thị Hồng Nhung" },
  { reviewerId: "HT1045",  name: "Bùi Thị Bích Thiềm" },
  { reviewerId: "YD0337",  name: "Bùi Thị Then" },
  { reviewerId: "HT1065",  name: "Phạm Thị Dung" },
  { reviewerId: "YD0585",  name: "Phạm Hải Linh" },
  { reviewerId: "YD16261", name: "Nguyễn Thị Thúy Hằng" },
  { reviewerId: "YD19573", name: "Trần Thị Hằng" },
  { reviewerId: "YD24268", name: "Lý Minh Phương" },
  { reviewerId: "YD24638", name: "Tạ Thu Trang" },
  { reviewerId: "YD25601", name: "Nguyễn Huy Bình" },
  { reviewerId: "YD26006", name: "Nguyễn Dương Bảo Ngọc" },
  { reviewerId: "YD26299", name: "Nguyễn Thị Thùy Duyên" },
  { reviewerId: "YD26331", name: "Lê Đức Huy" },
];

interface Assigner {
  reviewerId: string;
  name: string;
  assignees: string[];
}

interface Assignment {
  ideaKey: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
}

interface Progress {
  reviewerId: string;
  currentIndex: number;
  currentIdeaKey?: string;
  scores: Record<string, any>;
  savedAt: string;
}

// localStorage chỉ dùng cho Admin thêm/xóa thành viê
// Login luôn dùng DEFAULT_REVIEWERS
function loadReviewers(): { reviewerId: string; name: string }[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_REVIEWERS;
}

function saveReviewers(list: { reviewerId: string; name: string }[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function loadAssigners(): Assigner[] {
  try {
    const raw = localStorage.getItem(LS_KEY_ASSIGNERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAssigners(list: Assigner[]) {
  localStorage.setItem(LS_KEY_ASSIGNERS, JSON.stringify(list));
}

function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(LS_KEY_ASSIGNMENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAssignments(list: Assignment[]) {
  localStorage.setItem(LS_KEY_ASSIGNMENTS, JSON.stringify(list));
}

function loadProgress(reviewerId: string): Progress | null {
  try {
    const raw = localStorage.getItem(LS_KEY_PROGRESS);
    if (!raw) return null;
    const allProgress: Progress[] = JSON.parse(raw);
    return allProgress.find(p => p.reviewerId === reviewerId) || null;
  } catch {}
  return null;
}

function saveProgress(progress: Progress) {
  try {
    const raw = localStorage.getItem(LS_KEY_PROGRESS);
    let allProgress: Progress[] = raw ? JSON.parse(raw) : [];
    allProgress = allProgress.filter(p => p.reviewerId !== progress.reviewerId);
    allProgress.push(progress);
    localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(allProgress));
  } catch {}
}

function clearProgress(reviewerId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY_PROGRESS);
    if (!raw) return;
    let allProgress: Progress[] = JSON.parse(raw);
    allProgress = allProgress.filter(p => p.reviewerId !== reviewerId);
    localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(allProgress));
  } catch {}
}

function loadCompletedIdeas(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY_COMPLETED);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function markIdeaCompleted(ideaKey: string) {
  try {
    const completed = loadCompletedIdeas();
    if (!completed.includes(ideaKey)) {
      completed.push(ideaKey);
      localStorage.setItem(LS_KEY_COMPLETED, JSON.stringify(completed));
    }
  } catch {}
}

const MOCK_IDEAS = [
  {
    sheetName: "Phòng Kinh Doanh",
    rowIndex: 2,
    maNV: "NV001",
    tenYT: "Tự động hóa quy trình báo cáo bán hàng",
    level: "Cải tiến quy trình",
    thuNghiem: "Chưa",
    pbLienQuan: "Kinh doanh, IT",
    vungPB: "Vùng 1",
    vanDe: "Báo cáo bán hàng tốn nhiều thời gian, dễ sai sót do nhập liệu thủ công",
    moTa: "Xây dựng dashboard tự động kết nối với CRM, cập nhật số liệu real-time",
    hieuQua: "Tiết kiệm 10h/tuần, giảm 90% sai sót",
    nguonLuc: "1 developer, 2 tuần",
    giaTri: "Tăng hiệu suất team, dữ liệu chính xác hơn cho quyết định",
    link: "https://example.com/doc1",
    scoreN: "", scoreO: "", scoreP: "", scoreQ: "",
    goodJob: false, baoVe: false, feedback: "",
  },
  {
    sheetName: "Phòng Kỹ Thuật",
    rowIndex: 5,
    maNV: "NV102",
    tenYT: "Hệ thống quản lý bảo trì máy móc thông minh",
    level: "Sáng tạo mới",
    thuNghiem: "Đã thử nghiệm",
    pbLienQuan: "Kỹ thuật, Sản xuất",
    vungPB: "Vùng 2",
    vanDe: "Không có lịch bảo trì rõ ràng, máy móc thường hỏng đột xuất gây gián đoạn sản xuất",
    moTa: "Xây dựng app mobile quản lý lịch bảo trì định kỳ, cảnh báo sớm khi thiết bị cần kiểm tra",
    hieuQua: "Giảm 40% thời gian downtime, tăng tuổi thọ máy móc",
    nguonLuc: "App có sẵn, cần 1 tuần setup và training",
    giaTri: "Tăng năng suất sản xuất, giảm chi phí sửa chữa khẩn cấp",
    link: "",
    scoreN: "", scoreO: "", scoreP: "", scoreQ: "",
    goodJob: false, baoVe: false, feedback: "",
  },
  {
    sheetName: "Phòng Kinh Doanh",
    rowIndex: 8,
    maNV: "NV045",
    tenYT: "Chương trình khách hàng thân thiết",
    level: "Cải tiến sản phẩm/dịch vụ",
    thuNghiem: "Chưa",
    pbLienQuan: "Kinh doanh, Marketing",
    vungPB: "Toàn công ty",
    vanDe: "Tỷ lệ khách hàng quay lại thấp, chưa có chính sách ưu đãi rõ ràng",
    moTa: "Thiết lập hệ thống điểm thưởng cho khách hàng mua nhiều lần, tích hợp với app mobile",
    hieuQua: "Tăng 25% tỷ lệ khách hàng quay lại",
    nguonLuc: "Ngân sách marketing, phát triển tính năng trên app",
    giaTri: "Tăng doanh thu từ khách hàng cũ, xây dựng lòng trung thành thương hiệu",
    link: "https://example.com/loyalty-program",
    scoreN: "", scoreO: "", scoreP: "", scoreQ: "",
    goodJob: false, baoVe: false, feedback: "",
  },
];

const mockAPI = {
  // ═══ FIX: luôn dùng DEFAULT_REVIEWERS, không dùng localStorage ═══
  verifyReviewer: async (reviewerId: string) => {
    await new Promise(r => setTimeout(r, 0));
    const trimmedId = reviewerId.trim().toUpperCase();

    const reviewer = DEFAULT_REVIEWERS.find(r => r.reviewerId === trimmedId);
    if (!reviewer) return { ok: false, error: "Mã không hợp lệ" };

    const assigners = loadAssigners();
    const isAssigner = assigners.some(a => a.reviewerId === trimmedId);
    const assignments = loadAssignments();
    const completed = loadCompletedIdeas();
    const assignedIdeas = assignments.filter(a => a.assignedTo === trimmedId);

    let pendingCount = 0;
    if (assignments.length > 0) {
      pendingCount = assignedIdeas.filter(a => !completed.includes(a.ideaKey)).length;
    } else {
      pendingCount = MOCK_IDEAS.filter(idea => {
        const ideaKey = `${idea.sheetName}_${idea.rowIndex}`;
        return !completed.includes(ideaKey);
      }).length;
    }

    return { ok: true, ...reviewer, pendingCount, isAssigner };
  },

  getIdeas: async (reviewerId: string) => {
    await new Promise(r => setTimeout(r, 0));
    const assignments = loadAssignments();
    const assigners = loadAssigners();
    const completed = loadCompletedIdeas();
    const isAssigner = assigners.some(a => a.reviewerId === reviewerId);
    const assignedIdeas = assignments.filter(a => a.assignedTo === reviewerId);
    let ideas = [...MOCK_IDEAS];

    if (assignments.length > 0) {
      ideas = ideas.filter(idea => {
        const ideaKey = `${idea.sheetName}_${idea.rowIndex}`;
        return assignedIdeas.some(a => a.ideaKey === ideaKey) && !completed.includes(ideaKey);
      });
    } else {
      ideas = ideas.filter(idea => {
        const ideaKey = `${idea.sheetName}_${idea.rowIndex}`;
        return !completed.includes(ideaKey);
      });
    }

    return { ok: true, ideas, isAssigner };
  },

  submitScore: async (data: any) => {
    await new Promise(r => setTimeout(r, 0));
    console.log("📊 Đã lưu điểm:", data);
    const ideaKey = `${data.sheetName}_${data.rowIndex}`;
    markIdeaCompleted(ideaKey);
    return { ok: true };
  },

  assignIdea: async (data: { ideaKey: string; assignedTo: string; assignedBy: string }) => {
    await new Promise(r => setTimeout(r, 0));
    const assignments = loadAssignments();
    const newAssignment: Assignment = { ...data, assignedAt: new Date().toISOString() };
    assignments.push(newAssignment);
    saveAssignments(assignments);
    return { ok: true };
  },

  getUnassignedIdeas: async () => {
    await new Promise(r => setTimeout(r, 0));
    const assignments = loadAssignments();
    const completed = loadCompletedIdeas();
    const assignedKeys = new Set(assignments.map(a => a.ideaKey));
    const unassigned = MOCK_IDEAS.filter(idea => {
      const ideaKey = `${idea.sheetName}_${idea.rowIndex}`;
      return !assignedKeys.has(ideaKey) && !completed.includes(ideaKey);
    });
    return { ok: true, ideas: unassigned };
  },
};

const api = {
  get: async (params: Record<string, string>) => {
    if (USE_MOCK) {
      const { action, reviewerId } = params;
      if (action === "verifyReviewer") return mockAPI.verifyReviewer(reviewerId);
      if (action === "getIdeas") return mockAPI.getIdeas(reviewerId);
      if (action === "getUnassignedIdeas") return mockAPI.getUnassignedIdeas();
      return { ok: false, error: "Unknown action" };
    }
    return fetch(`${API_URL}?${new URLSearchParams(params)}`).then((r) => r.json());
  },
  post: async (body: any) => {
    if (USE_MOCK) {
      const { action } = body;
      if (action === "submitScore") return mockAPI.submitScore(body);
      if (action === "assignIdea") return mockAPI.assignIdea(body);
      return { ok: false, error: "Unknown action" };
    }
    return fetch(API_URL, { method: "POST", body: JSON.stringify(body) }).then((r) => r.json());
  },
};

const CRITERIA = [
  {
    key: "scoreN",
    label: "Tính rõ ràng",
    desc: "Vấn đề nêu có cụ thể, dễ hiểu, không mơ hồ",
    max: 2,
    options: [
      { val: 0, label: "0 — Không rõ ràng" },
      { val: 1, label: "1 — Tương đối rõ" },
      { val: 2, label: "2 — Rất rõ ràng" },
    ],
  },
  {
    key: "scoreO",
    label: "Tính phù hợp",
    desc: "Liên quan trực tiếp đến công việc, quy trình, hoạt động",
    max: 2,
    options: [
      { val: 0, label: "0 — Không phù hợp" },
      { val: 1, label: "1 — Phù hợp một phần" },
      { val: 2, label: "2 — Rất phù hợp" },
    ],
  },
  {
    key: "scoreP",
    label: "Khả thi bước đầu",
    desc: "Ý tưởng nghe có lý, có thể ứng dụng ngay tại BP/PB/Vùng",
    max: 2,
    options: [
      { val: 0, label: "0 — Không khả thi" },
      { val: 1, label: "1 — Ít khả thi" },
      { val: 2, label: "2 — Khả thi" },
    ],
  },
  {
    key: "scoreQ",
    label: "Tác động tiềm năng",
    desc: "Cá nhân/CH/BP: 2đ · Vùng/PB: 3đ · Công ty: 4đ",
    max: 4,
    options: [
      { val: 0, label: "0 — Không có tác động" },
      { val: 2, label: "2 — Cá nhân / CH / BP" },
      { val: 3, label: "3 — Vùng / Phòng ban" },
      { val: 4, label: "4 — Toàn công ty" },
    ],
  },
];

const GOODJOB_THRESHOLD = 7;

const S: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background: `url('${bgImage}') center top / cover no-repeat fixed`,
    fontFamily: "'Nunito', sans-serif",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 16px 60px",
  },
  topBar: {
    width: "100%",
    maxWidth: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 0 8px",
    borderBottom: "1px solid #bae6fd",
    marginBottom: 32,
  },
  logo: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 3,
    color: "#c00000",
    textTransform: "uppercase" as const,
  },
  badge: {
    background: "#ffffff",
    border: "1px solid #bae6fd",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    color: "#0369a1",
    fontWeight: 600,
  },
  card: {
    width: "100%",
    maxWidth: 800,
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid #bae6fd",
    borderRadius: 16,
    padding: "36px 40px",
    marginBottom: 20,
    boxShadow: "0 4px 24px rgba(14,165,233,0.08)",
  },
  h1: { fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5, color: "#0f172a" },
  sub: { fontSize: 13, color: "#64748b", margin: "0 0 28px" },
  label: {
    display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2,
    textTransform: "uppercase" as const, color: "#64748b", marginBottom: 8,
  },
  input: {
    width: "100%", background: "#f0f9ff", border: "1.5px solid #bae6fd",
    borderRadius: 10, padding: "14px 18px", fontSize: 16, fontWeight: 700,
    color: "#0f172a", outline: "none", letterSpacing: 2,
    textTransform: "uppercase" as const, boxSizing: "border-box" as const, transition: "border-color .2s",
  },
  namePreview: {
    marginTop: 14, padding: "12px 18px", background: "#f0fdf4",
    border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 14,
    color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
  },
  btnPrimary: {
    width: "100%", marginTop: 22, padding: "15px",
    background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800,
    color: "#fff", cursor: "pointer", letterSpacing: 1,
    transition: "opacity .15s, transform .1s",
    boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
  },
  btnSecondary: {
    padding: "10px 22px", background: "transparent", border: "1.5px solid #bae6fd",
    borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#0369a1",
    cursor: "pointer", transition: "border-color .2s, color .2s",
  },
  error: {
    marginTop: 12, padding: "10px 16px", background: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#ef4444",
  },
  ideaMeta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 20 },
  metaItem: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px" },
  metaLabel: { fontSize: 10, letterSpacing: 2, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 4 },
  metaValue: { fontSize: 13, color: "#0f172a", fontWeight: 600, lineHeight: 1.5 },
  fullField: { background: "#f0f9ff", border: "1px solid #e0f2fe", borderRadius: 8, padding: "12px 16px", marginBottom: 10 },
  criteriaBlock: { marginBottom: 18 },
  criteriaHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  criteriaLabel: { fontWeight: 800, fontSize: 14, color: "#0f172a" },
  criteriaDesc: { fontSize: 11, color: "#64748b", marginBottom: 10 },
  optionRow: { display: "flex", gap: 8, width: "100%" },
  optionBtn: (selected: boolean) => ({
    flex: 1, padding: "10px 8px", borderRadius: 8,
    border: selected ? "2px solid #0ea5e9" : "1.5px solid #bae6fd",
    background: selected ? "#e0f2fe" : "#f8fafc",
    color: selected ? "#0284c7" : "#64748b",
    fontSize: 12, fontWeight: selected ? 800 : 700, cursor: "pointer",
    transition: "all .15s", textAlign: "center" as const,
    boxShadow: selected ? "0 0 0 1px #0ea5e9 inset, 0 2px 12px rgba(14,165,233,0.18)" : "none",
    lineHeight: 1.4, fontFamily: "'Nunito', sans-serif",
  }),
  scoreTotal: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "1.5px solid #bae6fd", borderRadius: 10, marginBottom: 20, marginTop: 4,
  },
  scoreBig: (val: number) => ({
    fontSize: 32, fontWeight: 900,
    color: val >= GOODJOB_THRESHOLD ? "#16a34a" : val >= 3 ? "#d97706" : "#ef4444",
  }),
  checkboxRow: { display: "flex", gap: 12, marginBottom: 24 },
  checkCard: (active: boolean, color: string) => ({
    flex: 1, padding: "14px 18px", borderRadius: 10,
    border: active ? `2px solid ${color}` : "1.5px solid #bae6fd",
    background: active ? (color === "#16a34a" ? "#f0fdf4" : "#eff6ff") : "#f8fafc",
    cursor: "pointer", transition: "all .2s", textAlign: "center" as const,
    boxShadow: active ? `0 4px 14px ${color}30` : "none",
  }),
  progress: { 
  width: "100%", 
  maxWidth: 800, 
  marginBottom: 20,
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(8px)",
  borderRadius: 10,
  padding: "8px 12px",
},
  progressBar: { height: 4, background: "#bae6fd", borderRadius: 99, overflow: "hidden", marginTop: 8 },
  progressFill: (pct: number) => ({
    height: "100%", width: `${pct}%`,
    background: "linear-gradient(90deg, #38bdf8, #818cf8)",
    borderRadius: 99, transition: "width .4s ease",
  }),
  done: { textAlign: "center" as const, padding: "60px 40px" },
  feedbackBox: {
    width: "100%", background: "#f0f9ff", border: "1.5px solid #bae6fd",
    borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#0f172a",
    fontFamily: "'Nunito', sans-serif", lineHeight: 1.7,
    resize: "vertical" as const, minHeight: 100, outline: "none",
    boxSizing: "border-box" as const, transition: "border-color .2s",
  },
};

export default function App() {
  const [step, setStep]             = useState("login");
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [reviewer, setReviewer]     = useState<any>(null);
  const [ideas, setIdeas]           = useState<any[]>([]);
  const [current, setCurrent]       = useState(0);
  const [scores, setScores]         = useState<Record<string, number | null>>({});
  const [goodJob, setGoodJob]       = useState(false);
  const [baoVe, setBaoVe]           = useState(false);
  const [feedback, setFeedback]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [preview, setPreview]       = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAssigner, setIsAssigner] = useState(false);
  const [mySheetUrl, setMySheetUrl] = useState<string | null>(null);

  const [unassignedIdeas, setUnassignedIdeas] = useState<any[]>([]);
  const [myAssignees, setMyAssignees] = useState<string[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assignmentStats, setAssignmentStats] = useState<Record<string, number>>({});

  const [adminPin, setAdminPin]           = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [newYD, setNewYD]                 = useState("");
  const [newName, setNewName]             = useState("");
  const [adminError, setAdminError]       = useState("");
  const [reviewerList, setReviewerList]   = useState<{ reviewerId: string; name: string }[]>(() => loadReviewers());
  const [assignerList, setAssignerList]   = useState<Assigner[]>(() => loadAssigners());
  const [adminTab, setAdminTab]           = useState<"reviewers" | "assigners">("reviewers");
  const [newAssignerYD, setNewAssignerYD] = useState("");
  const [selectedAdminAssignees, setSelectedAdminAssignees] = useState<string[]>([]);

  useEffect(() => {
    if (!ideas[current]) return;
    const idea = ideas[current];
    setScores({
      scoreN: idea.scoreN !== "" ? idea.scoreN : null,
      scoreO: idea.scoreO !== "" ? idea.scoreO : null,
      scoreP: idea.scoreP !== "" ? idea.scoreP : null,
      scoreQ: idea.scoreQ !== "" ? idea.scoreQ : null,
    });
    setGoodJob(idea.goodJob || false);
    setBaoVe(idea.baoVe || false);
    setFeedback(idea.feedback || "");
  }, [current, ideas]);

  useEffect(() => {
  if (!reviewer || step !== "scoring" || !ideas[current]) return;
  const hasScores = Object.values(scores).some(s => s !== null && s !== undefined);
  if (!hasScores) return;

  const idea = ideas[current]; // ← phải có dòng này TRƯỚC khi dùng idea
  const progress: Progress = {
    reviewerId: reviewer.reviewerId,
    currentIndex: current,
    currentIdeaKey: `${idea.sheetName}_${idea.rowIndex}`,
    scores: { ...scores, goodJob, baoVe, feedback },
    savedAt: new Date().toISOString(),
  };
  saveProgress(progress);
}, [scores, goodJob, baoVe, feedback, current, reviewer, step, ideas]);

  const totalScore = CRITERIA.reduce((s, c) => s + (scores[c.key] ?? 0), 0);
  const allScored  = CRITERIA.every((c) => scores[c.key] !== null && scores[c.key] !== undefined);

  useEffect(() => {
    if (allScored) setGoodJob(totalScore >= GOODJOB_THRESHOLD);
  }, [totalScore, allScored]);

  const handleVerify = async () => {
    if (!reviewerId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get({ action: "verifyReviewer", reviewerId: reviewerId.trim() });
      if (res.ok) {
        setPreview(res);
        setIsAssigner(res.isAssigner || false);
      } else {
        setError(res.error || "Mã không hợp lệ");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const handleStart = async () => {
  setLoading(true);
  setLoadingIdeas(true);  // ← thêm
  setError("");
  try {
    const res = await api.get({ action: "getIdeas", reviewerId: preview.reviewerId });
    if (res.ok) {
      setReviewer(preview);
      setIdeas(res.ideas);
      if (res.sheetUrl) setMySheetUrl(res.sheetUrl);
      setIsAssigner(res.isAssigner || false);
      const savedProgress = loadProgress(preview.reviewerId);
      if (savedProgress && res.ideas.length > 0) {
        if (savedProgress.currentIdeaKey) {
          const idx = res.ideas.findIndex(
            idea => `${idea.sheetName}_${idea.rowIndex}` === savedProgress.currentIdeaKey
          );
          setCurrent(idx >= 0 ? idx : 0);
        } else {
          setCurrent(Math.min(savedProgress.currentIndex, res.ideas.length - 1));
        }
      } else {
        setCurrent(0);
      }
      setStep(res.ideas.length === 0 ? "done" : "scoring");
    } else {
      setError(res.error || "Không lấy được dữ liệu");
    }
  } catch {
    setError("Lỗi kết nối.");
  }
  setLoading(false);
  setLoadingIdeas(false);  // ← thêm
};

  const handleAdminUnlock = () => {
    if (adminPin === ADMIN_PIN) { setAdminUnlocked(true); setAdminError(""); }
    else setAdminError("Mã PIN không đúng");
  };

  const handleAddReviewer = () => {
    const yd = newYD.trim().toUpperCase();
    if (!yd || !newName.trim()) { setAdminError("Vui lòng nhập đủ Mã YD và Tên."); return; }
    if (reviewerList.some(r => r.reviewerId === yd)) { setAdminError("Mã YD này đã tồn tại."); return; }
    const updated = [...reviewerList, { reviewerId: yd, name: newName.trim() }];
    setReviewerList(updated);
    saveReviewers(updated);
    setNewYD(""); setNewName(""); setAdminError("");
  };

  const handleDeleteReviewer = (ydCode: string) => {
    const updated = reviewerList.filter(r => r.reviewerId !== ydCode);
    setReviewerList(updated);
    saveReviewers(updated);
  };

  const handleAddAssigner = () => {
    const yd = newAssignerYD.trim().toUpperCase();
    if (!yd) { setAdminError("Vui lòng chọn Mã YD."); return; }
    if (selectedAdminAssignees.length === 0) { setAdminError("Vui lòng chọn ít nhất 1 người được phân công."); return; }
    if (assignerList.some(a => a.reviewerId === yd)) { setAdminError("Người này đã là người phân công."); return; }
    const rev = reviewerList.find(r => r.reviewerId === yd);
    if (!rev) { setAdminError("Mã YD không tồn tại trong danh sách thành viên."); return; }
    const updated = [...assignerList, { reviewerId: yd, name: rev.name, assignees: selectedAdminAssignees }];
    setAssignerList(updated);
    saveAssigners(updated);
    setNewAssignerYD(""); setSelectedAdminAssignees([]); setAdminError("");
  };

  const handleDeleteAssigner = (ydCode: string) => {
    const updated = assignerList.filter(a => a.reviewerId !== ydCode);
    setAssignerList(updated);
    saveAssigners(updated);
  };

  const toggleAssignee = (ydCode: string) => {
    if (selectedAdminAssignees.includes(ydCode)) {
      setSelectedAdminAssignees(selectedAdminAssignees.filter(id => id !== ydCode));
    } else {
      setSelectedAdminAssignees([...selectedAdminAssignees, ydCode]);
    }
  };

  const exitAdmin = () => {
    setStep("login"); setAdminPin(""); setAdminUnlocked(false); setAdminError("");
    setNewYD(""); setNewName(""); setAdminTab("reviewers");
    setNewAssignerYD(""); setSelectedAdminAssignees([]);
  };

  const handleGoToAssign = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get({ action: "getUnassignedIdeas", reviewerId: preview.reviewerId });
      if (res.ok) {
        setUnassignedIdeas(res.ideas);
        const assigners = loadAssigners();
        const assigner = assigners.find(a => a.reviewerId === preview.reviewerId);
        setMyAssignees(assigner?.assignees || []);
        setReviewer(preview);
        const assignments = loadAssignments();
        const completed = loadCompletedIdeas();
        const stats: Record<string, number> = {};
        (assigner?.assignees || []).forEach(assigneeId => {
          stats[assigneeId] = assignments.filter(a =>
            a.assignedTo === assigneeId && a.assignedBy === preview.reviewerId && !completed.includes(a.ideaKey)
          ).length;
        });
        setAssignmentStats(stats);
        setStep("assign");
      } else { setError("Không lấy được danh sách sáng kiến"); }
    } catch { setError("Lỗi kết nối"); }
    setLoading(false);
  };

  const handleAssignIdea = async () => {
    if (selectedIdeas.length === 0 || !selectedAssignee) {
      setError("Vui lòng chọn ít nhất 1 sáng kiến và 1 người được phân công"); return;
    }
    setLoading(true); setError("");
    try {
      for (const idea of selectedIdeas) {
        const ideaKey = `${idea.sheetName}_${idea.rowIndex}`;
        await api.post({ action: "assignIdea", ideaKey, assignedTo: selectedAssignee, assignedBy: reviewer.reviewerId });
      }
      setUnassignedIdeas(unassignedIdeas.filter(i => !selectedIdeas.includes(i)));
      setAssignmentStats(prev => ({ ...prev, [selectedAssignee]: (prev[selectedAssignee] || 0) + selectedIdeas.length }));
      setSelectedIdeas([]); setSelectedAssignee("");
    } catch { setError("Lỗi kết nối"); }
    setLoading(false);
  };

  const toggleIdeaSelection = (idea: any) => {
    if (selectedIdeas.includes(idea)) setSelectedIdeas(selectedIdeas.filter(i => i !== idea));
    else setSelectedIdeas([...selectedIdeas, idea]);
  };

  const pct = ideas.length ? Math.round((current / ideas.length) * 100) : 0;

  const handleSubmitScore = async () => {
    if (!allScored) { setError("Vui lòng chấm đủ 4 tiêu chí."); return; }
    setSubmitting(true); setError("");
    const idea = ideas[current];
    try {
      const res = await api.post({
        action: "submitScore",
        sheetName: idea.sheetName, rowIndex: idea.rowIndex,
        reviewerId: reviewer.reviewerId,
        scoreN: scores.scoreN, scoreO: scores.scoreO, scoreP: scores.scoreP, scoreQ: scores.scoreQ,
        goodJob, baoVe, feedback, reviewerName: reviewer.name,
      });
      if (res.ok) {
        if (current + 1 >= ideas.length) { clearProgress(reviewer.reviewerId); setStep("done"); }
        else { setCurrent((c) => c + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
      } else { setError(res.error || "Lỗi khi lưu điểm."); }
    } catch { setError("Lỗi kết nối khi lưu."); }
    setSubmitting(false);
  };

  return (
    <div style={S.page}>
      <style>{`
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
  }
  @keyframes shimmer {
    0% { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
`}</style>
      <div style={S.topBar}>
        <span style={S.logo}>Chấm sáng kiến Hò Yo Ta</span>
        {reviewer ? (
          <span style={S.badge}>{reviewer.name} · {reviewer.reviewerId}</span>
        ) : step === "login" ? (
          <button title="Quản lý danh sách Mã YD" onClick={() => setStep("admin")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8", padding: 4, lineHeight: 1 }}>⚙️</button>
        ) : null}
      </div>
      {/* ══ LOGIN ══ */}
      {step === "login" && !loadingIdeas && (
        <div style={{ ...S.card, maxWidth: 480 }}>
          <h1 style={{ ...S.h1, textAlign: "center" }}>Chào mừng anh chị ☀️</h1>
          <p style={{ ...S.sub, textAlign: "center" }}>Nhập mã YD để bắt đầu chấm điểm sáng kiến</p>
          <label style={S.label}>Mã YD</label>
          <input ref={inputRef} style={{ ...S.input, opacity: loading ? 0.6 : 1 }}
            disabled={loading}
            value={reviewerId}
            onChange={(e) => { setReviewerId(e.target.value); setPreview(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
            onBlur={(e) => (e.target.style.borderColor = "#bae6fd")}
            maxLength={10} />
          {preview && (
            <div style={S.namePreview}>
              <span>✓</span><span>{preview.name}</span>
              <span style={{ marginLeft: "auto", color: "#6ee7b7", fontSize: 11 }}>
                {preview.pendingCount > 0 ? `${preview.pendingCount} sáng kiến chưa chấm` : "Đã hoàn tất chấm sáng kiến"}
              </span>
            </div>
          )}
          {error && <div style={S.error}>{error}</div>}
          {!preview ? (
            <button style={S.btnPrimary} onClick={handleVerify} disabled={loading || !reviewerId.trim()}
              onMouseOver={(e) => ((e.target as HTMLButtonElement).style.opacity = "0.85")}
              onMouseOut={(e) => ((e.target as HTMLButtonElement).style.opacity = "1")}>
              {loading ? <><span className="spinner"/><span>Đang xác nhận...</span></> : "Xác nhận mã →"}
            </button>
          ) : (
            <>
              <button style={S.btnPrimary} onClick={handleStart} disabled={loading}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.opacity = "0.85")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.opacity = "1")}>
                {loading ? "Đang tải sáng kiến..." : "Bắt đầu chấm điểm →"}
              </button>
              {preview.isAssigner && (
                <button style={{ ...S.btnSecondary, width: "100%", marginTop: 12, padding: "12px" }}
                  onClick={handleGoToAssign} disabled={loading}>
                  📋 Phân công sáng kiến
                </button>
              )}
            </>
          )}
        </div>
      )}
{/* ══ SKELETON LOADING ══ */}
{loadingIdeas && preview?.pendingCount > 0 && (

  <>
    {/* Progress bar skeleton */}
    <div style={{ width: "100%", maxWidth: 800, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="skeleton" style={{ width: 120, height: 14 }} />
        <div className="skeleton" style={{ width: 80, height: 14 }} />
      </div>
      <div className="skeleton" style={{ height: 4, borderRadius: 99 }} />
    </div>

    {/* Card info skeleton */}
    <div style={{ ...S.card, background: "rgba(255,255,255,0.75)" }}>
      <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: "85%", height: 24, marginBottom: 20 }} />
      <div style={{ height: 1, background: "#bae6fd", margin: "0 0 16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />
        ))}
      </div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton" style={{ height: 70, marginBottom: 10, borderRadius: 8 }} />
      ))}
    </div>

    {/* Card scoring skeleton */}
    <div style={{ ...S.card, background: "rgba(255,255,255,0.75)" }}>
      <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 24 }} />
      {[1,2,3,4].map(i => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div className="skeleton" style={{ width: "40%", height: 16, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3].map(j => (
              <div key={j} className="skeleton" style={{ flex: 1, height: 44, borderRadius: 8 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
)}
{/* ══ SIMPLE LOADING — khi đã hoàn tất ══ */}
{loadingIdeas && (preview?.pendingCount === 0 || !preview) && (
  <div style={{ ...S.card, maxWidth: 480, textAlign: "center" as const, padding: "48px 40px" }}>
    <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3, margin: "0 auto 16px", display: "block" }} />
    <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Đang tải...</p>
  </div>
)}
      {/* ══ SCORING ══ */}
      {step === "scoring" && ideas[current] && (() => {
        const idea = ideas[current];
        return (
          <>
            <div style={S.progress}>
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", fontWeight: 700,
    textShadow: "0 0 6px #fff, 0 0 6px #fff, 0 0 6px #fff" }}>
    <span>SÁNG KIẾN {current + 1} / {ideas.length}</span>
    <span>{pct}% hoàn thành</span>
  </div>

  {/*<div style={{ position: "relative", marginTop: 16 }}>
    <img
  src={boatImage}
  style={{
    position: "absolute",
    bottom: -50,
    left: `${pct}%`,
    transform: `translateX(-${pct * 0.5}px)`,   // ← bù trừ theo %
    width: 120,
    height: 120,
    objectFit: "contain",
    transition: "left 0.4s ease, transform 0.4s ease",
    pointerEvents: "none",
    zIndex: 2,
  */}
    <div style={{ ...S.progressBar, marginTop: 0 }}>
      <div style={S.progressFill(pct)} />
    </div>
  </div>
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{idea.sheetName}</div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, lineHeight: 1.3, color: "#0f172a" }}>{idea.tenYT || "(Chưa có tên)"}</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, letterSpacing: 2, textTransform: "uppercase" }}>Mã NV</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0369a1" }}>{idea.maNV}</div>
                </div>
              </div>
              <div style={{ height: 1, background: "#bae6fd", margin: "16px 0" }} />
              <div style={S.ideaMeta}>
                {[["Level ý tưởng", idea.level], ["Thử nghiệm chưa", idea.thuNghiem], ["Phòng ban liên quan", idea.pbLienQuan], ["Vùng/Phòng ban", idea.vungPB]].map(([l, v]) => (
                  <div key={l} style={S.metaItem}><div style={S.metaLabel}>{l}</div><div style={S.metaValue}>{v || "—"}</div></div>
                ))}
              </div>
              {[["Vấn đề hiện tại", idea.vanDe], ["Mô tả ý tưởng", idea.moTa], ["Hiệu quả dự kiến", idea.hieuQua], ["Nguồn lực cần thiết", idea.nguonLuc], ["Giá trị mang lại", idea.giaTri]].map(([l, v]) => v ? (
                <div key={l} style={S.fullField}><div style={S.metaLabel}>{l}</div><div style={{ ...S.metaValue, fontSize: 13, lineHeight: 1.7 }}>{v}</div></div>
              ) : null)}
               {/*idea.link && <a href={idea.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 4, fontSize: 12, color: "#0ea5e9", fontWeight: 700 }}>🔗 Xem tài liệu đính kèm</a>*/}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#64748b", textTransform: "uppercase", marginBottom: 20 }}>Chấm điểm</div>
              {CRITERIA.map((c) => (
                <div key={c.key} style={S.criteriaBlock}>
                  <div style={S.criteriaHeader}>
                    <span style={S.criteriaLabel}>{c.label}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>tối đa {c.max} điểm</span>
                  </div>
                  <div style={S.criteriaDesc}>{c.desc}</div>
                  <div style={S.optionRow}>
                    {c.options.map((opt) => (
                      <button key={opt.val} style={S.optionBtn(scores[c.key] === opt.val)} onClick={() => setScores((s) => ({ ...s, [c.key]: opt.val }))}>{opt.label}</button>
                    ))}
                  </div>
                  {c.key !== "scoreQ" && <div style={{ height: 1, background: "#e0f2fe", margin: "16px 0" }} />}
                </div>
              ))}
              <div style={S.scoreTotal}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748b", textTransform: "uppercase" }}>Tổng điểm</div>
                  {allScored && totalScore >= GOODJOB_THRESHOLD && <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2, fontWeight: 700 }}>✓ Đủ điều kiện GOOD JOB</div>}
                </div>
                <span style={S.scoreBig(totalScore)}>{allScored ? totalScore : "—"}</span>
              </div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Kết luận</div>
              <div style={S.checkboxRow}>
                <div style={S.checkCard(goodJob, "#16a34a")} onClick={() => setGoodJob((v) => !v)}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{goodJob ? "✅" : "⬜"}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: goodJob ? "#16a34a" : "#64748b" }}>GOOD JOB</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>≥ 7 điểm</div>
                </div>
                <div style={S.checkCard(baoVe, "#3b82f6")} onClick={() => setBaoVe((v) => !v)}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{baoVe ? "✅" : "⬜"}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: baoVe ? "#3b82f6" : "#64748b" }}>VÀO VÒNG BẢO VỆ</div>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>Đóng góp — Hướng dẫn thêm hoàn thiện</div>
                <textarea style={S.feedbackBox} placeholder="Nhận xét, góp ý hoặc hướng dẫn cụ thể để hoàn thiện sáng kiến..."
                  value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                  onBlur={(e) => (e.target.style.borderColor = "#bae6fd")} rows={4} />
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button style={{ ...S.btnPrimary, opacity: (!allScored || submitting) ? 0.4 : 1 }}
                onClick={handleSubmitScore} disabled={!allScored || submitting}>
                {submitting ? "Đang lưu..." : current + 1 >= ideas.length ? "Lưu & Hoàn tất ✓" : `Lưu & Chuyển sang sáng kiến ${current + 2} →`}
              </button>
            </div>
          </>
        );
      })()}

      {/* ══ ADMIN ══ */}
      {step === "admin" && (
        <div style={{ ...S.card, maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ ...S.h1, margin: 0, fontSize: 20 }}>⚙️ Quản lý hệ thống</h2>
            <button onClick={exitAdmin} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 700 }}>← Quay lại</button>
          </div>
          {!adminUnlocked ? (
            <>
              <p style={{ ...S.sub, marginBottom: 16 }}>Nhập mã PIN quản trị để tiếp tục</p>
              <label style={S.label}>Mã PIN</label>
              <input style={S.input} type="password" placeholder="••••" value={adminPin}
                onChange={e => { setAdminPin(e.target.value); setAdminError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminUnlock()} maxLength={8} />
              {adminError && <div style={S.error}>{adminError}</div>}
              <button style={S.btnPrimary} onClick={handleAdminUnlock}>Xác nhận PIN →</button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #bae6fd", paddingBottom: 2 }}>
                {(["reviewers", "assigners"] as const).map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)} style={{
                    background: adminTab === tab ? "#e0f2fe" : "transparent", border: "none",
                    borderBottom: adminTab === tab ? "2px solid #0ea5e9" : "2px solid transparent",
                    padding: "8px 16px", fontSize: 13, fontWeight: 700,
                    color: adminTab === tab ? "#0369a1" : "#64748b", cursor: "pointer",
                  }}>
                    {tab === "reviewers" ? "Thành viên" : "Người phân công"}
                  </button>
                ))}
              </div>
              {adminTab === "reviewers" ? (
                <>
                  <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "20px 20px 16px", marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#0369a1", textTransform: "uppercase" as const, marginBottom: 14 }}>Thêm thành viên mới</div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" as const }}>
                      <input style={{ ...S.input, flex: "0 0 130px", margin: 0 }} placeholder="Mã YD" value={newYD}
                        onChange={e => { setNewYD(e.target.value); setAdminError(""); }} maxLength={10} />
                      <input style={{ ...S.input, flex: 1, minWidth: 160, margin: 0 }} placeholder="Họ và tên" value={newName}
                        onChange={e => { setNewName(e.target.value); setAdminError(""); }}
                        onKeyDown={e => e.key === "Enter" && handleAddReviewer()} />
                      <button style={{ ...S.btnPrimary, margin: 0, padding: "0 20px", height: 44, whiteSpace: "nowrap" as const }} onClick={handleAddReviewer}>+ Thêm</button>
                    </div>
                    {adminError && <div style={{ ...S.error, margin: 0 }}>{adminError}</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 12 }}>Danh sách ({reviewerList.length} thành viên)</div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {reviewerList.map(r => (
                      <div key={r.reviewerId} style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px" }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#0369a1", minWidth: 90 }}>{r.reviewerId}</span>
                        <span style={{ flex: 1, fontSize: 14, color: "#0f172a" }}>{r.name}</span>
                        <button onClick={() => handleDeleteReviewer(r.reviewerId)}
                          style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 10px" }}>Xóa</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 12, padding: "20px 20px 16px", marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#0369a1", textTransform: "uppercase" as const, marginBottom: 14 }}>Thêm người phân công</div>
                    <label style={{ ...S.label, marginBottom: 8 }}>Chọn Mã YD</label>
                    <select style={{ ...S.input, margin: "0 0 14px" }} value={newAssignerYD} onChange={e => { setNewAssignerYD(e.target.value); setAdminError(""); }}>
                      <option value="">-- Chọn --</option>
                      {reviewerList.map(r => <option key={r.reviewerId} value={r.reviewerId}>{r.reviewerId} - {r.name}</option>)}
                    </select>
                    <label style={{ ...S.label, marginBottom: 8 }}>Chọn nhóm được phân công</label>
                    <div style={{ maxHeight: 200, overflowY: "auto", border: "1.5px solid #bae6fd", borderRadius: 8, padding: 10, background: "#fff", marginBottom: 10 }}>
                      {reviewerList.filter(r => r.reviewerId !== newAssignerYD).map(r => (
                        <div key={r.reviewerId} onClick={() => toggleAssignee(r.reviewerId)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6,
                            background: selectedAdminAssignees.includes(r.reviewerId) ? "#e0f2fe" : "#f8fafc", cursor: "pointer", marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{selectedAdminAssignees.includes(r.reviewerId) ? "✅" : "⬜"}</span>
                          <span style={{ fontWeight: 700, fontSize: 12, color: "#0369a1", minWidth: 70 }}>{r.reviewerId}</span>
                          <span style={{ fontSize: 13, color: "#0f172a" }}>{r.name}</span>
                        </div>
                      ))}
                    </div>
                    <button style={{ ...S.btnPrimary, margin: 0 }} onClick={handleAddAssigner}>+ Thêm người phân công</button>
                    {adminError && <div style={{ ...S.error, marginTop: 10 }}>{adminError}</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 12 }}>Danh sách người phân công ({assignerList.length})</div>
                  {assignerList.length === 0
                    ? <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" as const, padding: "20px 0" }}>Chưa có người phân công nào</p>
                    : <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                        {assignerList.map(a => (
                          <div key={a.reviewerId} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 13, color: "#0369a1", minWidth: 90 }}>{a.reviewerId}</span>
                              <span style={{ flex: 1, fontSize: 14, color: "#0f172a", fontWeight: 700 }}>{a.name}</span>
                              <button onClick={() => handleDeleteAssigner(a.reviewerId)}
                                style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 10px" }}>Xóa</button>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Nhóm được phân công:</div>
                            <div style={{ fontSize: 12, color: "#0f172a" }}>
                              {a.assignees.map(yd => { const rv = reviewerList.find(r => r.reviewerId === yd); return rv ? `${yd} (${rv.name})` : yd; }).join(", ")}
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </>
              )}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #bae6fd", fontSize: 11, color: "#94a3b8", textAlign: "center" as const }}>
                Danh sách được lưu tự động trong trình duyệt này
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ ASSIGN ══ */}
      {step === "assign" && (
        <div style={{ ...S.card, maxWidth: 800 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ ...S.h1, margin: 0, fontSize: 20 }}>📋 Phân công sáng kiến</h2>
            <button onClick={() => { setStep("login"); setUnassignedIdeas([]); setSelectedIdeas([]); setSelectedAssignee(""); setAssignmentStats({}); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 700 }}>← Quay lại</button>
          </div>
          <p style={{ ...S.sub, marginBottom: 24 }}>Chọn nhiều sáng kiến cùng lúc và phân công cho 1 thành viên trong nhóm.</p>
          {myAssignees.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#16a34a", textTransform: "uppercase" as const, marginBottom: 12 }}>📊 Tổng quan phân công</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {myAssignees.map(yd => {
                  const rv = DEFAULT_REVIEWERS.find(r => r.reviewerId === yd);
                  const count = assignmentStats[yd] || 0;
                  return (
                    <div key={yd} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>{yd}</div><div style={{ fontSize: 12, color: "#0f172a", marginTop: 2 }}>{rv?.name}</div></div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: count > 0 ? "#16a34a" : "#94a3b8" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {unassignedIdeas.length === 0 ? (
            <div style={{ textAlign: "center" as const, padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ color: "#64748b", fontSize: 14 }}>Tất cả sáng kiến đã được phân công</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" as const }}>
                  Sáng kiến chưa phân công ({unassignedIdeas.length})
                </div>
                <button onClick={() => setSelectedIdeas(selectedIdeas.length === unassignedIdeas.length ? [] : [...unassignedIdeas])}
                  style={{ background: "none", border: "1px solid #bae6fd", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#0369a1", fontWeight: 700, cursor: "pointer" }}>
                  {selectedIdeas.length === unassignedIdeas.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
                {unassignedIdeas.map((idea, idx) => {
                  const isSelected = selectedIdeas.includes(idea);
                  return (
                    <div key={idx} onClick={() => toggleIdeaSelection(idea)}
                      style={{ padding: "12px 16px", background: isSelected ? "#e0f2fe" : "#f8fafc", border: isSelected ? "2px solid #0ea5e9" : "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{isSelected ? "✅" : "⬜"}</span>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", flex: 1 }}>{idea.tenYT || "(Chưa có tên)"}</span>
                        <span style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>{idea.sheetName}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginLeft: 28 }}>Mã NV: {idea.maNV} · {idea.level}</div>
                    </div>
                  );
                })}
              </div>
              {selectedIdeas.length > 0 && (
                <>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 4 }}>Đã chọn {selectedIdeas.length} sáng kiến:</div>
                    <div style={{ fontSize: 12, color: "#0f172a" }}>{selectedIdeas.map(idea => idea.tenYT || "(Chưa có tên)").join(", ")}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 12 }}>Chọn người được phân công</div>
                  <select style={{ ...S.input, marginBottom: 20 }} value={selectedAssignee} onChange={e => { setSelectedAssignee(e.target.value); setError(""); }}>
                    <option value="">-- Chọn thành viên --</option>
                    {myAssignees.map(yd => {
                      const rv = DEFAULT_REVIEWERS.find(r => r.reviewerId === yd);
                      const count = assignmentStats[yd] || 0;
                      return <option key={yd} value={yd}>{yd} - {rv?.name || ""} {count > 0 ? `(đã có ${count} sáng kiến)` : ""}</option>;
                    })}
                  </select>
                  {error && <div style={S.error}>{error}</div>}
                  <button style={{ ...S.btnPrimary, opacity: !selectedAssignee || loading ? 0.4 : 1 }}
                    onClick={handleAssignIdea} disabled={!selectedAssignee || loading}>
                    {loading ? "Đang phân công..." : selectedAssignee
                      ? `✓ Phân công ${selectedIdeas.length} sáng kiến cho ${DEFAULT_REVIEWERS.find(r => r.reviewerId === selectedAssignee)?.name || selectedAssignee}`
                      : "✓ Phân công"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ DONE ══ */}
{step === "done" && (
  <div style={{ ...S.card, ...S.done }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
    <h2 style={{ ...S.h1, fontSize: 22 }}>Hoàn tất chấm điểm!</h2>
    <p style={{ color: "#64748b", fontSize: 14, margin: "8px 0 28px" }}>
      {ideas.length > 0 ? `Đã chấm ${ideas.length} sáng kiến. Kết quả đã được lưu.` : "Hiện không có sáng kiến nào cần chấm."}
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <button style={{ ...S.btnSecondary, padding: "12px 28px" }}
        onClick={() => { setStep("login"); setPreview(null); setReviewerId(""); setIdeas([]); setReviewer(null); setAssignmentStats({}); setSelectedIdeas([]); setSelectedAssignee(""); }}>
        ← Quay lại trang chủ
      </button>
      <a href={PROGRESS_TRACKING_URL} target="_blank" rel="noreferrer"
        style={{ ...S.btnPrimary, padding: "12px 28px", textDecoration: "none", display: "inline-block" }}>
        📊 Theo dõi tiến độ chấm
      </a>
      {mySheetUrl && (
  <a href={mySheetUrl} target="_blank" rel="noreferrer"
    style={{
      ...S.btnPrimary,
      padding: "12px 28px",
      textDecoration: "none",
      display: "inline-block",
      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      width: "100%",
      textAlign: "center",
      boxSizing: "border-box",
    }}>
    📄 Xem sheet chấm của tôi
  </a>
)}
    </div>
  </div>
)}
</div>
  );
}