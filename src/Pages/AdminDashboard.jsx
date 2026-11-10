import { useState, useEffect, useRef } from "react";
import { getAdminSession, adminLogin, adminLogout } from "../utils/auth";

export default function AdminDashboard() {

  const [adminUser, setAdminUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

 
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

 
  const [workerSubTab, setWorkerSubTab] = useState("all");

  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalWorkers: 0,
    pendingWorkers: 0,
    verifiedWorkers: 0,
    totalReviews: 0,
    totalReports: 0,
    pendingReports: 0,
  });

  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState("all");
  const [inspectReport, setInspectReport] = useState(null);
  const [reportActionLoading, setReportActionLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [notice, setNotice] = useState("");

  
  const [inspectWorker, setInspectWorker] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

 
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    skill: "Electrician",
    location: "Nsukka, Enugu",
    experience: "3+ years",
    about: "",
    working_hours: "08:00 - 18:00",
  });
  const [addProfilePhoto, setAddProfilePhoto] = useState(null);
  const [addPortfolioPhotos, setAddPortfolioPhotos] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  
  const [workerSearch, setWorkerSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

 
  useEffect(() => {
    async function checkAuth() {
      try {
        const admin = await getAdminSession();
        if (admin) {
          setAdminUser(admin);
          loadAllData();
        }
      } catch (err) {
        console.warn("Admin check notice:", err);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

 
  async function loadAllData() {
    try {
      setLoadingData(true);

      
      const statsRes = await fetch("http://localhost:5000/api/auth/stats", {
        credentials: "include",
      });
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }

     
      const workersRes = await fetch("http://localhost:5000/api/workers?all=true", {
        credentials: "include",
      });
      const workersData = await workersRes.json();
      if (workersData.success && Array.isArray(workersData.workers)) {
        setWorkers(workersData.workers);
      }

    
      const custRes = await fetch("http://localhost:5000/api/auth/customers", {
        credentials: "include",
      });
      const custData = await custRes.json();
      if (custData.success && Array.isArray(custData.customers)) {
        setCustomers(custData.customers);
      }

     
      const reportsRes = await fetch("http://localhost:5000/api/reports", {
        credentials: "include",
      });
      const reportsData = await reportsRes.json();
      if (reportsData.success && Array.isArray(reportsData.reports)) {
        setReports(reportsData.reports);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }

 
  async function handleAdminLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter your admin email and password.");
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError("");

      const data = await adminLogin(loginEmail, loginPassword);
      if (!data.success) {
        setLoginError(data.message || "Invalid admin credentials.");
        return;
      }

      setAdminUser(data.admin);
      loadAllData();
    } catch (err) {
      console.error("Admin login error:", err);
      setLoginError("Could not connect to server. Ensure backend is running.");
    } finally {
      setLoginLoading(false);
    }
  }

 
  async function handleAdminLogout() {
    await adminLogout();
    setAdminUser(null);
  }

 
  async function handleVerify(workerId, approved) {
    try {
      setVerifyLoading(true);
      const res = await fetch(`http://localhost:5000/api/workers/${workerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();

      if (data.success) {
        if (approved) {
          setWorkers((prev) =>
            prev.map((w) => (w.id === workerId ? { ...w, verified: true } : w))
          );
          setStats((prev) => ({
            ...prev,
            pendingWorkers: Math.max(0, prev.pendingWorkers - 1),
            verifiedWorkers: prev.verifiedWorkers + 1,
          }));
          setNotice("Worker approved! Profile is now publicly visible on the Chatbot.");
        } else {
          setWorkers((prev) => prev.filter((w) => w.id !== workerId));
          setStats((prev) => ({
            ...prev,
            totalWorkers: Math.max(0, prev.totalWorkers - 1),
            pendingWorkers: Math.max(0, prev.pendingWorkers - 1),
          }));
          setNotice("Worker application has been rejected and removed.");
        }
        setInspectWorker(null);
      } else {
        alert(data.message || "Failed to update verification status.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Network error during verification.");
    } finally {
      setVerifyLoading(false);
    }
  }

  

  async function handleToggleBan(workerId, newBannedStatus) {
    try {
      setReportActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/workers/${workerId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ banned: newBannedStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update worker ban status.");
        return;
      }


      
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, banned: newBannedStatus } : w))
      );

     

      if (inspectReport && inspectReport.worker && (inspectReport.worker.id === workerId || inspectReport.worker_id === workerId)) {
        setInspectReport((prev) => ({
          ...prev,
          worker: { ...(prev.worker || {}), banned: newBannedStatus },
        }));
      }

     

      setReports((prev) =>
        prev.map((r) =>
          r.worker_id === workerId
            ? { ...r, worker: { ...(r.worker || {}), banned: newBannedStatus } }
            : r
        )
      );

      setNotice(
        newBannedStatus
          ? "Artisan has been banned and immediately delisted from the chatbot and public search."
          : "Artisan ban has been lifted."
      );
    } catch (err) {
      console.error("Ban toggle error:", err);
      alert("Network error updating ban status.");
    } finally {
      setReportActionLoading(false);
    }
  }

 

  async function handleUpdateReport(reportId, status, notes = "") {
    try {
      setReportActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update report.");
        return;
      }

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, admin_notes: notes } : r))
      );

      setNotice(`Report #${reportId} has been marked as ${status}.`);
      setInspectReport(null);
    } catch (err) {
      console.error("Update report error:", err);
      alert("Network error updating report.");
    } finally {
      setReportActionLoading(false);
    }
  }



  async function handleAddWorkerSubmit(e) {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.skill || !addForm.location) {
      setAddError("Name, skill, and location are required.");
      return;
    }

    try {
      setAddLoading(true);
      setAddError("");
      setAddSuccess("");

      

      let profileImageUrl = "";
      if (addProfilePhoto) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(addProfilePhoto);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

        const uploadRes = await fetch("http://localhost:5000/api/workers/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            fileName: addProfilePhoto.name || "avatar.jpg",
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrl) {
          profileImageUrl = uploadData.imageUrl;
        }
      }

     

      const portfolioUrls = [];
      for (let i = 0; i < addPortfolioPhotos.length; i++) {
        const file = addPortfolioPhotos[i];
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

        const uploadRes = await fetch("http://localhost:5000/api/workers/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            fileName: file.name || `portfolio-${i}.jpg`,
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrl) {
          portfolioUrls.push(uploadData.imageUrl);
        }
      }

     

      const createRes = await fetch("http://localhost:5000/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: addForm.fullName.trim(),
          email: addForm.email.trim(),
          skill: addForm.skill,
          location: addForm.location,
          phone: addForm.phone,
          about: addForm.about,
          experience: addForm.experience,
          working_hours: addForm.working_hours,
          image: profileImageUrl,
          portfolio: portfolioUrls,
          verified: true, 
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        setAddError(createData.message || "Failed to add worker.");
        return;
      }

      

      setWorkers((prev) => [createData.worker, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalWorkers: prev.totalWorkers + 1,
        verifiedWorkers: prev.verifiedWorkers + 1,
      }));

      setAddSuccess(`Worker ${addForm.fullName} has been added and verified!`);
      setAddForm({
        fullName: "",
        email: "",
        phone: "",
        skill: "Electrician",
        location: "Nsukka, Enugu",
        experience: "3+ years",
        about: "",
        working_hours: "08:00 - 18:00",
      });
      setAddProfilePhoto(null);
      setAddPortfolioPhotos([]);

      setTimeout(() => {
        setAddSuccess("");
        setActiveTab("workers");
        setWorkerSubTab("approved");
      }, 1200);
    } catch (err) {
      console.error("Add worker error:", err);
      setAddError("Failed to add worker. Please check backend connection.");
    } finally {
      setAddLoading(false);
    }
  }

 
  const pendingWorkersList = workers.filter((w) => !w.verified);
  const approvedWorkersList = workers.filter((w) => w.verified);

  let displayedWorkers =
    workerSubTab === "pending"
      ? pendingWorkersList
      : workerSubTab === "approved"
        ? approvedWorkersList
        : workers;

  if (workerSearch.trim()) {
    const q = workerSearch.toLowerCase();
    displayedWorkers = displayedWorkers.filter(
      (w) =>
        (w.name || "").toLowerCase().includes(q) ||
        (w.skill || "").toLowerCase().includes(q) ||
        (w.location || "").toLowerCase().includes(q)
    );
  }

  const displayedCustomers = customerSearch.trim()
    ? customers.filter(
      (c) =>
        ((c.full_name || c.name || "")).toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(customerSearch.toLowerCase())
    )
    : customers;

 
  const pendingReportsList = reports.filter((r) => r.status === "pending");
  const resolvedReportsList = reports.filter((r) => r.status === "resolved");

  let displayedReports =
    reportFilter === "pending"
      ? pendingReportsList
      : reportFilter === "resolved"
        ? resolvedReportsList
        : reportFilter === "dismissed"
          ? reports.filter((r) => r.status === "dismissed")
          : reports;

 
  if (authChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f8" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Checking admin credentials…</p>
      </div>
    );
  }

 

  if (!adminUser) {
    return (
      <div className="admin-login-screen">
        <style>{`
          .admin-login-screen {
            min-height: 100vh;
            background: linear-gradient(135deg, #101432 0%, #1e264f 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: Arial, Helvetica, sans-serif;
          }
          .admin-login-card {
            background: #ffffff;
            width: 100%;
            max-width: 440px;
            border-radius: 16px;
            padding: 36px 32px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          }
          .admin-login-header {
            text-align: center;
            margin-bottom: 26px;
          }
          .admin-brand-icon {
            width: 52px;
            height: 52px;
            background: #f4510b;
            color: #fff;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 12px;
          }
          .admin-login-header h1 {
            margin: 0 0 6px;
            font-size: 24px;
            color: #101432;
          }
          .admin-login-header p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          .admin-login-field {
            margin-bottom: 18px;
          }
          .admin-login-field label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: #333;
            margin-bottom: 6px;
          }
          .admin-login-field input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #d2d6dc;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
            box-sizing: border-box;
          }
          .admin-login-field input:focus {
            border-color: #f4510b;
          }
          .admin-login-submit {
            width: 100%;
            padding: 13px;
            background: #f4510b;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 8px;
          }
          .admin-login-submit:hover {
            background: #d94206;
          }
          .admin-login-error {
            background: #fef3f2;
            color: #b42318;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 16px;
          }
        `}</style>
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-brand-icon">WC</span>
            <h1>WorkConnect Admin</h1>
            <p>Enter your administrator credentials to sign in</p>
          </div>

          {loginError && <div className="admin-login-error">{loginError}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="admin-login-field">
              <label>Admin Email</label>
              <input
                type="email"
                placeholder="admin@workconnect.ng"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-login-field">
              <label>Admin Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="admin-login-submit"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Authenticating…" : "Sign In to Admin Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

 

  return (
    <div className="admin-layout">
      <style>{`
        * { box-sizing: border-box; }
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: #f4f6f8;
          color: #101432;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ── Sidebar Styles (Matches Chatbot Sidebar Background #ff6a00) ── */
        .admin-sidebar {
          width: 260px;
          background: #ff6a00;
          border-right: 1px solid #ea580c;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.3s ease;
          z-index: 100;
        }

        .admin-sidebar-header {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .admin-sidebar-brand {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .admin-sidebar-badge {
          background: #ffffff;
          color: #ea580c;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          margin-left: 8px;
        }

        .admin-sidebar-nav {
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          border: none;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .admin-nav-item.active {
          background: #ffffff;
          color: #ea580c;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .admin-nav-pill {
          background: rgba(0, 0, 0, 0.18);
          color: #fff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .admin-nav-pill.warning {
          background: #ffffff;
          color: #ea580c;
        }

        .admin-sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-footer-logout {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .admin-footer-logout:hover {
          background: rgba(0, 0, 0, 0.25);
        }
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .admin-footer-logout:hover {
          background: rgba(255,255,255,0.1);
        }

        /* ── Main Content Area ─────────────────────────────────────── */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-y: auto;
        }

        .admin-topbar {
          background: #ffffff;
          padding: 16px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e9ee;
        }

        .admin-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #101432;
        }

        .admin-body {
          padding: 28px 30px;
          flex: 1;
        }

        /* ── Cards & Stats ─────────────────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          border: 1px solid #e6ebf1;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          margin: 0 0 8px;
        }

        .stat-val {
          font-size: 32px;
          font-weight: 800;
          color: #101432;
          margin: 0 0 4px;
        }

        .stat-note {
          font-size: 12px;
          color: #10b981;
          margin: 0;
        }

        /* ── Data Tables & Panels ──────────────────────────────────── */
        .admin-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          border: 1px solid #e6ebf1;
          margin-bottom: 24px;
        }

        .admin-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 18px;
        }

        .admin-card-head h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #101432;
        }

        .admin-search-input {
          padding: 9px 14px;
          border: 1px solid #d2d6dc;
          border-radius: 8px;
          font-size: 14px;
          min-width: 220px;
        }

        .subtabs-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .subtab-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d2d6dc;
          background: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          color: #4b5563;
        }

        .subtab-btn.active {
          background: #101432;
          color: #fff;
          border-color: #101432;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .admin-table th {
          text-align: left;
          padding: 12px 14px;
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-table td {
          padding: 14px;
          border-bottom: 1px solid #edf2f7;
          vertical-align: middle;
        }

        .worker-avatar-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          background: #f4510b;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .inspect-btn {
          padding: 7px 14px;
          background: #101432;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .inspect-btn:hover { background: #1e264f; }

        /* ── Modal Styles ──────────────────────────────────────────── */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-body {
          background: #ffffff;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
        }

        .inspect-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin: 16px 0;
          font-size: 14px;
        }

        .inspect-item strong {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .inspect-portfolio {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .inspect-portfolio-img {
          width: 100%;
          height: 95px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-approve {
          padding: 11px 22px;
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-approve:hover { background: #15803d; }

        .btn-reject {
          padding: 11px 18px;
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-reject:hover { background: #b91c1c; }

        .btn-close {
          padding: 11px 16px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* ── Mobile Responsive ─────────────────────────────────────── */
        @media (max-width: 820px) {
          .admin-sidebar {
            position: fixed;
            top: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-mobile-toggle {
            display: block;
          }
          .admin-body {
            padding: 18px 16px;
          }
          .admin-topbar {
            padding: 14px 16px;
          }
          .inspect-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div>
            <span className="admin-sidebar-brand">WorkConnect</span>
            <span className="admin-sidebar-badge">ADMIN</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          >
            <span>Overview</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "workers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("workers");
              setSidebarOpen(false);
            }}
          >
            <span>Workers</span>
            {pendingWorkersList.length > 0 && (
              <span className="admin-nav-pill warning">
                {pendingWorkersList.length} pending
              </span>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("customers");
              setSidebarOpen(false);
            }}
          >
            <span>Customers</span>
            <span className="admin-nav-pill">{customers.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("reports");
              setSidebarOpen(false);
            }}
          >
            <span>Reports</span>
            {pendingReportsList.length > 0 ? (
              <span className="admin-nav-pill warning">
                {pendingReportsList.length} pending
              </span>
            ) : (
              <span className="admin-nav-pill">{reports.length}</span>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "add-worker" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("add-worker");
              setSidebarOpen(false);
            }}
          >
            <span>Add Worker</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700" }}>Admin Portal</div>
            <div style={{ fontSize: "11px", color: "#8a94a6" }}>{adminUser.email}</div>
          </div>
          <button className="admin-footer-logout" onClick={handleAdminLogout}>
            Logout
          </button>
        </div>
      </aside>

      

      <main className="admin-main">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <button
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation"
          >
            ☰
          </button>

          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "workers" && "Worker Management"}
              {activeTab === "customers" && "Registered Customers"}
              {activeTab === "reports" && "Customer Complaints"}
              {activeTab === "add-worker" && "Register New Artisan"}
            </h1>
          </div>


        </header>

        {notice && (
          <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#065f46", padding: "12px 20px", margin: "16px 30px 0", borderRadius: "8px", fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
            <span>{notice}</span>
            <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => setNotice("")}>✕</span>
          </div>
        )}

        <div className="admin-body">
          
          {activeTab === "overview" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">TOTAL REGISTERED ACCOUNTS</div>
                  <div className="stat-val">{stats.totalUsers}</div>
                  <p className="stat-note">Accounts in database</p>
                </div>

                <div className="stat-card">
                  <div className="stat-label">VERIFIED ARTISANS (PUBLIC)</div>
                  <div className="stat-val" style={{ color: "#16a34a" }}>
                    {stats.verifiedWorkers}
                  </div>
                  <p className="stat-note">Active on Chatbot</p>
                </div>

                <div className="stat-card">
                  <div className="stat-label">PENDING VERIFICATION</div>
                  <div className="stat-val" style={{ color: "#f59e0b" }}>
                    {stats.pendingWorkers}
                  </div>
                  <p className="stat-note" style={{ color: "#b45309" }}>
                    Awaiting admin approval
                  </p>
                </div>

                <div className="stat-card">
                  <div className="stat-label">REGISTERED CUSTOMERS</div>
                  <div className="stat-val">{stats.totalCustomers}</div>
                  <p className="stat-note">Customer accounts</p>
                </div>

                <div className="stat-card">
                  <div className="stat-label">INCIDENT REPORTS</div>
                  <div className="stat-val" style={{ color: pendingReportsList.length > 0 ? "#dc2626" : "#101432" }}>
                    {pendingReportsList.length}
                  </div>
                  <p className="stat-note" style={{ color: pendingReportsList.length > 0 ? "#dc2626" : "#64748b" }}>
                    {pendingReportsList.length} pending moderation
                  </p>
                </div>
              </div>

             


              {pendingReportsList.length > 0 && (
                <div className="admin-card" style={{ borderLeft: "4px solid #dc2626", marginBottom: "20px" }}>
                  <div className="admin-card-head">
                    <h2 style={{ color: "#dc2626", margin: 0 }}>🚨 Action Required: {pendingReportsList.length} Pending Incident Report(s)</h2>
                    <button
                      className="subtab-btn"
                      style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                      onClick={() => {
                        setActiveTab("reports");
                        setReportFilter("pending");
                      }}
                    >
                      Review Reports Now →
                    </button>
                  </div>
                  <p style={{ margin: "8px 0 0", color: "#666", fontSize: "14px" }}>
                    Customers have filed complaints against artisans. Review the evidence and decide whether to resolve the dispute or ban the worker.
                  </p>
                </div>
              )}

             

              {pendingWorkersList.length > 0 && (
                <div className="admin-card" style={{ borderLeft: "4px solid #f59e0b" }}>
                  <div className="admin-card-head">
                    <h2>⚠️ Action Required: {pendingWorkersList.length} Pending Worker Approvals</h2>
                    <button
                      className="subtab-btn"
                      onClick={() => {
                        setActiveTab("workers");
                        setWorkerSubTab("pending");
                      }}
                    >
                      View All Pending →
                    </button>
                  </div>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    The following artisans recently registered and are waiting for your verification before their profiles are made public.
                  </p>
                </div>
              )}

              

              <div className="admin-card">
                <div className="admin-card-head">
                  <h2>Recent Worker Registrations</h2>
                  <span style={{ fontSize: "13px", color: "#666" }}>
                    Total Workers: {workers.length}
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Artisan</th>
                        <th>Trade</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.slice(0, 6).map((w) => (
                        <tr key={w.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {w.image ? (
                                <img src={w.image} alt={w.name} className="worker-avatar-small" />
                              ) : (
                                <div className="worker-avatar-small">{w.name[0]}</div>
                              )}
                              <strong>{w.name}</strong>
                            </div>
                          </td>
                          <td>{w.skill}</td>
                          <td>{w.location}</td>
                          <td>
                            {w.verified ? (
                              <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                ✓ Approved
                              </span>
                            ) : (
                              <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="inspect-btn"
                              onClick={() => setInspectWorker(w)}
                            >
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          

          {activeTab === "workers" && (
            <div className="admin-card">
              <div className="admin-card-head">
                <h2>Artisan Verification & Management</h2>
                <input
                  type="text"
                  placeholder="Search workers by name, skill, location..."
                  className="admin-search-input"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                />
              </div>

            

              <div className="subtabs-bar">
                <button
                  className={`subtab-btn ${workerSubTab === "all" ? "active" : ""}`}
                  onClick={() => setWorkerSubTab("all")}
                >
                  All Registered Artisans ({workers.length})
                </button>
                <button
                  className={`subtab-btn ${workerSubTab === "pending" ? "active" : ""}`}
                  onClick={() => setWorkerSubTab("pending")}
                >
                  ⏳ Pending Approvals ({pendingWorkersList.length})
                </button>
                <button
                  className={`subtab-btn ${workerSubTab === "approved" ? "active" : ""}`}
                  onClick={() => setWorkerSubTab("approved")}
                >
                  ✓ Approved Artisans ({approvedWorkersList.length})
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Full Name</th>
                      <th>Skill</th>
                      <th>Location</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Inspection & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedWorkers.length > 0 ? (
                      displayedWorkers.map((w) => (
                        <tr key={w.id}>
                          <td>
                            {w.image ? (
                              <img src={w.image} alt={w.name} className="worker-avatar-small" />
                            ) : (
                              <div className="worker-avatar-small">{w.name[0]}</div>
                            )}
                          </td>
                          <td>
                            <strong>{w.name}</strong>
                          </td>
                          <td>{w.skill}</td>
                          <td>{w.location}</td>
                          <td>{w.phone || "—"}</td>
                          <td>
                            {w.banned ? (
                              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                                🚫 Banned
                              </span>
                            ) : w.verified ? (
                              <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                                ✓ Public
                              </span>
                            ) : (
                              <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                                ⏳ Pending Approval
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <button
                                className="inspect-btn"
                                onClick={() => setInspectWorker(w)}
                              >
                                🔍 Details & Review
                              </button>
                              {w.banned ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBan(w.id, false)}
                                  style={{ padding: "6px 10px", background: "#ecfdf5", color: "#15803d", border: "1px solid #86efac", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}
                                  title="Lift ban on worker"
                                >
                                  ✅ Unban
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to BAN ${w.name}? They will be immediately removed from the AI Chatbot.`)) {
                                      handleToggleBan(w.id, true);
                                    }
                                  }}
                                  style={{ padding: "6px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}
                                  title="Ban worker and delist from Chatbot"
                                >
                                  🚫 Ban
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                          No workers found in this tab.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          

          {activeTab === "customers" && (
            <div className="admin-card">
              <div className="admin-card-head">
                <h2>Registered Customers ({customers.length})</h2>
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  className="admin-search-input"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Account Role</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedCustomers.length > 0 ? (
                      displayedCustomers.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.full_name || c.name || "Customer"}</strong>
                          </td>
                          <td>{c.email}</td>
                          <td>{c.phone || "Not provided"}</td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>
                              {c.role || "customer"}
                            </span>
                          </td>
                          <td style={{ color: "#64748b" }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                          No registered customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

         


          {activeTab === "reports" && (
            <div className="admin-card">
              <div className="admin-card-head">
                <div>
                  <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🚨</span> Customer Incident Reports ({reports.length})
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>
                    Review customer reports against artisans, reach out to resolve disputes, or enforce disciplinary bans.
                  </p>
                </div>

                <div className="subtabs-bar" style={{ margin: 0 }}>
                  <button
                    className={`subtab-btn ${reportFilter === "all" ? "active" : ""}`}
                    onClick={() => setReportFilter("all")}
                  >
                    All Reports ({reports.length})
                  </button>
                  <button
                    className={`subtab-btn ${reportFilter === "pending" ? "active" : ""}`}
                    onClick={() => setReportFilter("pending")}
                  >
                    ⏳ Pending Review ({pendingReportsList.length})
                  </button>
                  <button
                    className={`subtab-btn ${reportFilter === "resolved" ? "active" : ""}`}
                    onClick={() => setReportFilter("resolved")}
                  >
                    ✓ Resolved ({resolvedReportsList.length})
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reported Artisan</th>
                      <th>Reason Category</th>
                      <th>Customer Details</th>
                      <th>Date Filed</th>
                      <th>Status</th>
                      <th>Artisan Standing</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedReports.length > 0 ? (
                      displayedReports.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.worker?.name || `Artisan #${r.worker_id}`}</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {r.worker?.skill || "Trade"} · ID #{r.worker_id}
                            </div>
                          </td>
                          <td>
                            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                              {r.reason}
                            </span>
                          </td>
                          <td>
                            <div><strong>{r.reporter_name}</strong></div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {r.reporter_phone || r.reporter_email || "No contact"}
                            </div>
                          </td>
                          <td style={{ color: "#64748b", fontSize: "13px" }}>
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent"}
                          </td>
                          <td>
                            {r.status === "pending" && (
                              <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                ⏳ Pending
                              </span>
                            )}
                            {r.status === "resolved" && (
                              <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                ✓ Resolved
                              </span>
                            )}
                            {r.status === "dismissed" && (
                              <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                Dismissed
                              </span>
                            )}
                          </td>
                          <td>
                            {r.worker?.banned ? (
                              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                🚫 Banned
                              </span>
                            ) : (
                              <span style={{ background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                                Active
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              className="inspect-btn"
                              onClick={() => setInspectReport(r)}
                              style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                            >
                              🔍 Review & Take Action
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                          No customer incident reports in this section.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          

          {activeTab === "add-worker" && (
            <div className="admin-card" style={{ maxWidth: "800px" }}>
              <div className="admin-card-head">
                <h2>Register & Onboard Artisan Manually</h2>
              </div>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "-10px", marginBottom: "20px" }}>
                Workers added through the admin panel will be verified immediately and published to the Chatbot.
              </p>

              {addError && (
                <div style={{ background: "#fef3f2", color: "#b42318", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div style={{ background: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
                  {addSuccess}
                </div>
              )}

              <form onSubmit={handleAddWorkerSubmit}>
                {/* Profile Photo */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", padding: "12px", background: "#f8fafc", borderRadius: "10px" }}>
                  <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#f4510b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: "28px" }}>
                    {addProfilePhoto ? (
                      <img src={URL.createObjectURL(addProfilePhoto)} alt="Avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>
                      Artisan Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAddProfilePhoto(e.target.files[0])}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Full Name</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      placeholder="e.g. Samuel Okafor"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Trade / Skill</label>
                    <select
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      value={addForm.skill}
                      onChange={(e) => setAddForm({ ...addForm, skill: e.target.value })}
                    >
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Painter">Painter</option>
                      <option value="Welder">Welder</option>
                      <option value="Mechanic">Mechanic</option>
                      <option value="Tailor">Tailor</option>
                      <option value="Hairdresser">Hairdresser</option>
                      <option value="AC Technician">AC Technician</option>
                      <option value="Cleaner">Cleaner</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Location</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      placeholder="e.g. Nsukka, Enugu"
                      value={addForm.location}
                      onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Phone Number</label>
                    <input
                      type="tel"
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      placeholder="+234 800 000 0000"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Email Address (Optional — used to send verification approval alert)
                  </label>
                  <input
                    type="email"
                    className="admin-search-input"
                    style={{ width: "100%" }}
                    placeholder="artisan@gmail.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Years of Experience</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      placeholder="e.g. 4+ years"
                      value={addForm.experience}
                      onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Working Hours</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ width: "100%" }}
                      placeholder="08:00 - 18:00"
                      value={addForm.working_hours}
                      onChange={(e) => setAddForm({ ...addForm, working_hours: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>About / Services Overview</label>
                  <textarea
                    rows="3"
                    className="admin-search-input"
                    style={{ width: "100%", resize: "vertical" }}
                    placeholder="Brief description of the artisan's expertise and specialties..."
                    value={addForm.about}
                    onChange={(e) => setAddForm({ ...addForm, about: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Portfolio Work Proof Photos (Up to 4)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setAddPortfolioPhotos(Array.from(e.target.files || []))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addLoading}
                  style={{ padding: "13px 28px", background: "#f4510b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}
                >
                  {addLoading ? "Saving …" : "Add & Verify Worker"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

     

     
      {inspectReport && (
        <div className="modal-overlay" onClick={() => setInspectReport(null)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🚨</span>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#101432" }}>
                  Incident Report #{inspectReport.id}
                </h2>
              </div>
              <button
                type="button"
                className="btn-close"
                style={{ padding: "4px 10px", fontSize: "16px" }}
                onClick={() => setInspectReport(null)}
              >
                ✕
              </button>
            </div>

            {/* Complaint details box */}
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "10px", padding: "16px", marginTop: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#c53030", textTransform: "uppercase", marginBottom: "4px" }}>
                Reported Reason: {inspectReport.reason}
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#2d3748", lineHeight: "1.5" }}>
                "{inspectReport.details}"
              </p>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#718096" }}>
                Filed on: {inspectReport.created_at ? new Date(inspectReport.created_at).toLocaleString() : "Recently"}
              </div>
            </div>

            {/* Reporter Contact Info */}
            <div style={{ marginTop: "16px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                👤 Complainant (Customer Details)
              </div>
              <div className="inspect-grid" style={{ margin: 0 }}>
                <div className="inspect-item">
                  <strong>Customer Name:</strong>
                  <span>{inspectReport.reporter_name}</span>
                </div>
                <div className="inspect-item">
                  <strong>Phone Number:</strong>
                  {inspectReport.reporter_phone ? (
                    <a href={`tel:${inspectReport.reporter_phone}`} style={{ color: "#ef5a20", fontWeight: "bold" }}>
                      📞 {inspectReport.reporter_phone}
                    </a>
                  ) : <span>Not provided</span>}
                </div>
                <div className="inspect-item">
                  <strong>Email:</strong>
                  {inspectReport.reporter_email ? (
                    <a href={`mailto:${inspectReport.reporter_email}`} style={{ color: "#2563eb" }}>
                      ✉️ {inspectReport.reporter_email}
                    </a>
                  ) : <span>Not provided</span>}
                </div>
                <div className="inspect-item">
                  <strong>Report Status:</strong>
                  <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>{inspectReport.status}</span>
                </div>
              </div>
            </div>

            {/* Artisan Profile Details */}
            <div style={{ marginTop: "16px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                ⚒️ Reported Artisan Details
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                {inspectReport.worker?.image ? (
                  <img
                    src={inspectReport.worker.image}
                    alt={inspectReport.worker.name}
                    style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #f4510b" }}
                  />
                ) : (
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#f4510b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {(inspectReport.worker?.name || "W")[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px" }}>{inspectReport.worker?.name || "Artisan"}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {inspectReport.worker?.skill} · {inspectReport.worker?.location || "Location not specified"} · ID #{inspectReport.worker_id}
                  </div>
                </div>
              </div>

              <div className="inspect-grid" style={{ margin: 0 }}>
                <div className="inspect-item">
                  <strong>Artisan Phone:</strong>
                  {inspectReport.worker?.phone ? (
                    <a href={`tel:${inspectReport.worker.phone}`} style={{ color: "#ef5a20", fontWeight: "bold" }}>
                      📞 {inspectReport.worker.phone}
                    </a>
                  ) : <span>Not listed</span>}
                </div>
                <div className="inspect-item">
                  <strong>Current Standing:</strong>
                  {inspectReport.worker?.banned ? (
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>🚫 Currently Banned</span>
                  ) : (
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>✓ Active</span>
                  )}
                </div>
              </div>
            </div>

            {/* Moderation Actions */}
            <div style={{ marginTop: "22px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#101432", marginBottom: "12px" }}>
                Admin Action:
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {inspectReport.worker?.banned ? (
                  <button
                    type="button"
                    className="btn-approve"
                    disabled={reportActionLoading}
                    onClick={() => handleToggleBan(inspectReport.worker_id, false)}
                  >
                    ✅ Lift Ban (Restore Worker)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-reject"
                    disabled={reportActionLoading}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to BAN ${inspectReport.worker?.name || 'this worker'}? They will be immediately removed from the AI Chatbot search.`)) {
                        handleToggleBan(inspectReport.worker_id, true);
                      }
                    }}
                  >
                    🚫 Ban Artisan Immediately
                  </button>
                )}

                {inspectReport.status !== "resolved" && (
                  <button
                    type="button"
                    className="btn-approve"
                    style={{ background: "#2563eb" }}
                    disabled={reportActionLoading}
                    onClick={() => handleUpdateReport(inspectReport.id, "resolved", "Resolved by admin after mediation.")}
                  >
                    ✓ Mark as Resolved
                  </button>
                )}

                {inspectReport.status !== "dismissed" && (
                  <button
                    type="button"
                    className="btn-close"
                    disabled={reportActionLoading}
                    onClick={() => handleUpdateReport(inspectReport.id, "dismissed", "Dismissed after investigation.")}
                  >
                    Dismiss Report
                  </button>
                )}

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInspectReport(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKER INSPECTION & APPROVAL POPUP MODAL ────────────────── */}
      {inspectWorker && (
        <div className="modal-overlay">
          <div className="modal-body">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              {inspectWorker.image ? (
                <img
                  src={inspectWorker.image}
                  alt={inspectWorker.name}
                  style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2px solid #f4510b" }}
                />
              ) : (
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#f4510b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                  {inspectWorker.name[0]}
                </div>
              )}
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "22px" }}>{inspectWorker.name}</h2>
                <div style={{ color: "#64748b", fontSize: "14px" }}>
                  {inspectWorker.skill} · {inspectWorker.location}
                </div>
                <div style={{ marginTop: "4px" }}>
                  {inspectWorker.verified ? (
                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                      ✓ Currently Public
                    </span>
                  ) : (
                    <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                      ⏳ Pending Approval
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="inspect-grid">
              <div className="inspect-item">
                <strong>Phone Number:</strong>
                <span>{inspectWorker.phone || "Not provided"}</span>
              </div>
              <div className="inspect-item">
                <strong>Years of Experience:</strong>
                <span>{inspectWorker.experience || "Not specified"}</span>
              </div>
              <div className="inspect-item">
                <strong>Working Hours:</strong>
                <span>{inspectWorker.working_hours || "08:00 - 18:00"}</span>
              </div>
              <div className="inspect-item">
                <strong>Standard Rate:</strong>
                <span>{inspectWorker.hourly_rate || "Negotiable"}</span>
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
              <strong style={{ display: "block", color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>
                Artisan Bio / Description:
              </strong>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                {inspectWorker.about || "No bio submitted."}
              </p>
            </div>

            {/* Portfolio Proof Photos */}
            <div style={{ marginTop: "16px" }}>
              <strong style={{ display: "block", color: "#64748b", fontSize: "12px", marginBottom: "6px" }}>
                Submitted Work Proof Photos:
              </strong>
              {Array.isArray(inspectWorker.portfolio) && inspectWorker.portfolio.length > 0 ? (
                <div className="inspect-portfolio">
                  {inspectWorker.portfolio.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Proof ${i + 1}`}
                      className="inspect-portfolio-img"
                    />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#888", fontStyle: "italic", margin: 0 }}>
                  No portfolio photos uploaded by this worker.
                </p>
              )}
            </div>

            {/* Modal Decision Buttons */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-close"
                onClick={() => setInspectWorker(null)}
                disabled={verifyLoading}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-reject"
                onClick={() => handleVerify(inspectWorker.id, false)}
                disabled={verifyLoading}
              >
                {verifyLoading ? "Processing…" : "✕ Reject Application"}
              </button>

              {!inspectWorker.verified && (
                <button
                  type="button"
                  className="btn-approve"
                  onClick={() => handleVerify(inspectWorker.id, true)}
                  disabled={verifyLoading}
                >
                  {verifyLoading ? "Approving…" : "✓ Confirm & Approve"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
