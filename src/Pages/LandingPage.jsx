import { useState } from "react";
import hero from "../assets/hero.jpeg";
import { Link, useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";

const categories = [
  { name: "Plumber", icon: "🔧" },
  { name: "Electrician", icon: "ϟ" },
  { name: "Tailor", icon: "🪡" },
  { name: "Hair Stylist", icon: "✂" },
  { name: "Barber", icon: "💈" },
  { name: "Carpenter", icon: "⚒" },
  { name: "Welder", icon: "🧰" },
  { name: "Dry Cleaner", icon: "🧺" },
  { name: "Mechanic", icon: "🔩" },
  { name: "Painter", icon: "🖌" },
];

const faqs = [
  {
    q: "How do I know a Worker is verified?",
    a: "Every Worker is verified with ID, skill test and guarantor before joining WorkConnect.",
  },
  {
    q: "Do I need to pay online?",
    a: "No. Please don't pay online. Pay only after your job is done and confirmed.",
  },
  {
    q: "Is it only for Nsukka?",
    a: "WorkConnect helps customers find local workers. Available locations depend on the workers registered on the platform.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "Contact the support team to report the issue and ask about the available resolution options.",
  },
];

const steps = [
  {
    title: "Search what you need",
    description:
      "Type in the service you need and your location to get started.",
  },
  {
    title: "See verified workers",
    description:
      "Browse profiles, ratings, and reviews from trusted local artisans.",
  },
  {
    title: "Connect directly",
    description:
      "Chat and hire the worker, then pay after the job is done and confirmed.",
  },
];

const reasons = [
  {
    title: "Verified & Trusted",
    description:
      "Every Worker is verified with ID and experience checks for your safety.",
  },
  {
    title: "Local & Reliable",
    description: "Find skilled Workers close to you, nearby and available.",
  },
  {
    title: "Pay After Job is Done",
    description:
      "No upfront payments through WorkConnect. Pay after the agreed work is completed.",
  },
];

function Brand({ footer = false }) {
  return (
    <a href="#home" className={`brand ${footer ? "brand-footer" : ""}`}>
      <span className="brand-icon">WC</span>
      <span className="brand-name">WorkConnect</span>
    </a>
  );
}

function Navbar({ onAccountClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <Brand />

      <nav className="desktop-nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className="navbar-actions">
        <button className="login-button" onClick={() => navigate("/login")}>
          Login
        </button>

        <button className="signup-button" onClick={() => navigate("/signup")}>
          Sign Up
        </button>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about" onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </nav>
      )}
      
    </header>
  );
}

