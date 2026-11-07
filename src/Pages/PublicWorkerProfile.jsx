import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";

export default function PublicWorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review submission form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Report submission state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportReason, setReportReason] = useState("Unprofessional or Abusive Behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  useEffect(() => {
    async function loadWorkerAndReviews() {
      if (!id) return;
      try {
        setLoading(true);
        setError("");

        // 1. Fetch worker details
        const workerRes = await fetch(`http://localhost:5000/api/workers/${id}`);
        const workerData = await workerRes.json();

        if (!workerData.success || !workerData.data) {
          setError("Artisan not found or server is unreachable.");
          setLoading(false);
          return;
        }

        if (!workerData.data.verified) {
          setError("This artisan's account is currently awaiting admin verification and is not yet publicly active.");
          setLoading(false);
          return;
        }

        setWorker(workerData.data);

        // 2. Fetch worker reviews
        const reviewsRes = await fetch(`http://localhost:5000/api/workers/${id}/reviews`);
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success && Array.isArray(reviewsData.reviews)) {
          setReviews(reviewsData.reviews);
        }
      } catch (err) {
        console.error("Failed to load worker profile:", err);
        setError("Unable to connect to server. Please check backend connection.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkerAndReviews();
  }, [id]);

  // Handle Review Submission
  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Please write a short comment about your experience.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      const res = await fetch(`http://localhost:5000/api/workers/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_name: reviewName.trim() || "Satisfied Customer",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setReviewError(data.message || "Failed to submit review.");
        return;
      }

      // Prepend review and update count/rating
      setReviews((prev) => [data.review, ...prev]);
      setReviewComment("");
      setReviewSuccess("Thank you! Your review has been published.");

      // Refresh worker rating summary
      const refreshedWorker = await fetch(`http://localhost:5000/api/workers/${id}`);
      const refreshedData = await refreshedWorker.json();
      if (refreshedData.success) {
        setWorker(refreshedData.data);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewError("Could not submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // Handle Report Submission
  async function handleSubmitReport(e) {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim()) {
      setReportError("Please select a reason and provide detailed description.");
      return;
    }

    try {
      setSubmittingReport(true);
      setReportError("");

      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          worker_id: id,
          reporter_name: reportName.trim() || "Anonymous Customer",
          reporter_phone: reportPhone.trim(),
          reporter_email: reportEmail.trim(),
          reason: reportReason,
          details: reportDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setReportError(data.message || "Failed to submit report.");
        return;
      }

      setReportSuccess("Report submitted! WorkConnect admin has been notified and will investigate.");
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess("");
        setReportDetails("");
        setReportName("");
        setReportPhone("");
        setReportEmail("");
      }, 2200);
    } catch (err) {
      console.error("Report submit error:", err);
      setReportError("Network error. Please make sure backend is running.");
    } finally {
      setSubmittingReport(false);
    }
  }

  function getInitials(name) {
    if (!name) return "W";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const portfolioPhotos = Array.isArray(worker?.portfolio)
    ? worker.portfolio
    : typeof worker?.portfolio === "string"
    ? worker.portfolio.replace(/[{}]/g, "").split(",").filter(Boolean)
    : [];

  return (
    <div className="public-profile-page">
      <style>{`
        * { box-sizing: border-box; }
        .public-profile-page {
          min-height: 100vh;
          background: #f7f9fb;
          color: #101432;
          font-family: Arial, Helvetica, sans-serif;
          padding-bottom: 60px;
        }

        .public-nav-bar {
          padding: 14px 5%;
          background: #ffffff;
          border-bottom: 1px solid #e7ecf0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .public-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 8px;
          border: 1px solid #d2d8e0;
          background: #fff;
          color: #1b2138;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .public-back-btn:hover {
          background: #f1f4f8;
        }

        .public-content-container {
          max-width: 1040px;
          margin: 30px auto;
          padding: 0 20px;
        }

        .public-hero-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #eaedf1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 25px;
        }

        .public-hero-info {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1;
          min-width: 280px;
        }

        .public-hero-avatar {
          width: 105px;
          height: 105px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff8a28, #ed4a08);
          color: #fff;
          font-size: 38px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(237, 74, 8, 0.25);
        }

        .public-hero-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .public-hero-text h1 {
          margin: 0 0 6px;
          font-size: 28px;
          font-weight: 800;
          color: #101432;
        }

        .public-verified-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          background: #e4f4e6;
          color: #28763c;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          margin-left: 10px;
        }

        .public-hero-skill {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 600;
          color: #555;
        }

        .public-hero-call-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 10px;
          background: #ef5a20;
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(239, 90, 32, 0.3);
          transition: all 0.2s;
        }

        .public-hero-call-btn:hover {
          background: #d94a15;
          transform: translateY(-2px);
        }

        .public-hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .public-hero-report-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 13px 20px;
          border-radius: 10px;
          background: #ffffff;
          color: #dc2626;
          border: 1.5px solid #fca5a5;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .public-hero-report-btn:hover {
          background: #fef2f2;
          border-color: #dc2626;
          transform: translateY(-1px);
        }

        .report-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(16, 20, 50, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .report-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 540px;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-height: 90vh;
          overflow-y: auto;
        }

        .report-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .report-modal-close {
          background: transparent;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #64748b;
        }

        .public-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 25px;
          align-items: start;
        }

        .public-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          border: 1px solid #eaedf1;
          margin-bottom: 25px;
        }

        .public-card-title {
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 800;
          color: #101432;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .public-card-text {
          color: #3b4252;
          line-height: 1.65;
          font-size: 15px;
          margin: 0;
        }

        .public-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          font-size: 15px;
          color: #333;
        }

        .public-info-row strong {
          color: #101432;
        }

        .public-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .public-portfolio-img {
          width: 100%;
          height: 130px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid #e1e6eb;
        }

        /* Review Styles */
        .review-card {
          padding: 16px;
          border-radius: 10px;
          background: #f9fbfd;
          border: 1px solid #e8ecf2;
          margin-bottom: 14px;
        }

        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .reviewer-name {
          font-weight: 700;
          font-size: 15px;
          color: #111;
        }

        .review-stars {
          color: #f59e0b;
          font-size: 16px;
          letter-spacing: 2px;
        }

        .review-comment {
          margin: 0;
          color: #444;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Add Review Form */
        .add-review-box {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px dashed #d5dce4;
        }

        .add-review-box h3 {
          margin: 0 0 14px;
          font-size: 18px;
          font-weight: 800;
          color: #101432;
        }

        .review-field {
          margin-bottom: 12px;
        }

        .review-field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #333;
        }

        .review-field input,
        .review-field select,
        .review-field textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cfd7df;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
        }

        .review-field textarea {
          resize: vertical;
        }

        .review-submit-btn {
          width: 100%;
          padding: 12px;
          background: #101432;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .review-submit-btn:hover {
          background: #1f2752;
        }

        @media (max-width: 820px) {
          .public-grid {
            grid-template-columns: 1fr;
          }
          .public-hero-card {
            padding: 20px;
          }
          .public-hero-call-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <SharedNavbar />

      <div className="public-nav-bar">
        <button
          type="button"
          className="public-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back to Search / Chatbot
        </button>
        <span style={{ fontSize: "14px", color: "#666" }}>
          Verified Artisan Directory
        </span>
      </div>

      <div className="public-content-container">
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: "40px" }}>⏳</span>
            <h2>Loading artisan details…</h2>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: "40px" }}>⚠️</span>
            <h2>Profile Not Found</h2>
            <p style={{ color: "#666" }}>{error}</p>
            <button
              className="public-back-btn"
              onClick={() => navigate("/chatbot")}
              style={{ marginTop: "14px" }}
            >
              Return to Chatbot
            </button>
          </div>
        )}

        {!loading && !error && worker && (
          <>
            {/* Banned / Suspended Notice */}
            {worker.banned && (
              <div style={{ background: "#fee2e2", border: "1.5px solid #ef4444", color: "#991b1b", padding: "16px 20px", borderRadius: "12px", marginBottom: "22px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>🚫</span>
                <div>
                  <strong style={{ fontSize: "16px" }}>This Artisan's Profile Is Currently Suspended</strong>
                  <div style={{ fontSize: "13px", color: "#7f1d1d", marginTop: "3px" }}>
                    WorkConnect administration has temporarily restricted direct contact with this artisan pending resolution of customer complaints.
                  </div>
                </div>
              </div>
            )}

            {/* Hero Card */}
            <section className="public-hero-card">
              <div className="public-hero-info">
                <div className="public-hero-avatar">
                  {worker.image ? (
                    <img src={worker.image} alt={worker.name} />
                  ) : (
                    getInitials(worker.name)
                  )}
                </div>

                <div className="public-hero-text">
                  <h1>
                    {worker.name}
                    {worker.verified && !worker.banned && (
                      <span className="public-verified-pill">✓ Verified</span>
                    )}
                    {worker.banned && (
                      <span style={{ marginLeft: "10px", background: "#fee2e2", color: "#b91c1c", padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                        🚫 Suspended
                      </span>
                    )}
                  </h1>
                  <p className="public-hero-skill">
                    {worker.skill} · {worker.location}
                  </p>
                  <p style={{ margin: 0, color: "#f59e0b", fontWeight: "700" }}>
                    ★ {worker.rating || "5.0"}{" "}
                    <span style={{ color: "#777", fontWeight: "normal" }}>
                      ({reviews.length} customer review{reviews.length !== 1 ? "s" : ""})
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Call & Report */}
              <div className="public-hero-actions">
                {!worker.banned && worker.phone && (
                  <a
                    className="public-hero-call-btn"
                    href={`tel:${String(worker.phone).replace(/\s/g, "")}`}
                  >
                    📞 Call Artisan: {worker.phone}
                  </a>
                )}
                <button
                  type="button"
                  className="public-hero-report-btn"
                  onClick={() => setShowReportModal(true)}
                  title="Report this artisan to WorkConnect admin"
                >
                  🚨 Report Artisan
                </button>
              </div>
            </section>

            {/* Two Column Grid */}
            <div className="public-grid">
              {/* Left Column: Details */}
              <div>
                {/* About Card */}
                <div className="public-card">
                  <h2 className="public-card-title">👨‍🔧 About this Artisan</h2>
                  <p className="public-card-text">
                    {worker.about || "This verified professional provides reliable craftsmanship in " + worker.skill + " services."}
                  </p>
                </div>

                {/* Availability & Details Card */}
                <div className="public-card">
                  <h2 className="public-card-title">🕒 Service Availability</h2>
                  <div className="public-info-row">
                    <span>📅</span>
                    <span>
                      <strong>Available Days:</strong>{" "}
                      {Array.isArray(worker.available_days) && worker.available_days.length > 0
                        ? worker.available_days.join(", ")
                        : worker.available_days || "Monday – Saturday"}
                    </span>
                  </div>

                  <div className="public-info-row">
                    <span>⏰</span>
                    <span>
                      <strong>Hours:</strong> {worker.working_hours || "08:00 – 18:00"}
                    </span>
                  </div>

                  <div className="public-info-row">
                    <span>🎖️</span>
                    <span>
                      <strong>Experience:</strong> {worker.experience || "3+ years"}
                    </span>
                  </div>

                  {worker.hourly_rate && (
                    <div className="public-info-row">
                      <span>💰</span>
                      <span>
                        <strong>Standard Rate:</strong> {worker.hourly_rate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Portfolio Card */}
                {portfolioPhotos.length > 0 && (
                  <div className="public-card">
                    <h2 className="public-card-title">📷 Work Portfolio Photos</h2>
                    <div className="public-portfolio-grid">
                      {portfolioPhotos.map((url, i) => (
                        <img
                          key={i}
                          className="public-portfolio-img"
                          src={url}
                          alt={`${worker.name} work proof ${i + 1}`}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Customer Reviews + Drop a Review */}
              <div>
                <div className="public-card">
                  <h2 className="public-card-title">
                    💬 Customer Reviews ({reviews.length})
                  </h2>

                  {reviews.length > 0 ? (
                    reviews.map((r, idx) => (
                      <div className="review-card" key={r.id || idx}>
                        <div className="review-header">
                          <span className="reviewer-name">{r.user_name}</span>
                          <span className="review-stars">
                            {"★".repeat(Math.round(r.rating || 5))}
                          </span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#777", fontSize: "14px" }}>
                      No reviews yet for this artisan. Be the first to share your experience below!
                    </p>
                  )}

                  {/* Drop your own review form */}
                  <div className="add-review-box">
                    <h3>Leave a Review for {worker.name}</h3>

                    {reviewError && (
                      <p style={{ color: "#d92d20", fontSize: "13px", margin: "0 0 10px" }}>
                        {reviewError}
                      </p>
                    )}
                    {reviewSuccess && (
                      <p style={{ color: "#027a48", fontSize: "13px", margin: "0 0 10px" }}>
                        {reviewSuccess}
                      </p>
                    )}

                    <form onSubmit={handleSubmitReview}>
                      <div className="review-field">
                        <label>Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Vanessa C."
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                        />
                      </div>

                      <div className="review-field">
                        <label>Your Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                        >
                          <option value="5">★★★★★ (5 Stars - Excellent)</option>
                          <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                          <option value="3">★★★☆☆ (3 Stars - Good)</option>
                          <option value="2">★★☆☆☆ (2 Stars - Fair)</option>
                          <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                        </select>
                      </div>

                      <div className="review-field">
                        <label>Your Experience / Feedback</label>
                        <textarea
                          rows="3"
                          placeholder="Tell others how this artisan performed on your job..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="review-submit-btn"
                        disabled={submittingReview}
                      >
                        {submittingReview ? "Submitting Review…" : "Post Review"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Report Artisan Modal ────────────────────────────────────────── */}
      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🚨</span>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#101432" }}>
                  Report Artisan
                </h2>
              </div>
              <button
                type="button"
                className="report-modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#666", fontSize: "14px", margin: "12px 0 16px" }}>
              File an official incident report against <strong>{worker?.name}</strong> (Trade: {worker?.skill}, Artisan ID: #{worker?.id}). WorkConnect administrators will review this complaint and take corrective action or disciplinary ban if justified.
            </p>

            {reportError && (
              <div style={{ background: "#fef3f2", color: "#b42318", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {reportError}
              </div>
            )}

            {reportSuccess && (
              <div style={{ background: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {reportSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitReport}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                  Reason for Report *
                </label>
                <select
                  style={{ width: "100%", padding: "11px 12px", border: "1px solid #d2d6dc", borderRadius: "8px", fontSize: "14px", background: "#fff" }}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="Unprofessional or Abusive Behavior">Unprofessional or Abusive Behavior</option>
                  <option value="Payment Fraud / Scam / Overcharging">Payment Fraud / Scam / Overcharging</option>
                  <option value="Did Not Show Up / Abandoned Work">Did Not Show Up / Abandoned Work</option>
                  <option value="Poor Quality / Damaged Property">Poor Quality / Damaged Property</option>
                  <option value="Impersonation / Fake Credentials">Impersonation / Fake Credentials</option>
                  <option value="Other Safety or Quality Issue">Other Safety or Quality Issue</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Okeke"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d6dc", borderRadius: "8px", fontSize: "14px" }}
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234..."
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d6dc", borderRadius: "8px", fontSize: "14px" }}
                    value={reportPhone}
                    onChange={(e) => setReportPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                  Your Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d6dc", borderRadius: "8px", fontSize: "14px" }}
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                  Incident Description & Details *
                </label>
                <textarea
                  rows="4"
                  placeholder="Explain clearly what took place: agreed price vs demanded price, damages, safety concerns, or missed job dates..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d6dc", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  style={{ padding: "10px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 22px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}
                  disabled={submittingReport}
                >
                  {submittingReport ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

