// src/components/Navbar.tsx

"use client";

import Link from "next/link";

import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* Logo + Text */}
        <div className="logo-container">
          <Image
            src="/assets/innomate.png"
            alt="Innomate"
            width={36}           // keep width fixed like original w-9
            height={36}          // placeholder — will be overridden by intrinsic ratio
            style={{objectFit:"contain"}}
            className="logo"
            priority
          />
          <span className="logo-text">Innomate</span>
        </div>

        {/* Desktop Center Menu */}
        <div className="desktop-menu">
          <ul className="menu-list">
            {["home", "about", "features"].map((item) => (
              <li key={item} className="menu-item">
                <a href={`#${item}`} className="menu-link">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="desktop-actions">
          <Link href="/signup">
              <button className="signup-btn">Sign Up</button>
          </Link>
          <Link href="/login">
              <button className="login-btn">Log In</button>
          </Link>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setOpen(!open)}>
          <div className="hamburger-lines">
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </div>
        </button>

        {/* Mobile Menu */}
        {open && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {["home", "about", "features"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={() => setOpen(false)}
                  className="mobile-link"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}

              <div className="mobile-actions">
                <Link href="/signup">
                    <button className="mobile-signup">Sign Up</button>
                </Link>
                <Link href="/login">
                    <button className="mobile-login">Log In</button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.4);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }

          @media (min-width: 1024px) {
            .navbar {
              padding-left: 48px;
              padding-right: 48px;
            }
          }

          .logo-container {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .logo {
            width: 36;                /* w-9 = 36px */
            height: auto;               /* ← key fix: let height be natural */
            object-fit: contain;        /* preserve aspect ratio, no stretching */
            display: block;
          }

          .logo-text {
            font-size: 18px;
            font-weight: 600;
            color: #000;
          }

          .desktop-menu {
            display: none;
          }

          @media (min-width: 1024px) {
            .desktop-menu {
              display: block;
              padding: 12px 40px;
              border-radius: 9999px;
              border: 1px solid #d1d5db;
              background: rgba(255, 255, 255, 0.9);
            }
          }

          .menu-list {
            display: flex;
            gap: 40px;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .menu-item {
            position: relative;
          }

          .menu-link {
            position: relative;
            font-size: 14px;
            font-weight: 500;
            color: #000;
            text-decoration: none;
            padding-bottom: 4px;
          }

          .menu-link::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            height: 2px;
            width: 0;
            background: #000;
            transition: width 0.3s ease;
          }

          .menu-link:hover::after {
            width: 100%;
          }

          .desktop-actions {
            display: none;
            align-items: center;
            gap: 16px;
          }

          @media (min-width: 1024px) {
            .desktop-actions {
              display: flex;
            }
          }

          .signup-btn,
          .login-btn {
            padding: 10px 24px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .signup-btn {
            background: #000;
            color: white;
            border: none;
          }

          .signup-btn:hover {
            transform: scale(1.05);
          }

          .login-btn {
            border: 1px solid #d1d5db;
            background: transparent;
            color: #000;
          }

          .login-btn:hover {
            background: #000;
            color: white;
          }

          .hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            border: 1px solid #d1d5db;
            background: rgba(255, 255, 255, 0.9);
            cursor: pointer;
          }

          @media (min-width: 1024px) {
            .hamburger {
              display: none;
            }
          }

          .hamburger-lines {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .line {
            width: 16px;
            height: 2px;
            background: #000;
          }

          .mobile-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid #e5e7eb;
          }

          @media (min-width: 1024px) {
            .mobile-menu {
              display: none;
            }
          }

          .mobile-menu-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            padding: 32px 0;
          }

          .mobile-link {
            font-size: 14px;
            font-weight: 500;
            color: #000;
            text-decoration: none;
          }

          .mobile-actions {
            display: flex;
            gap: 16px;
            padding-top: 16px;
          }

          .mobile-signup,
          .mobile-login {
            padding: 10px 24px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          .mobile-signup {
            background: #000;
            color: white;
            border: none;
          }

          .mobile-login {
            border: 1px solid #d1d5db;
            background: transparent;
            color: #000;
          }
        `}</style>
      </nav>
    </>
  );
}