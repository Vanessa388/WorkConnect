import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

export default function WorkerProfile() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [worker, setWorker] = useState(null);

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    skill: "",
    location: "",
    phone: "",
    about: "",
    experience: "",
    working_hours: "",
    hourly_rate: "",
  });

  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newPortfolioFiles, setNewPortfolioFiles] = useState([]);

  // On mount: get the logged-in user from server session, then load their worker profile
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      // 1. Ask the server who is currently logged in (reads HTTP-only cookie)
      const user = await getCurrentUser();

      if (!user) {
        setError("You are not logged in. Please login to access your artisan dashboard.");
        setLoading(false);
        return;
      }

      // 2. Fetch workers from DB (including pending profiles for the logged-in artisan)
      const response = await fetch("http://localhost:5000/api/workers?all=true", {
        credentials: "include",
      });
      const data = await response.json();
      const workerList = data.workers || data.data || [];

      if (!data.success) {
        setError(
          "Could not load workers from the database. Please ensure the backend is running."
        );
        setLoading(false);
        return;
      }

      const myProfile = workerList.find(
        (w) =>
          w.user_id === user.id ||
          String(w.user_id) === String(user.id) ||
          (user.phone && w.phone === user.phone) ||
          (user.name && w.name === user.name)
      );

      if (!myProfile) {
        const recoveryRes = await fetch("http://localhost:5000/api/workers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            user_id: user.id,
            name: user.name || "Artisan",
            skill: "Skill not set",
            location: "Location not set",
            phone: user.phone || "",
            email: user.email || "",
            about: "Click 'Edit Profile' to add your bio and showcase your services.",
            experience: "1+ years",
            image: "",
            portfolio: [],
          }),
        });
        const recoveryData = await recoveryRes.json();

        if (recoveryRes.ok && recoveryData.success) {
          setWorker(recoveryData.worker || recoveryData.data);
        } else {
          setWorker({
            id: null,
            user_id: user.id,
            name: user.name || "Artisan",
            skill: "Skill not set",
            location: "Location not set",
            phone: user.phone || "Phone not set",
            about: "Click 'Edit Profile' to add your bio and showcase your services.",
            experience: "1+ years",
            available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            working_hours: "08:00 - 18:00",
            image: null,
            portfolio: [],
            rating: 5.0,
            reviews: 0,
            verified: false,
          });
        }
      } else {
        setWorker({
          ...myProfile,
          verified: myProfile.verified === true,
        });
        setEditForm({
          name: myProfile.name || "",
          skill: myProfile.skill || "",
          location: myProfile.location || "",
          phone: myProfile.phone || "",
          about: myProfile.about || "",
          experience: myProfile.experience || "",
          working_hours: myProfile.working_hours || "",
          hourly_rate: myProfile.hourly_rate || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch worker profile:", err);
      setError("Unable to connect to server. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function getInitials(name) {
    if (!name) return "W";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Handle Edit Form Changes
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  // Handle Edit Submission
  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!worker?.id) {
      setEditError("Cannot update: profile ID not found.");
      return;
    }

    try {
      setEditLoading(true);
      setEditError("");
      setEditSuccess("");

      let updatedImageUrl = worker.image;
      let updatedPortfolio = Array.isArray(worker.portfolio) ? [...worker.portfolio] : [];

      // 1. Upload new avatar if selected
      if (newAvatarFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newAvatarFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

        const uploadRes = await fetch("http://localhost:5000/api/workers/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            fileName: newAvatarFile.name || "avatar.jpg",
          }),
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrl) {
          updatedImageUrl = uploadData.imageUrl;
        }
      }

      // 2. Upload any new portfolio photos
      for (let i = 0; i < newPortfolioFiles.length; i++) {
        const file = newPortfolioFiles[i];
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
            fileName: file.name || `portfolio-${Date.now()}.jpg`,
          }),
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrl) {
          updatedPortfolio.push(uploadData.imageUrl);
        }
      }

      // 3. Update profile in database
      const updateRes = await fetch(`http://localhost:5000/api/workers/${worker.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name,
          skill: editForm.skill,
          location: editForm.location,
          phone: editForm.phone,
          about: editForm.about,
          experience: editForm.experience,
          working_hours: editForm.working_hours,
          hourly_rate: editForm.hourly_rate,
          image: updatedImageUrl,
          portfolio: updatedPortfolio,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateData.success) {
        setEditError(updateData.message || "Failed to update profile.");
        setEditLoading(false);
        return;
      }

      // Success
      setWorker(updateData.worker || updateData.data);
      setEditSuccess("Profile updated successfully!");
      setNewAvatarFile(null);
      setNewPortfolioFiles([]);

      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess("");
      }, 1000);
    } catch (err) {
      console.error("Save profile error:", err);
      setEditError("Could not save updates. Please try again.");
    } finally {
      setEditLoading(false);
    }
  }

  // Parse portfolio safely
  const portfolioPhotos = Array.isArray(worker?.portfolio)
    ? worker.portfolio
    : typeof worker?.portfolio === "string"
    ? worker.portfolio.replace(/[{}]/g, "").split(",").filter(Boolean)
    : [];

  return (
    <div className="worker-profile-page">
      <style>{`
        .worker-profile-page {
          min-height: 100vh;
          padding: 0 0 45px;
          background: #f8f9fa;
          color: #101432;
          font-family: Arial, Helvetica, sans-serif;
        }

        .worker-profile-page * {
          box-sizing: border-box;
        }

        .profile-container {
          width: 100%;
          max-width: none;
          margin: 0;
        }

        .profile-header {
          width: 100%;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 35px;
          background: #ffffff;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
        }

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #101432;
          text-decoration: none;
        }

        .profile-brand-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff8a28, #ed4a08);
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
        }

        .profile-brand-name {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .profile-header-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .profile-logout-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 1px solid #ef5a20;
          border-radius: 8px;
          background: #ef5a20;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-logout-button:hover {
          background: #d94a15;
          border-color: #d94a15;
        }

        .profile-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          padding: 28px 35px;
          background: #ffffff;
          border-bottom: 1px solid #eaecee;
          margin-bottom: 25px;
        }

        .profile-summary-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1;
          min-width: 280px;
        }

        .profile-avatar {
          width: 95px;
          height: 95px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff8a28, #e94b08);
          color: #ffffff;
          font-size: 36px;
          font-weight: 700;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(239, 90, 32, 0.25);
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .profile-summary-details h1 {
          margin: 0 0 6px;
          color: #151515;
          font-size: 26px;
          font-weight: 800;
        }

        .profile-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 20px;
          background: #e4f4e6;
          color: #28763c;
          font-size: 13px;
          font-weight: 700;
          margin-left: 10px;
        }

        .profile-job-location {
          margin: 0 0 8px;
          color: #555555;
          font-size: 17px;
          font-weight: 600;
        }

        .profile-contact-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px 24px;
          color: #222222;
          font-size: 15px;
        }

        .profile-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border: 1.5px solid #ef5a20;
          border-radius: 8px;
          background: #fff;
          color: #ef5a20;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-edit-btn:hover {
          background: #fff0e7;
          transform: translateY(-1px);
        }

        .profile-content-grid {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 28px;
          align-items: start;
          padding: 0 35px;
        }

        .profile-left-column,
        .profile-right-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .profile-card {
          padding: 24px;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #ebeef2;
        }

        .profile-card-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 16px;
          color: #171717;
          font-size: 20px;
          font-weight: 800;
        }

        .profile-card-icon {
          color: #ef5a20;
          font-size: 22px;
        }

        .profile-about-text {
          margin: 0;
          color: #3f4553;
          font-size: 15px;
          line-height: 1.65;
        }

        .profile-info-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .profile-info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #343434;
          font-size: 15px;
        }

        .profile-info-icon {
          width: 24px;
          color: #ef5a20;
          font-size: 18px;
        }

        .profile-skill-tag {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          background: #fff0e6;
          color: #d94a15;
          font-size: 15px;
          font-weight: 700;
        }

        .profile-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .profile-portfolio-image {
          display: block;
          width: 100%;
          height: 130px;
          border-radius: 10px;
          background: #f0f0f0;
          object-fit: cover;
          border: 1px solid #e5e8ec;
        }

        .profile-no-photos {
          color: #888;
          font-size: 14px;
          font-style: italic;
          padding: 10px 0;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .modal-title {
          margin: 0 0 20px;
          font-size: 22px;
          color: #101432;
          font-weight: 800;
        }

        .modal-field {
          margin-bottom: 16px;
        }

        .modal-field label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #222;
        }

        .modal-field input,
        .modal-field select,
        .modal-field textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #cfd5dc;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          outline: none;
        }

        .modal-field input:focus,
        .modal-field select:focus,
        .modal-field textarea:focus {
          border-color: #ef5a20;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .modal-save-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background: #ef5a20;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-cancel-btn {
          padding: 12px 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #f5f5f5;
          color: #444;
          font-size: 15px;
          cursor: pointer;
        }

        @media (max-width: 820px) {
          .profile-content-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          .profile-summary {
            padding: 20px 16px;
          }
          .profile-header {
            padding: 14px 16px;
          }
        }
      `}</style>

      <div className="profile-container">
        {/* Header */}
        <header className="profile-header">
          <a href="/" className="profile-brand">
            <span className="profile-brand-icon">WC</span>
            <span className="profile-brand-name">WorkConnect</span>
          </a>

          <div className="profile-header-actions">
            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: "42px" }}>⏳</span>
            <h2>Loading your dashboard…</h2>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: "42px" }}>⚠️</span>
            <h2>Notice</h2>
            <p style={{ color: "#666", maxWidth: "450px", margin: "10px auto" }}>{error}</p>
            <button
              style={{ padding: "10px 20px", background: "#ef5a20", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && worker && (
          <>
            {/* Suspended / Banned Banner */}
            {worker.banned && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1.5px solid #ef4444",
                  padding: "16px 24px",
                  borderRadius: "10px",
                  margin: "20px 35px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: "#991b1b",
                }}
              >
                <span style={{ fontSize: "28px" }}>🚫</span>
                <div>
                  <strong style={{ display: "block", fontSize: "16px", marginBottom: "2px" }}>
                    Artisan Account Suspended / Banned
                  </strong>
                  <span style={{ fontSize: "13px", color: "#7f1d1d" }}>
                    Your artisan profile has been temporarily suspended by WorkConnect administration following community reports. During suspension, your profile is hidden from the AI Chatbot and public directories.
                  </span>
                </div>
              </div>
            )}

            {/* Pending Verification Banner if not yet verified */}
            {!worker.verified && !worker.banned && (
              <div
                style={{
                  backgroundColor: "#fff8eb",
                  border: "1px solid #fedf89",
                  padding: "16px 24px",
                  borderRadius: "10px",
                  margin: "20px 35px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: "#b54708",
                }}
              >
                <span style={{ fontSize: "24px" }}>⏳</span>
                <div>
                  <strong style={{ display: "block", fontSize: "15px", marginBottom: "2px" }}>
                    Account Verification Pending
                  </strong>
                  <span style={{ fontSize: "13px", color: "#7a3e0b" }}>
                    Your artisan profile has been submitted and is currently awaiting admin verification in the Admin Portal. Once approved, your profile will immediately become public and visible to customers on the Chatbot.
                  </span>
                </div>
              </div>
            )}

            {/* Top Summary Banner */}
            <section className="profile-summary">
              <div className="profile-summary-left">
                <div className="profile-avatar">
                  {worker.image ? (
                    <img src={worker.image} alt={worker.name} />
                  ) : (
                    getInitials(worker.name)
                  )}
                </div>

                <div className="profile-summary-details">
                  <h1>
                    {worker.name}
                    {worker.verified ? (
                      <span className="profile-verified-badge">✓ Verified Artisan</span>
                    ) : (
                      <span
                        className="profile-verified-badge"
                        style={{ background: "#fff4e5", color: "#b54708" }}
                      >
                        ⏳ Pending Approval
                      </span>
                    )}
                  </h1>

                  <p className="profile-job-location">
                    {worker.skill} · {worker.location}
                  </p>

                  <div className="profile-contact-row">
                    <span>
                      ☆ <strong>{worker.rating || "5.0"}</strong> ({worker.reviews || 0} reviews)
                    </span>
                    {worker.phone && (
                      <span style={{ color: "#444" }}>
                        ☎ {worker.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Profile Button (Worker's Personal Action) */}
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            </section>

            {/* Main Details Grid */}
            <main className="profile-content-grid">
              <div className="profile-left-column">
                {/* About Section */}
                <section className="profile-card">
                  <h2 className="profile-card-heading">
                    <span className="profile-card-icon">♙</span>
                    About Me
                  </h2>
                  <p className="profile-about-text">
                    {worker.about || "No bio added yet. Click 'Edit Profile' to introduce yourself."}
                  </p>
                </section>

                {/* Availability Section */}
                <section className="profile-card">
                  <h2 className="profile-card-heading">
                    <span className="profile-card-icon">▦</span>
                    Work Availability & Experience
                  </h2>
                  <div className="profile-info-list">
                    <div className="profile-info-item">
                      <span className="profile-info-icon">▦</span>
                      <span>
                        <strong>Days:</strong>{" "}
                        {Array.isArray(worker.available_days) && worker.available_days.length > 0
                          ? worker.available_days.join(", ")
                          : worker.available_days || "Monday – Saturday"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-icon">◷</span>
                      <span>
                        <strong>Working Hours:</strong>{" "}
                        {worker.working_hours || "08:00 – 18:00"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-icon">▱</span>
                      <span>
                        <strong>Experience:</strong>{" "}
                        {worker.experience || "3+ years"}
                      </span>
                    </div>

                    {worker.hourly_rate && (
                      <div className="profile-info-item">
                        <span className="profile-info-icon">₦</span>
                        <span>
                          <strong>Standard Rate:</strong> {worker.hourly_rate}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Skill Category */}
                <section className="profile-card">
                  <h2 className="profile-card-heading">
                    <span className="profile-card-icon">♧</span>
                    Primary Skill
                  </h2>
                  <span className="profile-skill-tag">{worker.skill}</span>
                </section>
              </div>

              <div className="profile-right-column">
                {/* Portfolio Section */}
                <section className="profile-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h2 className="profile-card-heading" style={{ margin: 0 }}>
                      <span className="profile-card-icon">▧</span>
                      My Portfolio Work
                    </h2>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      {portfolioPhotos.length} photo(s)
                    </span>
                  </div>

                  {portfolioPhotos.length > 0 ? (
                    <div className="profile-portfolio-grid">
                      {portfolioPhotos.map((url, idx) => (
                        <img
                          key={idx}
                          className="profile-portfolio-image"
                          src={url}
                          alt={`Portfolio work ${idx + 1}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="profile-no-photos">
                      No portfolio work photos uploaded yet. Click <strong>Edit Profile</strong> to add photos of your past jobs!
                    </p>
                  )}
                </section>
              </div>
            </main>
          </>
        )}

        {/* ── Edit Profile Modal ────────────────────────────────────────── */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">Edit Your Artisan Profile</h2>

              {editError && (
                <p style={{ color: "#d92d20", background: "#fef3f2", padding: "10px 14px", borderRadius: "8px", fontSize: "14px" }}>
                  {editError}
                </p>
              )}
              {editSuccess && (
                <p style={{ color: "#027a48", background: "#ecfdf3", padding: "10px 14px", borderRadius: "8px", fontSize: "14px" }}>
                  {editSuccess}
                </p>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="modal-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Trade / Skill</label>
                  <input
                    type="text"
                    name="skill"
                    value={editForm.skill}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Location (Town, State)</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>About You & What You Specialize In</label>
                  <textarea
                    rows="3"
                    name="about"
                    value={editForm.about}
                    onChange={handleEditChange}
                    placeholder="Describe your craft, years of service, and quality of work..."
                  />
                </div>

                <div className="modal-field">
                  <label>Years of Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                    placeholder="e.g. 5+ years"
                  />
                </div>

                <div className="modal-field">
                  <label>Working Hours</label>
                  <input
                    type="text"
                    name="working_hours"
                    value={editForm.working_hours}
                    onChange={handleEditChange}
                    placeholder="e.g. 08:00 - 18:00"
                  />
                </div>

                <div className="modal-field">
                  <label>Update Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewAvatarFile(e.target.files[0])}
                  />
                </div>

                <div className="modal-field">
                  <label>Add More Portfolio Work Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewPortfolioFiles(Array.from(e.target.files || []))}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setEditError("");
                    }}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
