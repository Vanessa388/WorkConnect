import { useState, useEffect } from "react";
import defaultArtisanPhoto from "../assets/worker-profile.jpg";

export default function WorkerProfileCards() {
  const [workerList, setWorkerList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("All Professions");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  useEffect(() => {
    fetch("http://localhost:5000/api/workers")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((w) => ({
            id: w.id,
            name: w.name,
            profession: w.skill || w.profession || "Artisan",
            location: w.location || "Nsukka",
            rating: w.rating ? String(w.rating) : "4.8",
            reviews: w.reviews || 1,
            verified: w.verified !== false,
            image: w.image || defaultArtisanPhoto,
          }));
          setWorkerList(formatted);
        }
      })
      .catch((err) => {
        console.warn("Workers fetch notice (using defaults):", err.message);
      });
  }, []);

  const professions = [
    "All Professions",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Mechanic",
    "Hairdresser",
  ];

  const locations = ["All Locations", "Nsukka", "Enugu"];

  const filteredWorkers = workerList.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProfession =
      selectedProfession === "All Professions" ||
      worker.profession === selectedProfession;

    const matchesLocation =
      selectedLocation === "All Locations" ||
      worker.location === selectedLocation;

    return matchesSearch && matchesProfession && matchesLocation;
  });

  function openWorkerProfile(worker) {
    // Change this path if your profile route uses a different URL.
    window.location.href = `/worker/${worker.id}`;
  }

  return (
    <div className="worker-cards-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .worker-cards-page {
          min-height: 100vh;
          padding: 0 0 35px;
          background: #fafafa;
          color: #242833;
          font-family: Arial, Helvetica, sans-serif;
        }

        .workers-header {
          width: 100%;
          min-height: 90px;
          padding: 16px 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #ffffff;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.06);
          border-radius: 0 0 12px 12px;
        }

        .workers-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .workers-brand-mark {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #f47721;
          color: #ffffff;
          font-size: 23px;
          font-weight: 700;
        }

        .workers-brand h1 {
          margin: 0;
          color: #20232c;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -1px;
        }

        .workers-header-icons {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .workers-icon-button {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #555b64;
          cursor: pointer;
        }

        .workers-icon-button:hover {
          background: #f4f4f4;
        }

        .workers-icon-button svg {
          width: 25px;
          height: 25px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .workers-content {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 48px 5% 0;
        }

        .workers-title {
          margin: 0 0 12px;
          font-size: 34px;
          font-weight: 650;
          letter-spacing: -0.8px;
        }

        .workers-description {
          margin: 0;
          color: #737b8b;
          font-size: 17px;
          line-height: 1.6;
        }

        .workers-filters {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 190px 205px;
          gap: 14px;
          margin: 25px 0 35px;
        }

        .workers-search,
        .workers-select {
          width: 100%;
          min-height: 54px;
          padding: 0 16px;
          border: 1px solid #d9dee7;
          border-radius: 12px;
          background: #ffffff;
          color: #303746;
          font: inherit;
          outline: none;
        }

        .workers-search:focus,
        .workers-select:focus {
          border-color: #f47721;
          box-shadow: 0 0 0 3px rgba(244, 119, 33, 0.1);
        }

        .workers-search::placeholder {
          color: #8a92a1;
        }

        .workers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .worker-card {
          min-width: 0;
          padding: 22px;
          border: 1px solid #e1e5ec;
          border-radius: 19px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(26, 36, 54, 0.035);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .worker-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(26, 36, 54, 0.08);
        }

        .worker-card-top {
          display: flex;
          align-items: center;
          gap: 17px;
          min-width: 0;
          margin-bottom: 19px;
        }

        .worker-photo {
          width: 112px;
          height: 112px;
          flex-shrink: 0;
          display: block;
          border-radius: 50%;
          object-fit: cover;
          background: #eeeeee;
        }

        .worker-card-heading {
          min-width: 0;
        }

        .worker-name {
          margin: 0 0 10px;
          color: #202633;
          font-size: 20px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .worker-verified {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 20px;
          background: #d9f5e9;
          color: #168b64;
          font-size: 13px;
          font-weight: 600;
        }

        .verified-check {
          width: 17px;
          height: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #24b783;
          color: #ffffff;
          font-size: 12px;
          line-height: 1;
        }

        .worker-rating {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 13px;
          color: #606979;
          font-size: 16px;
        }

        .worker-star {
          color: #f5ad35;
          font-size: 23px;
        }

        .worker-reviews {
          color: #7a8290;
        }

        .worker-details {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          color: #687282;
          font-size: 15px;
        }

        .worker-detail {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .worker-detail svg {
          width: 17px;
          height: 17px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .worker-detail-dot {
          color: #b2b7c0;
        }

        .worker-view-button {
          width: 100%;
          min-height: 49px;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          background: #f47721;
          color: #ffffff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .worker-view-button:hover {
          background: #e86713;
          transform: translateY(-1px);
        }

        .worker-view-arrow {
          margin-left: 7px;
          font-size: 19px;
        }

        .workers-empty {
          grid-column: 1 / -1;
          padding: 40px 20px;
          border: 1px dashed #d9dee7;
          border-radius: 14px;
          color: #727b89;
          text-align: center;
          background: #ffffff;
        }

        .workers-footer {
          margin: 40px 0 0;
          color: #9299a7;
          font-size: 14px;
          text-align: center;
        }

        @media (max-width: 1050px) {
          .workers-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .workers-filters {
            grid-template-columns: minmax(200px, 1fr) 170px 180px;
          }

          .worker-photo {
            width: 95px;
            height: 95px;
          }
        }

        @media (max-width: 760px) {
          .workers-header {
            min-height: 78px;
            padding: 14px 20px;
          }

          .workers-brand {
            gap: 9px;
          }

          .workers-brand-mark {
            width: 43px;
            height: 43px;
            font-size: 20px;
          }

          .workers-brand h1 {
            font-size: 25px;
          }

          .workers-header-icons {
            gap: 4px;
          }

          .workers-icon-button {
            width: 34px;
            height: 34px;
          }

          .workers-content {
            padding: 35px 20px 0;
          }

          .workers-title {
            font-size: 29px;
          }

          .workers-filters {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 25px;
          }

          .workers-search {
            grid-column: 1 / -1;
          }

          .workers-grid {
            gap: 15px;
          }

          .worker-card {
            padding: 17px;
          }

          .worker-card-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .worker-photo {
            width: 90px;
            height: 90px;
          }

          .worker-name {
            font-size: 18px;
          }
        }

        @media (max-width: 520px) {
          .workers-header {
            padding: 12px;
          }

          .workers-brand-mark {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            font-size: 18px;
          }

          .workers-brand h1 {
            font-size: 20px;
            letter-spacing: -0.6px;
          }

          .workers-header-icons {
            gap: 0;
          }

          .workers-icon-button {
            width: 29px;
            height: 32px;
          }

          .workers-icon-button svg {
            width: 20px;
            height: 20px;
          }

          .workers-content {
            padding: 28px 15px 0;
          }

          .workers-title {
            font-size: 25px;
          }

          .workers-description {
            font-size: 15px;
          }

          .workers-filters {
            grid-template-columns: 1fr;
          }

          .workers-search {
            grid-column: auto;
          }

          .workers-grid {
            grid-template-columns: 1fr;
          }

          .worker-card {
            padding: 20px;
          }

          .worker-card-top {
            flex-direction: row;
            align-items: center;
          }

          .worker-photo {
            width: 95px;
            height: 95px;
          }

          .worker-name {
            font-size: 20px;
          }
        }
      `}</style>

      <header className="workers-header">
        <div className="workers-brand">
          <div className="workers-brand-mark">WC</div>
          <h1>WorkConnect</h1>
        </div>

        <div className="workers-header-icons">
          <button
            className="workers-icon-button"
            type="button"
            aria-label="Search workers"
            onClick={() => document.querySelector(".workers-search")?.focus()}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="7" />
              <path d="m16 16 5 5" />
            </svg>
          </button>

          <button
            className="workers-icon-button"
            type="button"
            aria-label="Notifications"
            onClick={() => alert("You have no new notifications.")}
          >
            <svg viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          <button
            className="workers-icon-button"
            type="button"
            aria-label="Account"
            onClick={() => {
              window.location.href = "/worker-profile";
            }}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </button>
        </div>
      </header>

      <main className="workers-content">
        


        <section className="workers-grid" aria-label="Skilled worker profiles">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <article className="worker-card" key={worker.id}>
                <div className="worker-card-top">
                  <img
                    className="worker-photo"
                    src={worker.image}
                    alt={`${worker.name} profile`}
                    loading="lazy"
                  />

                  <div className="worker-card-heading">
                    <h3 className="worker-name">{worker.name}</h3>

                    {worker.verified && (
                      <span className="worker-verified">
                        <span className="verified-check">✓</span>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="worker-rating">
                  <span className="worker-star">★</span>
                  <span>{worker.rating}</span>
                  <span className="worker-reviews">
                    ({worker.reviews} reviews)
                  </span>
                </div>

                <div className="worker-details">
                  <span className="worker-detail">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {worker.location}
                  </span>

                  <span className="worker-detail-dot">•</span>

                  <span className="worker-detail">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="7" width="18" height="14" rx="2" />
                      <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
                    </svg>
                    {worker.profession}
                  </span>
                </div>

                <button
                  className="worker-view-button"
                  type="button"
                  onClick={() => openWorkerProfile(worker)}
                >
                  View Profile <span className="worker-view-arrow">→</span>
                </button>
              </article>
            ))
          ) : (
            <div className="workers-empty">
              No workers match your search. Try another name, profession, or
              location.
            </div>
          )}
        </section>

        
      </main>
    </div>
  );
}
