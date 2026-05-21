import ScoringApp from "../imports/pasted_text/api-helpers";
import { Routes, Route } from "react-router-dom";
import ScoringPage from "./pages/ScoringPage";   // trang chấm điểm hiện tại
import TrackingPage from "./pages/TrackingPage"; // trang theo dõi tiến độ
import AdminPage from "./pages/AdminPage";       // trang admin

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<ScoringPage />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/admin"    element={<AdminPage />} />
    </Routes>
  );
} 
export default function App() {
  return <ScoringApp />;
}