import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";

export default function SignupPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;

    }

    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match.");
      return;

    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Session cookie set by server — no localStorage needed
      navigate("/chatbot");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to connect to server. Please ensure backend is running.");
    }




  };

  return (
    <div className="signup-page">
      <style>{`
      
      .wc-header {
       width: 100%;
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

        .wc-brand {
            display: inline-flex;
           align-items: center;
            gap: 8px;
             text-decoration: none;
            color: #101432;
            flex-shrink: 0;
      }

        .wc-icon {
           display: grid ;
           width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 7px;
          background: #f5682b;
          color: #fff; 
          font-size: 12px;
          font-weight: 800;
        }

       .wc-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
       }

        .wc-nav {
           display: flex;
           align-items: center;
           justify-content: center; 
           gap: 40px; 
           flex: 1; 
        }

        .wc-nav a {
           color: #292929;
           text-decoration: none;
           font-size: 16px;
           white-space: nowrap;
           font-weight: 600;
        }

        .wc-nav a:hover {
          color: #e56a36;
        }
       

        .signup-page {
          min-height: 100vh;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        background: #fff8ef;
          color: #353535;
          font-family: Arial, Helvetica, sans-serif;
        }

        .signup-page * {
          box-sizing: border-box;
        }

        .signup-page > .navbar {
          width: 100%;
        }

        .signup-card {
          width: calc(100% - 32px);
          max-width: 820px;
          padding: 36px 42px 28px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #eee5dc;
          box-shadow: 0 1px 6px rgba(48, 35, 26, 0.04);
          margin: 44px 16px 30px;
        }

        .signup-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 17px;
          margin-bottom: 14px;
          text-decoration: none;
          color: #353535;
        }

        .signup-brand-icon {
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f0440a;
          color: #ffffff;
          font-size: 39px;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .signup-brand-name {
          font-size: clamp(34px, 5vw, 65px);
          font-weight: 800;
          letter-spacing: -2px;
        }

        .signup-account-switch {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 24px;
        }

        .signup-account-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
        }

        .signup-account-label {
          color: #626262;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
        }

        .signup-type-button {
          width: 150px;
          min-width: 150px;
          min-height: 48px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          border-radius: 40px;
          background: #dedede;
          color: #626262;
          font-size: 16px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .signup-type-button.active {
          background: #f0440a;
          color: #ffffff;
        }

        .signup-type-icon {
          font-size: 22px;
          line-height: 1;
        }

        .signup-type-button strong {
          font-size: 16px;
        }

        .signup-heading {
          margin: 0;
          color: #383838;
          font-size: clamp(32px, 4.5vw, 52px);
          line-height: 1.15;
          letter-spacing: -1.5px;
          text-align: center;
        }

        .signup-subtitle {
          margin: 6px 0 24px;
          color: #777777;
          font-size: 18px;
          text-align: center;
        }

        .signup-form {
          width: 100%;
        }

        .signup-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 22px;
          row-gap: 16px;
        }

        .signup-field label {
          display: block;
          margin-bottom: 7px;
          color: #353535;
          font-size: 16px;
        }

        .signup-field input {
          width: 100%;
          min-width: 0;
          height: 52px;
          padding: 0 15px;
          border: 1px solid #d9d0c7;
          border-radius: 7px;
          outline: none;
          background: #f6f6f6;
          color: #333333;
          font: inherit;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .signup-field input:focus {
          border-color: #f0642d;
          box-shadow: 0 0 0 3px rgba(240, 68, 10, 0.10);
        }

        .signup-field input::placeholder {
          color: #737373;
        }

        .signup-password-wrap {
          display: flex;
          align-items: center;
          height: 52px;
          padding-right: 12px;
          border: 1px solid #d9d0c7;
          border-radius: 7px;
          background: #f6f6f6;
        }

        .signup-password-wrap:focus-within {
          border-color: #f0642d;
          box-shadow: 0 0 0 3px rgba(240, 68, 10, 0.10);
        }

        .signup-password-wrap input {
          height: 100%;
          border: none;
          box-shadow: none;
          background: transparent;
        }

        .signup-password-wrap input:focus {
          border: none;
          box-shadow: none;
        }

        .signup-eye-button {
          flex-shrink: 0;
          padding: 6px;
          border: none;
          background: transparent;
          color: #777777;
          font-size: 19px;
          cursor: pointer;
        }

        .signup-submit {
          width: 100%;
          min-height: 56px;
          margin-top: 24px;
          border: none;
          border-radius: 8px;
          background: #ff4b0b;
          color: #ffffff;
          font-size: 25px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .signup-submit:hover {
          background: #e94108;
        }

        .signup-error {
          margin: 12px 0 0;
          color: #b42318;
          font-size: 14px;
          line-height: 1.5;
        }

        .signup-login {
          margin: 23px 0 0;
          text-align: center;
          color: #777777;
          font-size: 17px;
        }

        .signup-login a {
          margin-left: 7px;
          color: #c9562d;
          font-weight: 600;
          text-decoration: underline;
        }

        .login-footer {
          padding: 20px 20px 22px;
          text-align: center;
          color: #85817e;
          font-size: 18px;
        }

        .wc-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-left: auto;
  color: #101432;
}

@media (max-width: 768px) {
  .wc-header {
    padding: 12px 16px;
  }
  .wc-menu-toggle {
    display: block; 
  }
  .wc-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 18px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
    z-index: 10;
  }
  .wc-nav.active {
    display: flex; 
  }
  .wc-name {
    font-size: 18px;
  }
}

        @media (max-width: 650px) {
          .signup-page {
            padding: 0;
            justify-content: flex-start;
          }

          .signup-card {
            width: calc(100% - 28px);
            max-width: 500px;
            margin: 24px 14px;
            padding: 26px 20px;
            border-radius: 17px;
          }

          .signup-brand {
            gap: 11px;
            margin-bottom: 22px;
          }

          .signup-brand-icon {
            width: 57px;
            height: 57px;
            font-size: 27px;
          }

          .signup-brand-name {
            font-size: clamp(29px, 7vw, 42px);
            letter-spacing: -1.5px;
          }

          .signup-account-switch {
            gap: 9px;
            margin-bottom: 26px;
          }

          .signup-account-option {
            flex: 1;
            min-width: 0;
          }

          .signup-type-button {
            width: 120px;
            min-width: 120px;
            min-height: 46px;
            padding: 7px 9px;
            gap: 7px;
          }

          .signup-type-icon {
            font-size: 20px;
          }

          .signup-type-button strong {
            font-size: 14px;
          }

          .signup-account-label {
            font-size: 12px;
          }

          .signup-heading {
            font-size: 34px;
            letter-spacing: -1px;
          }

          .signup-subtitle {
            margin-bottom: 22px;
            font-size: 16px;
          }

          .signup-fields {
            grid-template-columns: 1fr;
            row-gap: 14px;
          }

          .signup-field label {
            font-size: 15px;
          }

          .signup-field input,
          .signup-password-wrap {
            height: 50px;
          }

          .signup-submit {
            min-height: 53px;
            margin-top: 23px;
            font-size: 21px;
          }

          .signup-login {
            margin-top: 22px;
            font-size: 15px;
          }
        }

        @media (max-width: 360px) {
          .signup-card {
            padding: 22px 15px;
          }

          .signup-brand-name {
            font-size: 28px;
          }

          .signup-type-button {
            padding: 8px;
          }

          .signup-account-label {
            font-size: 11px;
          }

          .signup-heading {
            font-size: 30px;
          }
        }
      `}</style>

      <SharedNavbar />

      <section className="signup-card">
        <div className="signup-account-switch">
          <div className="signup-account-option">
            <span className="signup-account-label">Need a Worker?</span>
            <button
              type="button"
              className={`signup-type-button ${accountType === "customer" ? "active" : ""
                }`}
              onClick={() => setAccountType("customer")}
              aria-pressed={accountType === "customer"}
            >
              <span className="signup-type-icon">♟</span>
              <strong>Customer</strong>
            </button>
          </div>

          <div className="signup-account-option">
            <span className="signup-account-label">Offer your Skill?</span>
            <button
              type="button"
              className="signup-type-button"
              onClick={() => {
                window.location.href = "/become-artisan";
              }}
            >
              <span className="signup-type-icon">⚒</span>
              <strong>Worker</strong>
            </button>
          </div>
        </div>

        <h1 className="signup-heading">Create your account</h1>
        <p className="signup-subtitle">Join as customer</p>

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="signup-fields">
            <div className="signup-field">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-address">Address</label>
              <input
                id="signup-address"
                type="text"
                name="address"
                placeholder="Enter your address"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">Password</label>
              <div className="signup-password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="signup-eye-button"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "◉" : "◉"}
                </button>
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="signup-password-wrap">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="signup-eye-button"
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "◉" : "◉"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          <button className="signup-submit" type="submit">
            Sign Up
          </button>
        </form>

        <p className="signup-login">
          Already have account?
          <a href="/login">Login</a>
        </p>
      </section>

      <footer className="login-footer">WorkConnect</footer>
    </div>
  );
}
