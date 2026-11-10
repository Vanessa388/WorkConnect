import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";

export default function WorkerSignupPage() {
  const navigate = useNavigate();
  const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "Nsukka, Enugu",
    skill: "Electrician",
    experience: "3 years",
    description: "",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "08:00",
    endTime: "18:00",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const skills = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Welder",
    "Mechanic",
    "Tailor",
    "Cleaner",
    "Hairdresser",
    "AC Technician",
    "Phone Repairer",
    "Other",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleDayChange = (day) => {
    setFormData((previousData) => {
      const alreadySelected = previousData.days.includes(day);

      return {
        ...previousData,
        days: alreadySelected
          ? previousData.days.filter((selectedDay) => selectedDay !== day)
          : [...previousData.days, day],
      };
    });
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please choose a JPG, PNG, or WEBP image for your profile photo.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile photo must be 5MB or smaller.");
        return;
      }
      setProfilePhoto(file);
      setError("");
    }
  };
  const handlePhotoChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const availableSlots = 4 - photos.length;

    if (selectedFiles.length > availableSlots) {
      setError("You can upload a maximum of 4 portfolio photos.");
      event.target.value = "";
      return;
      event.target.value = "";

    }

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );


    if (validFiles.length !== selectedFiles.length) {
      setError("Please choose JPG, PNG, or WEBP images only.");
      event.target.value = "";
      return;
      event.target.value = "";

    }

    const oversizedFile = validFiles.some(
      (file) => file.size > 5 * 1024 * 1024
    );


    if (oversizedFile) {
      setError("Each photo must be 5MB or smaller.");
      event.target.value = "";
      return;
      event.target.value = "";

    }

    setPhotos((previousPhotos) => [...previousPhotos, ...validFiles]);
    setError("");
    event.target.value = "";
  };

  const removePhoto = (photoIndex) => {
    setPhotos((previousPhotos) =>
      previousPhotos.filter((_, index) => index !== photoIndex)
    );

  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (formData.password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;

    }

    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match.");
      return;

    }

    if (formData.days.length === 0) {
      setError("Please select at least one available day.");
      return;

    }

    if (formData.startTime >= formData.endTime) {
      setError("Your finishing time must be later than your starting time.");
      return;

    }

    if (!formData.description.trim()) {
      setError("Please describe the work you do.");
      return;

    }



    try {
      setLoading(true);

      // 1. Upload the dedicated profile photo
      let profileImageUrl = "";
      if (profilePhoto) {
        const profileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(profilePhoto);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        const profileUploadRes = await fetch(
          `${apiUrl}/api/workers/upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: profileBase64,
              fileName: profilePhoto.name || "profile-photo.jpg",
            }),
          },
        );

        const profileUploadData = await profileUploadRes.json();
        if (profileUploadData.success && profileUploadData.imageUrl) {
          profileImageUrl = profileUploadData.imageUrl;
        }
      }

      // 2. Upload portfolio photos separately
      const portfolioUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        const uploadRes = await fetch(
          `${apiUrl}/api/workers/upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64,
              fileName: file.name || `worker-photo-${i}.jpg`,
            }),
          },
        );

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrl) {
          portfolioUrls.push(uploadData.imageUrl);
        }
      }

      // 2. Register artisan user account
      const authRes = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: normalizedEmail,
          password: formData.password,
          phone: formData.phone,
          role: "artisan",
        }),
      });

      const authData = await authRes.json();
      let userId = authData.user ? authData.user.id : null;

      if (!authRes.ok || !authData.success) {
        const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok || !loginData.success || loginData.user?.role !== "artisan") {
        setError(authData.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
        }

        userId = loginData.user.id;
      }

      // 3. Create artisan profile in workers table
      const workerRes = await fetch(`${apiUrl}/api/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          name: formData.fullName,
          skill: formData.skill,
          location: formData.location,
          phone: formData.phone,
          email: normalizedEmail,
          about: formData.description,
          experience: formData.experience,
          image: profileImageUrl,
          portfolio: portfolioUrls,
          available_days: formData.days,
          working_hours: `${formData.startTime} - ${formData.endTime}`,
        }),
      });

      const workerData = await workerRes.json();
      if (!workerRes.ok || !workerData.success) {
        setError(workerData.message || "Your account was created, but the worker profile could not be created.");
        setLoading(false);
        return;
      }

      // Session cookie set by server — no localStorage needed
      setLoading(false);
      navigate("/worker-profile");
    } catch (err) {
      console.error("Worker registration error:", err);
      setError("Unable to connect to server. Please check backend connection.");
      setLoading(false);
    }


  };

  return (
    <div className="worker-signup-page">
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
       
        .wc-menu-toggle {
           display: none;
           }



        .worker-signup-page {
          min-height: 100vh;
          background: #fff8ef;
          color: #101432;
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 0 0 0;
        }

        .worker-signup-page * {
          box-sizing: border-box;
          
        }

        .worker-signup-container {
          width: calc(100% - 40px);
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 0 36px;
        }

        .worker-signup-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 25px;
          color: #101432;
          text-decoration: none;
        }

        .worker-signup-brand-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: #f4510b;
          color: white;
          font-size: 29px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .worker-signup-brand-name {
          font-size: clamp(30px, 5vw, 46px);
          font-weight: 800;
          letter-spacing: -1.8px;
        }

        .worker-signup-heading {
          margin: 0;
          text-align: center;
          font-size: clamp(34px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .worker-signup-subtitle {
          margin: 10px 0 30px;
          text-align: center;
          color: #62605e;
          font-size: 18px;
        }

        .worker-section {
          margin-bottom: 18px;
          padding: 24px;
          border: 1px solid #eee2d7;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: none;
        }

        .worker-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 22px;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.2;
        }

        .worker-section-icon {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f4510b;
          color: #ffffff;
          font-size: 17px;
        }

        .worker-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 20px;
        }

        .worker-field {
          min-width: 0;
        }

        .worker-field label,
        .worker-field-label {
          display: block;
          margin-bottom: 8px;
          color: #202020;
          font-size: 15px;
          font-weight: 700;
        }

        .worker-field input,
        .worker-field select,
        .worker-field textarea {
          width: 100%;
          min-width: 0;
          min-height: 48px;
          padding: 12px 13px;
          border: 1px solid #cfc7bf;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #252525;
          font: inherit;
          font-size: 15px;
        }

        .worker-field input:focus,
        .worker-field select:focus,
        .worker-field textarea:focus {
          border-color: #f4510b;
          box-shadow: 0 0 0 2px rgba(244, 81, 11, 0.10);
        }

        .worker-field textarea {
          min-height: 120px;
          resize: vertical;
        }

        .worker-full-width {
          grid-column: 1 / -1;
        }

        .worker-password-wrap {
          display: flex;
          align-items: center;
          border: 1px solid #bcbcbc;
          border-radius: 6px;
        }

        .worker-password-wrap:focus-within {
          border-color: #f4510b;
          box-shadow: 0 0 0 2px rgba(244, 81, 11, 0.10);
        }

        .worker-password-wrap input {
          min-width: 0;
          border: none;
          box-shadow: none;
        }

        .worker-password-wrap input:focus {
          border: none;
          box-shadow: none;
        }

        .worker-password-toggle {
          padding: 7px 10px;
          border: none;
          background: transparent;
          color: #555555;
          cursor: pointer;
          font-size: 17px;
        }

        .worker-days {
          display: flex;
          flex-wrap: wrap;
          gap: 9px 12px;
          margin: 0 0 15px;
        }

        .worker-day {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #292929;
          font-size: 12px;
          cursor: pointer;
        }

        .worker-day input {
          width: 16px;
          height: 16px;
          margin: 0;
          accent-color: #f4510b;
          cursor: pointer;
        }

        .worker-time-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .worker-time-field {
          min-width: 0;
        }

        .worker-time-field label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
          font-weight: 600;
        }

        .worker-time-field select {
          width: 100%;
          min-height: 36px;
          padding: 6px 8px;
          border: 1px solid #bcbcbc;
          border-radius: 6px;
          background: #ffffff;
          font-size: 13px;
        }

        .worker-portfolio {
          margin-bottom: 18px;
          padding: 24px;
          border: 1px solid #eee2d7;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: none;
        }

        .worker-portfolio-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0 4px;
          font-size: 22px;
          font-weight: 800;
        }

        .worker-portfolio-note {
          margin: 0 0 16px 50px;
          color: #62605e;
          font-size: 15px;
          line-height: 1.5;
        }

        .worker-photo-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .worker-photo-slot {
          position: relative;
          min-width: 0;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px dashed #bcbcbc;
          border-radius: 9px;
          background: #ffffff;
        }

        .worker-photo-slot label {
          width: 100%;
          height: 100%;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #333333;
          font-size: 12px;
          text-align: center;
          cursor: pointer;
        }

        .worker-photo-icon {
          color: #d36d39;
          font-size: 27px;
          line-height: 1;
        }

        .worker-photo-slot input {
          display: none;
        }

        .worker-photo-preview {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .worker-photo-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 25px;
          height: 25px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.75);
          color: #ffffff;
          cursor: pointer;
          z-index: 1;
        }

        .worker-submit {
          width: 100%;
          min-height: 60px;
          margin-top: 20px;
          border: none;
          border-radius: 10px;
          background: #ff4b0b;
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(244, 81, 11, 0.15);
          transition: background 0.2s;
        }

        .worker-submit:hover {
          background: #e74308;
        }

        .worker-error {
          margin: 12px 0 0;
          color: #b42318;
          font-size: 13px;
          line-height: 1.5;
        }

        .worker-login-link {
          margin: 19px 0 0;
          text-align: center;
          color: #666666;
          font-size: 14px;
        }

        .worker-login-link a {
          margin-left: 5px;
          color: #c9562d;
          font-weight: 700;
          text-decoration: underline;
        }

         .login-footer {
          margin-top: 10px;
          padding: 28px 20px 34px;
          text-align: center;
          color: #85817e;
          font-size: 18px;
          background: #ffffff;
          border-top: 1px solid #eee5dc;
        }

      



        @media (max-width: 768px) {
  

  .wc-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    width: 100%;
    flex-direction: column;
    background: white;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    z-index: 9999;
  }

  .wc-nav.active {
    display: flex;
  }
}


        @media (max-width: 520px) {
          .wc-menu-toggle {
          display: block; 
         }
           
          .worker-signup-page {
            padding: 0;
          }

          .worker-signup-container {
            width: calc(100% - 24px);
            padding: 30px 0 28px;
          }

          .worker-signup-brand {
            gap: 10px;
            margin-bottom: 23px;
          }

          .worker-signup-brand-icon {
            width: 49px;
            height: 49px;
            border-radius: 12px;
            font-size: 22px;
          }

          .worker-signup-brand-name {
            font-size: clamp(26px, 7vw, 34px);
            letter-spacing: -1.2px;
          }

          .worker-signup-heading {
            font-size: 28px;
          }

          .worker-signup-subtitle {
            font-size: 15px;
            line-height: 1.5;
          }

          .worker-section,
          .worker-portfolio {
            padding: 16px 14px;
            border-radius: 12px;
          }

          .worker-section-heading,
          .worker-portfolio-heading {
            font-size: 17px;
          }

          .worker-portfolio-note {
            margin-left: 48px;
          }

          .worker-form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .worker-full-width {
            grid-column: auto;
          }

          .worker-photo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .worker-photo-slot,
          .worker-photo-slot label {
            min-height: 120px;
          }

          .worker-days {
            gap: 11px 12px;
          }

          .worker-day {
            font-size: 12px;
          }

          .worker-time-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .worker-submit {
            min-height: 53px;
            font-size: 20px;
          }
        }
      `}</style>

      <SharedNavbar />

      <div className="worker-signup-container">
        <h1 className="worker-signup-heading">Create Your Worker Profile</h1>

        <p className="worker-signup-subtitle">
          Sign up and your profile will be created immediately.
        </p>

        <form onSubmit={handleSubmit}>
          <section className="worker-section">
            <h2 className="worker-section-heading">
              <span className="worker-section-icon">♟</span>
              <span>Section 1 — Personal Information</span>
            </h2>

            <div className="worker-form-grid">
              <div className="worker-field" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "20px", padding: "8px 0 16px" }}>
                <div style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  backgroundColor: "#fff0e6",
                  border: "2px dashed #f4510b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {profilePhoto ? (
                    <img
                      src={URL.createObjectURL(profilePhoto)}
                      alt="Profile preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "36px" }}>👤</span>
                  )}
                </div>
                <div>
                  <label htmlFor="worker-avatar-input" style={{ fontWeight: "700", color: "#101432", display: "block", marginBottom: "5px", fontSize: "15px" }}>
                    Profile Photo (Your Picture)
                  </label>
                  <input
                    id="worker-avatar-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleProfilePhotoChange}
                    style={{ fontSize: "14px" }}
                  />
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#777" }}>
                    This will be shown to customers as your official profile picture.
                  </p>
                </div>
              </div>

              <div className="worker-field">
                <label htmlFor="worker-name">Full Name</label>
                <input
                  id="worker-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="worker-field">
                <label htmlFor="worker-email">Email</label>
                <input
                  id="worker-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="worker-field">
                <label htmlFor="worker-phone">Phone Number</label>
                <input
                  id="worker-phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="worker-field worker">
                <label htmlFor="worker-location">Location</label>
                <select
                  id="worker-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="Nsukka, Enugu">Nsukka, Enugu</option>
                  <option value="Enugu, Enugu">Enugu, Enugu</option>
                  <option value="Awka, Anambra">Awka, Anambra</option>
                  <option value="Onitsha, Anambra">Onitsha, Anambra</option>
                  <option value="Abuja, FCT">Abuja, FCT</option>
                  <option value="Lagos, Lagos">Lagos, Lagos</option>
                  <option value="Other">Other location</option>
                </select>
              </div>

              <div className="worker-field">
                <label htmlFor="worker-password">Password</label>
                <div className="worker-password-wrap">
                  <input
                    id="worker-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    className="worker-password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    ◉
                  </button>
                </div>
              </div>

              <div className="worker-field">
                <label htmlFor="worker-confirm-password">
                  Confirm Password
                </label>

                <div className="worker-password-wrap">
                  <input
                    id="worker-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    className="worker-password-toggle"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    ◉
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="worker-section">
            <h2 className="worker-section-heading">
              <span className="worker-section-icon">⚒</span>
              Section 2 — Your Work
            </h2>

            <div className="worker-form-grid">
              <div className="worker-field">
                <label htmlFor="worker-skill">
                  What work do you do? — Skill
                </label>
                <select
                  id="worker-skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  required
                >
                  {skills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div className="worker-field">
                <label htmlFor="worker-experience">Years of Experience</label>
                <select
                  id="worker-experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                >
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="4 years">4 years</option>
                  <option value="5 years">5 years</option>
                  <option value="6–10 years">6–10 years</option>
                  <option value="More than 10 years">More than 10 years</option>
                </select>
              </div>

              <div className="worker-field worker-full-width">
                <label htmlFor="worker-description">About Your Work</label>
                <textarea
                  id="worker-description"
                  name="description"
                  placeholder="Briefly describe your experience, services you offer, and specialities..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={1000}
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 3: Availability */}
          <section className="worker-section">
            <h2 className="worker-section-heading">
              <span className="worker-section-icon">▦</span>
              Section 3 — Availability
            </h2>

            <span className="worker-field-label">Days Available:</span>

            <div className="worker-days">
              {daysOfWeek.map((day) => (
                <label className="worker-day" key={day}>
                  <input
                    type="checkbox"
                    checked={formData.days.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  {day}
                </label>
              ))}
            </div>

            <span className="worker-field-label">Time Available:</span>

            <div className="worker-time-row">
              <div className="worker-time-field">
                <label htmlFor="worker-start-time">From</label>
                <select
                  id="worker-start-time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                >
                  {Array.from({ length: 24 }, (_, hour) => {
                    const value = `${String(hour).padStart(2, "0")}:00`;
                    return (
                      <option key={value} value={value}>
                        {new Date(`2000-01-01T${value}:00`).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </option>
                    );

                  })}
                </select>
              </div>

              <div className="worker-time-field">
                <label htmlFor="worker-end-time">To</label>
                <select
                  id="worker-end-time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                >
                  {Array.from({ length: 24 }, (_, hour) => {
                    const value = `${String(hour).padStart(2, "0")}:00`;
                    return (
                      <option key={value} value={value}>
                        {new Date(`2000-01-01T${value}:00`).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </option>
                    );

                  })}
                </select>
              </div>
            </div>
          </section>

          {/* Section 4: Portfolio photos */}
          <section className="worker-portfolio">
            <h2 className="worker-portfolio-heading">
              <span className="worker-section-icon">▣</span>
              Section 4 — Portfolio
            </h2>

            <p className="worker-portfolio-note">
              Your Work Photos — add up to 4 photos to showcase your work
            </p>

            <div className="worker-photo-grid">
              {Array.from({ length: 4 }, (_, index) => {
                const photo = photos[index];

                return (
                  <div className="worker-photo-slot" key={index}>
                    {photo ? (
                      <>
                        <img
                          className="worker-photo-preview"
                          src={URL.createObjectURL(photo)}
                          alt={`Portfolio work ${index + 1}`}
                        />
                        <button
                          className="worker-photo-remove"
                          type="button"
                          onClick={() => removePhoto(index)}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <label htmlFor={`worker-photo-${index}`}>
                        <span className="worker-photo-icon">📷</span>
                        <span>+ Add Photo</span>
                        <input
                          id={`worker-photo-${index}`}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    )}
                  </div>
                );
            
              })}
            </div>
          </section>

          {error && (
            <p className="worker-error" role="alert">
              {error}
            </p>
          )}

          <button className="worker-submit" type="submit">
            Create My Profile
          </button>
        </form>

        <p className="worker-login-link">
          Already have an account?
          <a href="/login">Login</a>
        </p>
      </div>

      <footer className="login-footer">WorkConnect</footer>
    </div>
  );
}
