import workers from "../assets/about-page.jpeg";
import SharedNavbar from "../components/SharedNavbar";

export default function AboutPage() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .about-page {
          width: 100%;
          color: #202124;
          background: #fff8ef;
          font-family: Arial, Helvetica, sans-serif;
        }

        .about-page a {
          color: inherit;
          text-decoration: none;
        }

        
        .about-header {
          width: 100%;
          min-height: 80px;
          padding: 14px 8.5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: #ffffff;
          border-bottom: 1px solid #f0e8e1;
          position: relative;
          z-index: 10;
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
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .about-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: clamp(23px, 3vw, 36px);
          font-weight: 800;
          letter-spacing: -1.5px;
          white-space: nowrap;
        }

        .about-logo-icon {
          color: #f5682b;
          font-size: 31px;
        }

        .about-logo .work {
          color: #171717;
        }

        .about-logo .connect {
          color: #f5682b;
        }

        .about-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .about-nav a {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .about-nav a:hover {
          color: #f5682b;
        }

        .about-nav .join-button {
          padding: 12px 21px;
          border-radius: 7px;
          background: #f5682b;
          color: white;
          border: 1px solid #f5682b;
        }

        .about-nav .join-button:hover {
          background: #dc5118;
          color: white;
        }

        .about-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #222;
          font-size: 27px;
          cursor: pointer;
        }

        


        .about-main {
          width: 90%;
          max-width: 90%;
          margin: 0 auto;
          padding: 48px 0 40px;
          background:
            radial-gradient(
              ellipse at top left,
              #fff0e5 0%,
              transparent 55%
            ),
            #fff8ef;

        }

        .about-story {
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 35px;
          align-items: center;
          margin-bottom: 16px;
        }

        .about-story-text h1 {
          font-size: clamp(38px, 4.5vw, 58px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .about-story-text h2 {
          color: #e9662b;
          font-size: clamp(19px, 2.2vw, 28px);
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .about-story-text > p {
          color: #282828;
          font-size: 18px;
          line-height: 1.65;
          margin-bottom: 16px;
        }

        .about-trust {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          font-size: 14px;
          font-weight: 500;
        }

        .about-trust-icon {
          color: #f5682b;
          font-size: 25px;
          margin-right: 5px;
        }

        .about-trust-dot {
          color: #f5682b;
          font-weight: bold;
        }

        .about-story-image {
          width: 100%;
          height: 340px;
          object-fit: cover;
          display: block;
          border-radius: 9px;
        }

        
        .about-story-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .about-info-card {
          background: #ffffff;
          border: 1px solid #f2e9e0;
          border-radius: 15px;
          padding: 28px 32px;
          box-shadow: 0 7px 22px rgba(75, 48, 27, 0.09);
        }

        .about-card-icon {
          display: block;
          text-align: center;
          font-size: 35px;
          color: #df7747;
          margin-bottom: 5px;
        }

        .about-card-title {
          text-align: center;
          font-size: 21px;
          line-height: 1.25;
          margin-bottom: 9px;
          color: #202124;
        }

        .about-card-title .accent {
          text-decoration: underline;
          text-decoration-color: #f5682b;
          text-underline-offset: 4px;
        }

        .about-card-subtitle {
          text-align: center;
          font-size: 19px;
          line-height: 1.3;
          margin-bottom: 9px;
        }

        .about-info-card p {
          font-size: 16px;
          line-height: 1.6;
          color: #333333;
        }

        
        
        .about-values {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .about-value-card {
          min-height: 220px;
          padding: 28px 26px;
          background: #ffffff;
          border: 1px solid #f0e8e1;
          border-radius: 14px;
          box-shadow: 0 7px 22px rgba(75, 48, 27, 0.09);
        }

        .about-value-icon {
          display: block;
          text-align: center;
          color: #df7747;
          font-size: 38px;
          margin-bottom: 7px;
        }

        .about-value-card h3 {
          text-align: center;
          font-size: 21px;
          margin-bottom: 10px;
          color: #e9662b;
        }

        .about-value-card h3.accent {
          color: #e9662b;
        }

        .about-value-card > p {
          text-align: center;
          font-size: 16px;
          line-height: 1.5;
          color: #333333;
        }

        .about-promise-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .about-promise-list li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 15px;
          line-height: 1.4;
        }

        .about-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f5682b;
          color: white;
          font-weight: bold;
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

        

        
        @media (max-width: 1000px) {
          .about-header {
            padding-left: 5%;
            padding-right: 5%;
          }

          .about-nav {
            gap: 13px;
          }

          .about-nav a {
            font-size: 13px;
          }

          .about-main {
            padding-left: 5%;
            padding-right: 5%;
          }

          .about-story {
            gap: 22px;
          }

          .about-values {
            gap: 14px;
          }

          .about-value-card {
            padding: 18px 14px;
          }

          .about-footer {
            padding-left: 5%;
            padding-right: 5%;
          }
        }

        
        



        @media (max-width: 760px) {
          .about-header {
            min-height: 70px;
            padding: 14px 5%;
            flex-wrap: wrap;
          }

          .about-logo {
            font-size: 27px;
          }

          .about-menu-toggle {
            display: block;
          }

          .about-nav {
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            width: 100%;
            padding: 8px 0;
          }

          .about-nav.open {
            display: flex;
          }

          .about-nav a {
            padding: 13px 5px;
            font-size: 15px;
          }

          .about-nav .join-button {
            text-align: center;
            margin-top: 7px;
          }

          .about-main {
            padding: 25px 5% 30px;
          }

          .about-story {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .about-story-text h1 {
            font-size: 43px;
          }

          .about-story-text h2 {
            font-size: 23px;
          }

          .about-story-image {
            height: 260px;
          }

          .about-story-cards {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .about-info-card {
            padding: 21px;
          }

          .about-values {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .about-value-card {
            min-height: auto;
            padding: 24px 22px;
          }

          .about-footer-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 13px;
          }

          .about-footer-copy {
            text-align: left;
          }
        }

        @media (max-width: 400px) {
          .about-logo {
            font-size: 23px;
          }

          .about-logo-icon {
            font-size: 25px;
          }

          .about-story-text h1 {
            font-size: 37px;
          }

          .about-story-image {
            height: 210px;
          }

          .about-info-card {
            padding: 18px;
          }
        }
      `}</style>

      <div className="about-page">
        <SharedNavbar />

        <main className="about-main">
          <section className="about-story">
            <div className="about-story-text">
              <h1>Our Story</h1>
              <h2>Connecting Nigeria's Skilled Hands</h2>

              <p>
                WorkConnect is built to bridge the gap between skilled Nigerian
                workers and the people who need their expertise. From plumbers
                and electricians to tailors and carpenters, we're making it
                easier to connect, collaborate, and get work done right in your
                community.
              </p>

              <div className="about-trust">
                <span className="about-trust-icon">•</span>
                <span>Trusted</span>
                <span className="about-trust-dot">•</span>
                <span>Local</span>
                <span className="about-trust-dot">•</span>
                <span>Verified</span>
              </div>
            </div>

            <img
              className="about-story-image"
              src="/src/assets/about-page.jpeg"
              alt="Nigerian workers working together"
            />
          </section>

          <section className="about-story-cards">
            <article className="about-info-card">
              <span className="about-card-icon">ⓘ</span>
              <h2 className="about-card-title">
                WHY <span className="accent">WE STARTED</span>
              </h2>
              <h3 className="about-card-subtitle">
                Skilled Hands Were There, But Hard to Find
              </h3>
              <p>
                We noticed two problems. There are skilled workers everywhere
                who are good at what they do, but don't have the means to find
                the right customers. And there are customers who urgently need
                those workers, but can't easily find someone trusted and nearby.
                WorkConnect was built to close that gap.
              </p>
            </article>

            <article className="about-info-card">
              <span className="about-card-icon">⌘</span>
              <h2 className="about-card-title">
                WHAT <span className="accent">WE DO</span>
              </h2>
              <h3 className="about-card-subtitle">
                Connecting People with Verified Workers
              </h3>
              <p>
                We connect households with vetted electricians, plumbers,
                carpenters, cleaners, painters, and more. Book trusted
                professionals for home repairs and maintenance services across
                Nigeria — easily, safely, and reliably. From small fixes to
                bigger projects, our platform helps you hire skilled hands near
                you with confidence.
              </p>
            </article>
          </section>

          <section className="about-values">
            <article className="about-value-card">
              <span className="about-value-icon">◎</span>
              <h3 className="accent">OUR MISSION</h3>
              <p>
                To make it easy for anyone who needs work done to find trusted
                workers, and easy for skilled workers to find real jobs — safely
                and simply.
              </p>
            </article>

            <article className="about-value-card">
              <span className="about-value-icon">◎</span>
              <h3>OUR VISION</h3>
              <p>
                To become Nigeria's most trusted platform for skilled labour
                where every worker has opportunity.
              </p>
            </article>

            <article className="about-value-card">
              <span className="about-value-icon">♢</span>
              <h3 className="accent">OUR PROMISE</h3>
              <ul className="about-promise-list">
                <li>
                  <span className="about-check">✓</span>
                  <span>
                    <strong>No Online Payment</strong> — pay directly in cash
                    after the job.
                  </span>
                </li>
                <li>
                  <span className="about-check">✓</span>
                  <span>
                    <strong>Verified Workers</strong> — background checks.
                  </span>
                </li>
                <li>
                  <span className="about-check">✓</span>
                  <span>
                    <strong>Built for Our Community</strong> — supporting local
                    workers.
                  </span>
                </li>
              </ul>
            </article>
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
    </>
  );
}
