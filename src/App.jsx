import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import About from "./Pages/About";
import Contact from "./Pages/contact";
import LoginPage from "./Pages/LoginPage";
import CSignupPage from "./Pages/CSignupPage";
import WSignupPage from "./Pages/WSignupPage";
import WorkerProfile from "./Pages/WorkerProfile";
import PublicWorkerProfile from "./Pages/PublicWorkerProfile";
import WorkerProfileCards from "./Pages/WorkerProfileCards";
import AdminDashboard from "./Pages/AdminDashboard";
import Chatbot2 from "./Pages/Chatbot2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<CSignupPage />} />
        <Route path="/become-artisan" element={<WSignupPage />} />
        {/* Worker's personal home dashboard */}
        <Route path="/worker-profile" element={<WorkerProfile />} />
        {/* Customer-facing public profile with reviews */}
        <Route path="/worker/:id" element={<PublicWorkerProfile />} />
        <Route path="/worker-cards" element={<WorkerProfileCards />} />
        <Route path="/chatbot" element={<Chatbot2 />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/chatbot2" element={<Chatbot2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
