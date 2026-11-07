import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SharedNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        .navbar {
          position: relative;
          z-index: 50;
          display: flex;
          min-height: 55px;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 24px;
          border-bottom: 1px solid #eee5dc;
          background: #fff8ef;
        }

        .navbar .brand {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;
          color: #111111;
          text-decoration: none;
        }

        .navbar .brand-icon {
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

        .navbar .brand-name {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .navbar .desktop-nav,
        .navbar-actions {
          display: flex;
          align-items: center;
        }

        .navbar .desktop-nav {
          gap: 28px;
        }

        .navbar .desktop-nav a {
          color: #171717;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .navbar .desktop-nav a:hover,
        .navbar .login-button:hover {
          color: #f5682b;
        }

        .navbar-actions {
          gap: 12px;
        }

        .navbar .login-button {
          padding: 7px 2px;
          border: none;
          background: transparent;
          color: #171717;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .navbar .signup-button {
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          background: #f5682b;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .navbar .signup-button:hover {
          background: #b93e0f;
        }

        .navbar .menu-toggle {
          display: none;
          width: 34px;
          height: 34px;
          place-items: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #171717;
          font-size: 23px;
          cursor: pointer;
        }

        .navbar .mobile-nav {
          position: absolute;
          top: 100%;
          right: 0;
          left: 0;
          z-index: 30;
          display: none;
          flex-direction: column;
          gap: 0;
          border-bottom: 1px solid #eee5dc;
          background: #fff8ef;
          box-shadow: 0 3px 10px rgba(43, 31, 20, 0.05);
        }

        .navbar .mobile-nav a {
          padding: 14px 20px;
          border-top: 1px solid #f2e9e0;
          color: #171717;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 600px) {
          .navbar {
            min-height: 55px;
            padding: 12px 14px;
            gap: 8px;
          }

          .navbar .brand { gap: 7px; }
          .navbar .brand-icon { width: 30px; height: 29px; }
          .navbar .brand-name { font-size: 16px; }
          .navbar .desktop-nav { display: none; }
          .navbar-actions { gap: 9px; }
          .navbar .login-button { font-size: 11px; }
          .navbar .signup-button {
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 11px;
          }
          .navbar .menu-toggle { display: grid; width: 30px; height: 32px; }
          .navbar .mobile-nav { display: flex; }
        }
      `}</style>

      <header className="navbar">
        <Link to="/" className="brand" aria-label="WorkConnect home">
          <span className="brand-icon">WC</span>
          <span className="brand-name">WorkConnect</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="navbar-actions">
          <button className="login-button" type="button" onClick={() => navigate("/login")}>Login</button>
          <button className="signup-button" type="button" onClick={() => navigate("/signup")}>Sign Up</button>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </nav>
        )}
      </header>
    </>
  );
}
