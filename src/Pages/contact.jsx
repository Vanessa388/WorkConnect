import { useState } from "react";
import SharedNavbar from "../components/SharedNavbar";
const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please complete your name, email, subject, and message.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send your message.");
      }

      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      <style>{`
        .report-page {
          min-height: 100vh;
          background: #f3eeea;
          color: #111832;
          font-family: Arial, Helvetica, sans-serif;
        }

        .report-page * {
          box-sizing: border-box;
        }

        .report-header {
          min-height: 78px;
          padding: 15px 2%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: #fffdfb;
          box-shadow: 0 2px 8px rgba(25, 20, 15, 0.08);
          position: relative;
          z-index: 5;
        }

        .report-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #111832;
          white-space: nowrap;
        }

        .brand-icon {
          display: grid;
          width: 33px;
          height: 30px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 7px;
          background: #f5682b;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
        }

        .report-brand-name {
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .report-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
        }

        .report-nav a {
          color: #191919;
          text-decoration: none;
          font-size: 16px;
          white-space: nowrap;
          font-weight: 600;
        }

        .report-nav a:hover {
          color: #ed642b;
        }

        .report-issue-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 8px;
          background: #f7652d;
          color: white;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }

        .report-issue-link:hover,
        .report-submit:hover {
          background: #e9531e;
        }

        .report-menu-toggle {
          display: none;
          border: 0;
          background: transparent;
          font-size: 27px;
          cursor: pointer;
          color: #111832;
        }

        .report-intro {
          width: 90%;
          max-width: 90%;
          margin: 0 auto;
          text-align: center;
          padding: 42px 0 30px;
        }

        .report-intro h1 {
          margin: 0 0 12px;
          font-size: clamp(28px, 3.5vw, 44px);
          line-height: 1.2;
          font-weight: 800;
        }

        .report-intro p {
          max-width: 850px;
          margin: 0 auto;
          color: #333333;
          font-size: 17px;
          line-height: 1.5;
        }

        .report-layout {
          width: 90%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 5px 0 36px;
          display: grid;
          grid-template-columns: minmax(220px, 0.85fr)
            minmax(400px, 1.6fr)
            minmax(220px, 0.85fr);
          align-items: center;
          gap: 28px;
        }

        .report-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 22px rgba(40, 30, 20, 0.12);
        }

        .report-side-card {
          padding: 32px 28px;
          min-height: 360px;
        }

        .report-side-card h2 {
          margin: 0 0 27px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          line-height: 1.25;
        }

        .report-side-icon {
          color: #cc825b;
          font-size: 27px;
        }

        .report-reason {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 22px 0;
          font-size: 16px;
          color: #222222;
        }

        .report-check {
          display: inline-flex;
          width: 29px;
          height: 29px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid #d69a76;
          border-radius: 50%;
          color: #c67b51;
          font-size: 18px;
        }

        .report-form-card {
          padding: 32px 36px 24px;
        }

        .report-form-card h2 {
          text-align: center;
          font-size: 28px;
          margin: 0 0 14px;
        }

        .report-field {
          margin-bottom: 12px;
        }

        .report-field label {
          display: block;
          margin-bottom: 7px;
          color: #171717;
          font-size: 16px;
          font-weight: 600;
        }

        .report-field input,
        .report-field select,
        .report-field textarea {
          width: 100%;
          border: 1px solid #c9c9c9;
          border-radius: 7px;
          padding: 13px 14px;
          font: inherit;
          font-size: 16px;
          color: #222222;
          background: #ffffff;
          outline: none;
        }

        .report-field input:focus,
        .report-field select:focus,
        .report-field textarea:focus {
          border-color: #e97849;
          box-shadow: 0 0 0 3px rgba(247, 101, 45, 0.12);
        }

        .report-field textarea {
          resize: vertical;
          min-height: 78px;
        }

        .report-upload-help {
          margin: -2px 0 7px;
          color: #666666;
          font-size: 12px;
        }

        .report-upload {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 78px;
          padding: 13px;
          text-align: center;
          border: 1px dashed #d69a76;
          border-radius: 8px;
          background: #fff9f5;
          cursor: pointer;
        }

        .report-upload:hover {
          background: #fff1e9;
        }

        .report-upload-icon {
          font-size: 23px;
          color: #c97f56;
          margin-bottom: 4px;
        }

        .report-upload strong {
          font-size: 15px;
          margin-bottom: 3px;
        }

        .report-upload span {
          color: #555555;
          font-size: 12px;
        }

        .report-file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          overflow: hidden;
        }

        .report-selected-files {
          margin: 8px 0;
          padding-left: 20px;
          font-size: 12px;
          color: #444444;
          overflow-wrap: anywhere;
        }

        .report-submit {
          width: 100%;
          margin-top: 9px;
          padding: 12px;
          border: 0;
          border-radius: 7px;
          background: #f7652d;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .report-error {
          margin: 10px 0 0;
          color: #b42318;
          font-size: 13px;
        }

        .report-success {
          padding: 24px 8px;
          text-align: center;
        }

        .report-success h3 {
          color: #176b43;
          font-size: 23px;
        }

        .report-success p {
          line-height: 1.6;
          color: #444444;
        }

        .report-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 23px 0;
        }

        .report-step-number {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f7652d;
          color: white;
          font-weight: 700;
        }

        .report-step h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .report-step p {
          margin: 0;
          font-size: 15px;
          line-height: 1.45;
          color: #333333;
        }

        .report-footer {
          min-height: 83px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          background: #e9dcd3;
        }

        .report-footer-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 4px;
          font-size: 21px;
          font-weight: 800;
          color: #111832;
        }

        .report-footer-brand span {
          color: #111832;
          font-size: 23px;
        }

        .report-footer p {
          margin: 0;
          font-size: 13px;
          color: #444444;
        }

        .report-footer-copy {
          font-size: 13px;
          color: #444444;
          text-align: right;
        }


        .about-footer {
          min-height: 140px;
          background: #1f2937;
          color: #ffffff;
          padding: 28px 5% 36px;
        }

        .about-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .about-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 700;
          white-space: nowrap;
        }

        .about-footer-brand .brand-icon {
          display: grid;
          width: 33px;
          height: 30px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 7px;
          background: #f5682b;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
        }

        .about-footer-tagline {
          color: #d1d5db;
          font-size: 14px;
          font-weight: 300;
        }

        .about-footer-copy {
          color: #d1d5db;
          font-size: 14px;
          text-align: right;
        }

        

        

        @media (max-width: 1050px) {
          .report-header {
            flex-wrap: wrap;
          }

          .report-brand-name {
            font-size: 24px;
          }

          .report-nav {
            gap: 16px;
          }

          .report-layout {
            grid-template-columns: minmax(200px, 1fr) minmax(350px, 1.6fr);
          }

          .report-how-card {
            grid-column: 1 / -1;
          }

          .report-how-card .report-steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 720px) {
          .report-header {
            padding: 14px 18px;
          }

          .report-brand-icon {
            font-size: 28px;
          }

          .report-brand-name {
            font-size: 22px;
          }

          .report-menu-toggle {
            display: block;
          }

          .report-header > .report-issue-link {
            display: none;
          }

          .report-nav {
            display: none;
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 0;
            padding: 8px 0;
          }

          .report-nav.report-nav-open {
            display: flex;
          }

          .report-nav a {
            padding: 12px 4px;
          }

          .report-intro {
            padding: 28px 18px 22px;
          }

          .report-intro p {
            font-size: 15px;
          }

          .report-layout {
            grid-template-columns: 1fr;
            padding: 0 16px 24px;
            gap: 18px;
          }

          .report-side-card,
          .report-form-card {
            padding: 22px;
          }

          .report-form-card {
            grid-row: 1;
          }

          .report-side-card h2 {
            font-size: 21px;
          }

          .report-how-card .report-steps {
            display: block;
          }

          .report-footer {
            align-items: flex-start;
            flex-direction: column;
            padding: 20px;
          }

          .report-footer-copy {
            text-align: left;
            line-height: 1.5;
          }
        }

        @media (max-width: 380px) {
          .report-brand-name {
            font-size: 19px;
          }

          .report-form-card {
            padding: 18px 14px;
          }
        }
      `}</style>

      <SharedNavbar />

      <main>
        <section className="report-intro">
          <h1>Contact WorkConnect</h1>
          <p>
            Send questions, account issues, partnership requests, or support
            messages directly to the WorkConnect team.
          </p>
        </section>

        <section className="report-layout">
          <aside className="report-card report-side-card">
            <h2>
              <span className="report-side-icon">♢</span>
              What we handle
            </h2>

            {[
              "Account assistance",
              "Worker profile support",
              "General questions",
              "Partnership enquiries",
            ].map((reason) => (
              <div className="report-reason" key={reason}>
                <span className="report-check">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </aside>

          <section className="report-card report-form-card">
            <h2>Send Us a Message</h2>

            {submitted ? (
              <div className="report-success" role="status">
                <h3>Message sent</h3>
                <p>
                  Thank you for contacting WorkConnect. Our team will review
                  your message and respond using the email address you provided.
                </p>
                <button
                  className="report-submit"
                  type="button"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="report-field">
                  <label htmlFor="contact-name">Your Name</label>
                  <input id="contact-name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" value={form.name} onChange={handleChange} required />
                </div>

                <div className="report-field">
                  <label htmlFor="contact-email">Email Address</label>
                  <input id="contact-email" name="email" type="email" placeholder="name@example.com" autoComplete="email" value={form.email} onChange={handleChange} required />
                </div>

                <div className="report-field">
                  <label htmlFor="contact-phone">Phone Number</label>
                  <input id="contact-phone" name="phone" type="tel" placeholder="Optional phone number" autoComplete="tel" value={form.phone} onChange={handleChange} />
                </div>

                <div className="report-field">
                  <label htmlFor="contact-subject">Subject</label>
                  <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Choose a subject</option>
                    <option value="Account Support">Account Support</option>
                    <option value="Worker Profile Support">Worker Profile Support</option>
                    <option value="Partnership">Partnership</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div className="report-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" placeholder="How can we help?" rows="4" value={form.message} onChange={handleChange} required />
                </div>

                {error && (
                  <p className="report-error" role="alert">
                    {error}
                  </p>
                )}

                <button className="report-submit" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </section>

          <aside className="report-card report-side-card report-how-card">
            <h2>
              <span className="report-side-icon">◷</span>
              How it works
            </h2>

            <div className="report-steps">
              <div className="report-step">
                <span className="report-step-number">1</span>
                <div>
                  <h3>Send a message</h3>
                  <p>Choose a subject and tell us what you need help with.</p>
                </div>
              </div>

              <div className="report-step">
                <span className="report-step-number">2</span>
                <div>
                  <h3>Admin reviews</h3>
                  <p>
                    Our team reviews your message and responds within 1–2 business days.
                  </p>
                </div>
              </div>

              <div className="report-step">
                <span className="report-step-number">3</span>
                <div>
                  <h3>Action taken</h3>
                  <p>
                    We follow up with a resolution and keep you updated via
                    email.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer className="about-footer">
        <div className="about-footer-inner">
          <a className="about-footer-brand" href="/">
            <span className="brand-icon">WC</span>
            <span>WorkConnect</span>

            <p className="about-footer-tagline">
              Connecting Nigeria's Skilled Hands
            </p>
          </a>

          <p className="about-footer-copy">
            © {new Date().getFullYear()} WorkConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