function Hero({ }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
   navigate("/login");
  }

  const benefits = [
    "1000+ Verified Workers",
    "4.8/5 Avg Rating",
    "Local & Verified",
  ];

  return (
    <>
      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find trusted Workers near you 
            <span className="highlight-text"> fast, verified and local.</span>
          </h1>

          <p className="hero-description">
            Whatever you need fixed, we have the hands to do it.
          </p>

          <form className="search-form" onSubmit={submitSearch}>
            <label className="search-input-wrapper">
              <span className="search-icon">⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="What service do you need?"
                aria-label="Search for a worker"
              />
            </label>

            <button type="submit" className="find-button">
              Find a Worker
            </button>
          </form>

          <div className="hero-benefits">
            {benefits.map((item) => (
              <div className="benefit-item" key={item}>
                <span className="check-icon">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img
            src={hero}
            alt="Artisan wearing orange workwear and holding tools"
            className="hero-image"
          />
        </div>
      </section>

      <div className="payment-notice">
        <span className="notice-icon">ⓘ</span>
        <p>
          Please don't pay online. Pay only after your job is done and
          confirmed.
        </p>
      </div>
    </>
  );
}

function Categories({ onSelect, activeCategory }) {
  return (
    <section id="services" className="categories-section">
      <h2 className="section-title">Popular Services</h2>
      <div className="categories-grid">
        {categories.map((cat, index) => (
          <button
            key={`${cat.name}-${index}`}
            onClick={() => onSelect(cat.name)}
            aria-pressed={activeCategory === cat.name}
            className={`category-card ${
              activeCategory === cat.name ? "category-active" : ""
            }`}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function NumberedSection({ title, items, id }) {
  return (
    <section id={id} className="numbered-section">
      <h2 className="section-title">{title}</h2>

      <div className="numbered-grid">
        {items.map((item, index) => (
          <article className="numbered-item" key={item.title}>
            <span className="number-circle">{index + 1}</span>

            <div className="numbered-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="faq-section">
      <h2 className="section-title">Frequently Asked Questions</h2>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;

          return (
            <div className="faq-item" key={faq.q}>
              <button
                className="faq-question"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span className="faq-arrow">{isOpen ? "⌃" : "⌄"}</span>
              </button>

              <div
                className={`faq-answer-wrapper ${isOpen ? "open" : ""}`}
                aria-hidden={!isOpen}
              >
                <div className="faq-answer-inner">
                  <p className="faq-answer">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CallToAction({ onFindWorker }) {
  const navigate = useNavigate();
  return (
    <section className="call-to-action">
      <h2>Ready to get work done?</h2>

      <button onClick={() => onFindWorker("")} className="cta-button">
        Find a Worker Now
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-brand-area">
        <Brand footer />

        <span className="footer-tagline">
          Connecting Nigeria's Skilled Hands
        </span>
      </div>

      <p className="copyright">© 2026 WorkConnect. All rights reserved.</p>
    </footer>
  );
}

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("");
  const [notice, setNotice] = useState("");
   const navigate = useNavigate();

  function handleSearch(value) {
     navigate("/login");

    if (!query && !activeCategory) {
      document.getElementById("services")?.scrollIntoView({
        behavior: "smooth",
      });

      setNotice("Choose a service or enter what you need.");
      return;
    }

    const match = categories.find((category) =>
      query.toLowerCase().includes(category.name.toLowerCase()),
    );

    if (match) {
      setActiveCategory(match.name);

      setNotice(
        `${match.name} selected. Connect your worker database to show matching artisans.`,
      );
    } else if (query) {
      setNotice(
        `Search for "${query}" received. Connect a backend to display matching workers.`,
      );
    } else {
      setNotice(
        `${activeCategory} selected. Connect your worker database to show matching artisans.`,
      );
    }

    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCategory(name) {
    setActiveCategory(name);

    setNotice(
      `${name} selected. Worker listings will appear when the backend is connected.`,
    );
  }

  function handleAccountClick(action) {
    setNotice(`${action} page is not connected yet.`);

    window.setTimeout(() => {
      document.getElementById("page-notice")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }

  return (
    <>
      <style>{`
        
        * {
          box-sizing: border-box;
        }

        html {
          width: 100%;
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
        }

        body {
          width: 100%;
          min-width: 320px;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #fff8ef;
          color: #171717;
        }

        #root {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid #f5682b;
          outline-offset: 3px;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .page-container {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #fff8ef;
        }

        .main-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #fff8ef;
        }

        


        .brand {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;
          color: #111111;
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

        .brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .brand-footer {
          color: #ffffff;
        }

        


        .navbar {
          position: relative;
          display: flex;
          min-height: 55px;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 24px;
          border-bottom: 1px solid #eee5dc;
          background: #fff8ef;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .desktop-nav a {
          font-size: 16px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .desktop-nav a:hover {
          color: #f5682b;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-button {
          padding: 7px 2px;
          border: none;
          background: transparent;
          color: #171717;
          font-size: 16px;
          font-weight: 600;
        }

        .login-button:hover {
          color: #f5682b;
        }

        .signup-button {
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          background: #f5682b;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .signup-button:hover,
        .find-button:hover {
          background: #b93e0f;
        }

        .menu-toggle {
          display: none;
          width: 34px;
          height: 34px;
          place-items: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #171717;
          font-size: 23px;
        }

        .mobile-nav {
          position: absolute;
          top: 100%;
          right: 0;
          left: 0;
          z-index: 30;
          display: flex;
          flex-direction: column;
          padding: 12px;
          border-bottom: 1px solid #eee5dc;
          background: #fff8ef;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
        }

        .mobile-nav a {
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }

        .mobile-nav a:hover {
          background: #f8eee5;
        }

       


        .hero-section {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
          align-items: center;
          gap: 24px;
          min-height: 520px;
          padding: 0;
        }

        .hero-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px 24px 24px 48px;
        }

        .hero-title {
          margin: 0;
          max-width: 650px;
          font-size: clamp(48px, 4.5vw, 76px);
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .highlight-text {
          color: #f5682b;
        }

        .hero-description {
          margin: 12px 0 0;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 500;
        }

        .search-form {
          display: flex;
          width: 100%;
          max-width: 520px;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
        }

        .search-input-wrapper {
          display: flex;
          height: 48px;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid #e5d7cb;
          border-radius: 30px;
          background: #fcf5ed;
        }

        .search-icon {
          flex-shrink: 0;
          color: #4d4a46;
          font-size: 20px;
        }

        .search-input-wrapper input {
          width: 100%;
          min-width: 0;
          padding: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #171717;
          font-size: 16px;
        }

        .search-input-wrapper input::placeholder {
          color: #77716b;
        }

        .search-input-wrapper input:focus-visible {
          outline: none;
        }

        .find-button {
          height: 48px;
          flex-shrink: 0;
          padding: 0 14px;
          border: none;
          border-radius: 10px;
          background: #f5682b;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .hero-benefits {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px 14px;
          margin-top: 16px;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 600;
        }

        .check-icon {
          display: grid;
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 50%;
          background: #32965c;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
        }

        .hero-image-wrapper {
          width: 100%;
          max-width: none;
          height: 520px;
          justify-self: stretch;
          overflow: hidden;
          border-radius: 0;
          background: #e7d3c0;
        }

        .hero-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        

        .payment-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 12px;
          background: #ffdfc9;
          text-align: center;
        }

        .notice-icon {
          flex-shrink: 0;
          color: #c96c37;
          font-size: 16px;
        }

        .payment-notice p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
        }

        


        .page-notice {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin: 12px 24px 0;
          padding: 10px 12px;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          background: #fff7ed;
          color: #7c2d12;
          font-size: 11px;
          line-height: 1.6;
        }

        .dismiss-notice {
          flex-shrink: 0;
          padding: 0 2px;
          border: none;
          background: transparent;
          color: inherit;
          font-size: 20px;
          line-height: 1;
        }

       


        .categories-section {
          width: 90%;
          max-width: 90%;
          margin: 0 auto;
          padding: 40px 0 16px;
          scroll-margin-top: 15px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .category-card {
          display: flex;
          min-height: 110px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 8px;
          border: 1px solid transparent;
          border-radius: 11px;
          background: #f8eee5;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
        }

        .category-card:hover {
          border-color: #e9b49a;
          background: #ffeadb;
        }

        .category-card.category-active {
          border-color: #f5682b;
          background: #ffe5d5;
        }

        .category-icon {
          font-size: 34px;
          line-height: 1;
        }

        .category-name {
          font-size: 16px;
          line-height: 1.3;
          font-weight: 600;
          text-align: center;
        }

        


        .numbered-section {
          width: 90%;
          max-width: 90%;
          margin: 0 auto;
          padding: 40px 0;
          border-bottom: 1px solid #eee5dc;
          scroll-margin-top: 15px;
        }

        .section-title {
          margin: 0 0 24px;
          font-size: 32px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.6px;
          text-align: center;
        }

        .numbered-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .numbered-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          min-height: 130px;
          padding: 24px;
          border: none;
          border-radius: 0;
          background: transparent;
        }

        .number-circle {
          display: grid;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 50%;
          background: #f5682b;
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
        }

        .numbered-content {
          min-width: 0;
          padding-top: 2px;
        }

        .numbered-content h3 {
          margin: 0 0 8px;
          font-size: 17px;
          line-height: 1.4;
          font-weight: 700;
        }

        .numbered-content p {
          max-width: 300px;
          margin: 0;
          color: #302923;
          font-size: 15px;
          line-height: 1.5;
        }

        


        .faq-section {
          width: 90%;
          max-width: 90%;
          margin: 0 auto;
          padding: 40px 0 28px;
          scroll-margin-top: 15px;
        }

        .faq-section .section-title {
          margin-bottom: 12px;
        }

        .faq-list {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .faq-item {
          border-bottom: 1px solid #e9ddd1;
        }

        .faq-question {
          display: flex;
          width: 100%;
          min-height: 52px;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 9px 0;
          border: none;
          background: transparent;
          color: #171717;
          font-size: 17px;
          font-weight: 600;
          text-align: left;
        }

        .faq-question:hover {
          color: #e95a20;
        }

        .faq-arrow {
          flex-shrink: 0;
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .faq-question[aria-expanded="true"] .faq-arrow {
          transform: rotate(180deg);
        }

        .faq-answer-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          transition: grid-template-rows 0.35s ease;
        }

        .faq-answer-wrapper.open {
          grid-template-rows: 1fr;
        }

        .faq-answer-inner {
          min-height: 0;
          overflow: hidden;
        }

        .faq-answer {
          max-width: 900px;
          margin: 0;
          padding: 0 20px 16px 0;
          color: #61564e;
          font-size: 15px;
          line-height: 1.7;
        }

        


        .call-to-action {
          width: 90%;
          max-width: 90%;
          min-height: 180px;
          margin: 0 auto 28px;
          padding: 48px 32px;
          border-radius: 16px;
          background: linear-gradient(100deg, #f5682b, #ff581c);
          box-shadow: 0 4px 10px rgba(180, 75, 30, 0.14);
          text-align: center;
        }

        .call-to-action h2 {
          margin: 0 0 20px;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
        }

        .cta-button {
          padding: 14px 24px;
          border: none;
          border-radius: 9px;
          background: #fff8ef;
          color: #d95a27;
          font-size: 17px;
          font-weight: 700;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        


        .footer {
          display: flex;
          min-height: 140px;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 28px 24px 36px;
          margin-bottom: 0;
          background: #1c2938;
          color: #ffffff;
        }

        .footer-brand-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer .brand-name {
          font-size: 22px;
        }

        .footer .brand-icon {
          width: 42px;
          height: 38px;
          font-size: 16px;
        }

        .footer-tagline {
          color: #cbd5e1;
          font-size: 14px;
        }

        .copyright {
          margin: 0;
          color: #cbd5e1;
          font-size: 14px;
          text-align: right;
        }

       




        @media (max-width: 900px) {
          .hero-title {
            font-size: 29px;
          }

          .hero-section {
            grid-template-columns: minmax(0, 1fr) minmax(340px, 0.95fr);
            gap: 0;
            min-height: 460px;
            padding: 0;
          }

          .hero-content {
            padding: 36px 32px;
          }

          .hero-image-wrapper {
            height: 460px;
            min-height: 460px;
            max-width: none;
            border-radius: 0;
          }

          .categories-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .numbered-grid {
            gap: 14px;
          }

          .numbered-item {
            gap: 7px;
          }
        }

        


        @media (max-width: 600px) {
          .navbar {
            min-height: 55px;
            padding: 12px 14px;
            gap: 8px;
          }

          .brand {
            gap: 7px;
          }

          .brand-icon {
            width: 30px;
            height: 29px;
          }

          .brand-name {
            font-size: 16px;
          }

          .desktop-nav {
            display: none;
          }

          .navbar-actions {
            gap: 9px;
          }

          .login-button {
            font-size: 11px;
          }

          .signup-button {
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 11px;
          }

          .menu-toggle {
            display: grid;
            width: 30px;
            height: 32px;
          }

          .hero-section {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
            min-height: auto;
            padding: 24px 16px 20px;
          }

          .hero-content {
            padding: 0;
          }

          .hero-title {
            font-size: 30px;
            line-height: 1.08;
          }

          .hero-description {
            margin-top: 10px;
            font-size: 14px;
          }

          .search-form {
            max-width: none;
            gap: 7px;
          }

          .search-input-wrapper {
            height: 44px;
            gap: 8px;
            padding: 0 12px;
          }

          .search-input-wrapper input {
            font-size: 14px;
          }

          .find-button {
            height: 44px;
            padding: 0 14px;
            font-size: 13px;
          }

          .hero-benefits {
            gap: 9px 12px;
            margin-top: 14px;
          }

          .benefit-item {
            font-size: 12px;
          }

          .hero-image-wrapper {
            width: 100%;
            max-width: none;
            height: 230px;
            min-height: 230px;
            border-radius: 16px;
          }

          .payment-notice {
            padding: 11px 12px;
            gap: 7px;
          }

          .payment-notice p {
            font-size: 11px;
          }

          .categories-section {
            width: calc(100% - 32px);
            max-width: 92%;
            padding: 24px 0 12px;
          }

          .categories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .category-card {
            min-height: 96px;
          }

          .numbered-section {
            width: calc(100% - 32px);
            max-width: 92%;
            padding: 28px 0;
          }

          .section-title {
            margin-bottom: 20px;
            font-size: 21px;
          }

          .numbered-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 19px;
          }

          .numbered-item {
            gap: 10px;
          }

          .numbered-content h3 {
            font-size: 12px;
          }

          .numbered-content p {
            max-width: none;
            font-size: 11px;
          }

          .faq-section {
            width: calc(100% - 32px);
            max-width: 92%;
            padding: 28px 0 18px;
          }

          .faq-section .section-title {
            font-size: 20px;
          }

          .faq-question {
            min-height: 40px;
            font-size: 12px;
          }

          .page-notice {
            margin-right: 14px;
            margin-left: 14px;
          }

          .call-to-action {
            width: 92%;
            max-width: 92%;
            min-height: 150px;
            margin: 0 auto 20px;
            padding: 32px 16px;
          }

          .call-to-action h2 {
            font-size: 22px;
          }

          .cta-button {
            font-size: 15px;
          }

          .footer {
            min-height: 180px;
            align-items: flex-start;
            flex-direction: column;
            justify-content: center;
            gap: 14px;
            padding: 32px 16px 36px;
          }

          .footer-brand-area {
            flex-wrap: wrap;
            gap: 8px;
          }

          .footer .brand-name {
            font-size: 20px;
          }

          .footer-tagline {
            font-size: 12px;
          }

          .copyright {
            font-size: 12px;
            text-align: left;
          }
        }

       


        @media (max-width: 360px) {
          .brand-name {
            font-size: 14px;
          }

          .navbar-actions {
            gap: 6px;
          }

          .signup-button {
            padding: 7px 8px;
          }

          .hero-title {
            font-size: 27px;
          }

          .search-form {
            flex-wrap: wrap;
          }

          .search-input-wrapper {
            flex-basis: 100%;
          }

          .find-button {
            width: 100%;
          }

          .hero-image-wrapper {
            height: 195px;
          }
        }
      `}</style>

      <div className="page-container">
        <div className="main-container">
          <SharedNavbar />

          <main>
            <Hero onSearch={handleSearch} />

            {notice && (
              <div id="page-notice" className="page-notice" role="status">
                <span>{notice}</span>

                <button
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                  className="dismiss-notice"
                >
                  ×
                </button>
              </div>
            )}

            <Categories
              activeCategory={activeCategory}
              onSelect={handleCategory}
            />

            <NumberedSection
              title="How It Works"
              items={steps}
              id="how-it-works"
            />

            <NumberedSection
              title="Why Choose Us"
              items={reasons}
              id="why-us"
            />

            <FAQ />

            <CallToAction onFindWorker={handleSearch} />
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
