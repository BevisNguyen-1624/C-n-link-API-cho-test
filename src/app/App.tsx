import ScoringApp from "../imports/pasted_text/api-helpers";
// handleVerify — thay catch block
catch (err: any) {
  setError("Lỗi kết nối: " + (err?.message || String(err)));
}

// handleStart — thay catch block  
catch (err: any) {
  setError("Lỗi kết nối: " + (err?.message || String(err)));
}
// trong handleVerify, sau khi có res:
if (res.ok) {
  setPreview(res);
  setIsAssigner(res.isAssigner || false);
} else {
  // Hiển thị hint nếu có
  setError(res.hint || res.error || "Mã không hợp lệ");
}
export default function App() {
  return <ScoringApp />;
}