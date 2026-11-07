import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
      event.preventDefault();
      setError("");

      if (!email.trim() || !password) {
        setError("Please enter your email and password.");
        return;
      }

      setLoading(true);

      
      //  replace with real API / Firebase check
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // sends/receives the HTTP-only session cookie
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Login failed. Please check your credentials.");
          return;
        }

        // Cookie is set by the server automatically — no localStorage needed
        // Redirect based on user role from server response
        if (data.user.role === "artisan") {
          navigate("/worker-profile");
        } else {
          navigate("/chatbot");
        }



      } catch (err) {
        console.error("Login error:", err);
        setError("Unable to connect to server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }


        


    };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fff8ef;
          color: #101432;
          font-family: Arial, Helvetica, sans-serif;
        }

        .login-page * {
          box-sizing: border-box;
        }

      


        .login-header {
          min-height: 100px;
          padding: 18px 3%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: #ffffff;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
          position: relative;
          z-index: 5;
        }

        .login-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #101432;
          flex-shrink: 0;
        }

        .login-brand-icon {
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

        .login-brand-name {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1.4px;
        }

        .login-nav {
           display: flex;
           align-items: center;
           gap: 27px;
           position: absolute;
           left: 50%;
           transform: translateX(-50%);
        }

        .login-nav a {
           color: #292929;
           text-decoration: none;
           font-size: 16px;
           white-space: nowrap;
           font-weight: 600;
        }

        .login-nav a:hover {
           color: #e56a36;
       }

        .login-report-link {
          padding: 11px 18px;
          border: 2px solid #d88760;
          border-radius: 9px;
          color: #c96536 !important;
          font-weight: 600;
        }

        .login-report-link:hover {
          background: #fff2eb;
        }

        .login-menu-button {
          display: none;
          padding: 5px;
          border: none;
          background: transparent;
          color: #101432;
          font-size: 28px;
          cursor: pointer;
        }

        


        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 55px 20px 35px;
        }

        .login-card {
          width: 100%;
          max-width: 810px;
          padding: 43px 50px 30px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 1px 5px rgba(48, 35, 26, 0.05);
        }

        .login-card h1 {
          margin: 0 0 5px;
          text-align: center;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .login-subtitle {
          margin: 0 0 25px;
          text-align: center;
          color: #555555;
          font-size: 22px;
        }

        .login-form {
          max-width: 483px;
          margin: 0 auto;
        }

        .login-field {
          margin-bottom: 20px;
        }

        .login-field label {
          display: block;
          margin-bottom: 8px;
          color: #292929;
          font-size: 16px;
        }

        .login-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 49px;
          padding: 0 13px;
          border: 1px solid #a8a8a8;
          border-radius: 6px;
          background: #f8f8f8;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-input-wrap:focus-within {
          border-color: #ed713c;
          box-shadow: 0 0 0 3px rgba(243, 107, 53, 0.12);
        }

        .login-input-icon {
          color: #777777;
          font-size: 22px;
          flex-shrink: 0;
        }

        .login-input-wrap input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #222222;
          font: inherit;
          font-size: 16px;
        }

        .login-input-wrap input::placeholder {
          color: #858585;
        }

        .login-password-toggle {
          padding: 5px;
          border: none;
          background: transparent;
          color: #666666;
          font-size: 19px;
          cursor: pointer;
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: -1px 0 23px;
          font-size: 15px;
        }

        .login-remember {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #292929;
          cursor: pointer;
        }

        .login-remember input {
          width: 20px;
          height: 20px;
          accent-color: #f36b35;
          cursor: pointer;
        }

        .login-forgot {
          color: #c96839;
          text-decoration: none;
          white-space: nowrap;
        }

        .login-forgot:hover,
        .login-signup a:hover {
          text-decoration: underline;
        }

        .login-submit {
          width: 100%;
          min-height: 55px;
          border: none;
          border-radius: 7px;
          background: #ff6429;
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: none;
          transition: background 0.2s;
        }

        .login-submit:hover {
          background: #e95520;
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-error {
          margin: 13px 0 0;
          color: #b42318;
          font-size: 14px;
          line-height: 1.5;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 18px;
          margin: 22px 0 19px;
          color: #777777;
          font-size: 16px;
        }

        .login-divider::before,
        .login-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #c9c9c9;
        }

        .login-signup {
          margin: 0;
          text-align: center;
          color: #666666;
          font-size: 17px;
        }

        .login-signup a {
          margin-left: 5px;
          color: #c96839;
          text-decoration: underline;
        }

        
        .login-footer {
          padding: 10px 20px 22px;
          text-align: center;
          color: #85817e;
          font-size: 18px;
        }



        @media (max-width: 1050px) {
          .login-header {
            flex-wrap: wrap;
          }

          .login-brand-name {
            font-size: 27px;
          }

          .login-nav {
            gap: 17px;
          }

          .login-nav a {
            font-size: 14px;
          }
        }

        @media (max-width: 760px) {
          .login-header {
            min-height: 75px;
            padding: 15px 20px;
          }

          .login-brand-icon {
            font-size: 31px;
          }

          .login-brand-name {
            font-size: 24px;
          }

          .login-menu-button {
            display: block;
          }

          .login-nav {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
          }

          .login-nav.login-nav-open {
            display: flex;
          }

          .login-nav a {
            padding: 12px 4px;
            font-size: 15px;
          }

          .login-report-link {
            display: inline-block;
            align-self: flex-start;
          }

          .login-main {
            padding: 35px 16px;
          }

          .login-card {
            max-width: 560px;
            padding: 35px 28px 28px;
            border-radius: 15px;
          }

          .login-card h1 {
            letter-spacing: -1px;
          }

          .login-subtitle {
            font-size: 19px;
            margin-bottom: 28px;
          }
        }

        @media (max-width: 420px) {
          .login-brand-name {
            font-size: 21px;
          }

          .login-brand-icon {
            font-size: 16px;
          }

          .login-card {
            padding: 29px 19px 25px;
          }

          .login-card h1 {
            font-size: 31px;
          }

          .login-subtitle {
            font-size: 17px;
          }

          .login-field label {
            font-size: 15px;
          }

          .login-input-wrap input {
            font-size: 14px;
          }

          .login-options {
            font-size: 13px;
          }

          .login-remember {
            gap: 6px;
          }

          .login-remember input {
            width: 18px;
            height: 18px;
          }

          .login-submit {
            min-height: 50px;
            font-size: 19px;
          }

          .login-signup {
            font-size: 14px;
          }

          .login-nav {
            position: fixed;
            left: 0;
            top: 56px;
            width: 100%;
            transform: none;
            background: white;
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
            display: none;
          }

          .login-nav.open {
           display: flex;
          }
          }

        }
      `}</style>

      <SharedNavbar />

      <main className="login-main">
        <section className="login-card">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Login to continue</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  ✉
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  ♙
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "◉" : "◉"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>

              <a className="login-forgot" href="/forgot-password">
                Forgot password?
              </a>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <div className="login-divider">Or</div>

            <p className="login-signup">
              Don't have an account?
              <a href="/signup">Sign up</a>
            </p>
          </form>
        </section>
      </main>

      <footer className="login-footer">WorkConnect</footer>
    </div>
  );
}
