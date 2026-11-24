import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";

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
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<CSignupPage />} />
          <Route path="/become-artisan" element={<WSignupPage />} />

         
          <Route path="/worker-profile" element={<WorkerProfile />} />

          
          <Route path="/worker/:id" element={<PublicWorkerProfile />} />

          <Route path="/worker-cards" element={<WorkerProfileCards />} />
          <Route path="/chatbot" element={<Chatbot2 />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/chatbot2" element={<Chatbot2 />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
