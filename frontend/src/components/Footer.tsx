// src/components/Footer.tsx

"use client";

import Link from "next/link";

import Image from "next/image";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="container">
          {/* TOP SECTION */}
          <div className="top">
            {/* LEFT: BRAND + CTA */}
            <div className="brand">
              <div className="logo-row">
                <Image
                  src="/assets/innomate.png"
                  alt="Innomate Logo"
                  width={36}
                  height={36}
                  className="logo"
                  priority
                />
                <span className="logo-text">Innomate</span>
              </div>

              <p className="description">
                Transforming early ideas into<br />structured insights using AI.
              </p>

            <Link href="/signup" className="cta">
              Start Your Journey <span className="arrow">→</span>
            </Link>

            </div>

            {/* RIGHT: NAVIGATION + CONNECT */}
            <div className="right">
              <div className="column">
                <h4 className="title">NAVIGATION</h4>
                <div className="links">
                  <a href="#home" className="link nav-link">Home</a>
                  <a href="#about" className="link nav-link">About</a>
                  <a href="#features" className="link nav-link">Features</a>
                </div>
              </div>

              <div className="column">
                <h4 className="title">CONNECT WITH US</h4>
                <div className="links">
                  {[
                    { name: "Burada Sahithi Kumari", link: "https://www.linkedin.com/in/sahithikumari/" },
                    { name: "Patnana Rashmitha", link: "https://www.linkedin.com/in/YOUR-LINK-2" },
                    { name: "Goli Bala Sairam", link: "https://www.linkedin.com/in/YOUR-LINK-3" },
                  ].map((person, i) => (
                    <a key={i} href={person.link} target="_blank" rel="noreferrer" className="link connect-link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="linkedin-icon"
                      >
                        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.22 8.98h4.52V24H.22V8.98zM8.56 8.98h4.33v2.05h.06c.6-1.13 2.07-2.32 4.26-2.32 4.55 0 5.39 3 5.39 6.89V24h-4.52v-7.49c0-1.79-.03-4.09-2.49-4.09-2.49 0-2.87 1.95-2.87 3.96V24H8.56V8.98z" />
                      </svg>
                      {person.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="divider" />

          {/* BOTTOM COPYRIGHT */}
          <div className="bottom">
            <span className="copyright">
              © {new Date().getFullYear()} Innomate. All rights reserved.
            </span>
          </div>
        </div>

        <style jsx>{`
          .footer {
            width: 100%;
            background: white;
            border-top: 1px solid #e5e7eb;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 48px 24px;
          }

          @media (min-width: 1024px) {
            .container {
              padding-left: 100px;
              padding-right: 100px;
            }
          }

          .top {
            display: flex;
            flex-direction: column;
            gap: 48px;
          }

          @media (min-width: 1024px) {
            .top {
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              gap: 48px;
            }
          }

          .brand {
            max-width: 360px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .logo-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo {
            height: 36px;
            width: auto;
            object-fit: contain;
          }

          .logo-text {
            font-size: 20px;
            font-weight: 600;
            color: #000;
          }

          .description {
            font-size: 15px;
            line-height: 22px;
            color: #4b5563;
          }

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 9999px;
  background: #000;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  width: fit-content;
}

.cta:hover {
  background: #111;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.arrow {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.cta:hover .arrow {
  transform: translateX(4px);
}


          .right {
            display: flex;
            flex-wrap: wrap;
            gap: 48px;
            justify-content: space-between;
            width: 100%;
          }

          @media (min-width: 640px) {
            .right {
              width: auto;
            }
          }

          .column {
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 140px;
          }

          .title {
            font-size: 14px;
            font-weight: 600;
            color: #000;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .links {
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-size: 14px;
          }

          .link {
            color: #4b5563;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .nav-link:hover {
            color: #000;
          }

          .connect-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #4b5563;
          }

          .connect-link:hover {
            color: #2563eb;
          }

          .linkedin-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }

          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 32px 0;
          }

          .bottom {
            display: flex;
            justify-content: center;
            font-size: 14px;
            color: #6b7280;
          }

          @media (min-width: 640px) {
            .bottom {
              justify-content: flex-start;
            }
          }

          .copyright {
            text-align: center;
          }
        `}</style>
      </footer>
    </>
  );
}