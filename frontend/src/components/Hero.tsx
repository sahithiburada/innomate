
"use client";

import Link from "next/link";


export default function Hero() {
  return (
    <section id="home" className="hero">

      {/* ===== MESH BACKGROUND (RAW IMG = EXACT REACT MATCH) ===== */}
      <img
        src="/assets/mesh-bg.png"
        alt="mesh background"
        className="mesh"
      />

      {/* ===== CONTENT ===== */}
      <div className="content">
        <div className="textBlock">
          <h1 className="title">
            Innomate. From Idea to Insight
          </h1>

          <p className="subtitle">
            Validate ideas. Understand markets. Build with confidence.
          </p>

        <Link href="/signup">
          <button className="cta">
            Validate my idea →
          </button>
        </Link>

        </div>

        {/* ===== PHONE ZONE ===== */}
        <div className="phoneZone">
          <div className="phoneGlow" />

          <img
            src="/assets/phone.png"
            alt="App preview"
            className="phone"
          />
        </div>
      </div>

      <div className="bottomFade" />

<style jsx>{`

/* ================= HERO ================= */

.hero {
  position: relative;
  width: 100%;
  background: white;
  overflow: hidden;
  padding-top: 96px;
  height: auto;
}

/* DESKTOP HEIGHT UNCHANGED */
@media (min-width: 1024px) {
  .hero {
    height: calc(100vh - 1px);
  }
}

/* ================= MESH (EXACT REACT MATCH) ================= */

.mesh {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

/* ================= CONTENT ================= */

.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 16px;
}

/* ================= TEXT ================= */

.textBlock {
  padding-top: 40px;
}

@media (min-width: 640px) {
  .textBlock {
    padding-top: 48px;
  }
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: black;
  max-width: 56rem;
  line-height: 1.25;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .title {
    font-size: 48px;
  }
}

@media (min-width: 1024px) {
  .title {
    font-size: 60px;
  }
}

.subtitle {
  margin-top: 16px;
  font-size: 16px;
  color: #374151;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 640px) {
  .subtitle {
    font-size: 18px;
    max-width: 42rem;
  }
}

/* ================= CTA (DESKTOP ONLY INCREASE) ================= */

.cta {
  margin-top: 24px;
  padding: 12px 32px;
  border-radius: 9999px;
  border: 1px solid black;
  background: transparent;
  transition: all 0.3s ease;
}

@media (min-width: 640px) {
  .cta {
    padding: 16px 40px;
  }
}

/* 🔥 ONLY DESKTOP CHANGE */
@media (min-width: 1024px) {
  .cta {
    padding: 20px 50px;
    font-size: 18px;
  }
}

.cta:hover {
  background: black;
  color: white;
  transform: scale(1.05);
}

/* ================= PHONE ZONE ================= */

.phoneZone {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (min-width: 640px) {
  .phoneZone {
    margin-top: 32px;
  }
}

@media (min-width: 1024px) {
  .phoneZone {
    flex: 1;
    align-items: flex-end;
  }
}

/* ================= PHONE GLOW ================= */

.phoneGlow {
  position: absolute;
  bottom: -10px;
  width: 520px;
  height: 260px;
  background: radial-gradient(
    ellipse at center,
    rgba(255,255,255,0.98) 0%,
    rgba(255,255,255,0.9) 35%,
    rgba(255,255,255,0.55) 55%,
    rgba(255,255,255,0.25) 70%,
    rgba(255,255,255,0) 80%
  );
  filter: blur(45px);
  pointer-events: none;
  z-index: 10;
}

/* ================= PHONE (EXACT REACT SIZES) ================= */

.phone {
  position: relative;
  z-index: 20;
  width: 280px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 25px 40px rgba(0,0,0,0.25));
}

@media (min-width: 640px) {
  .phone {
    width: 340px;
  }
}

@media (min-width: 768px) {
  .phone {
    width: 420px;
  }
}

@media (min-width: 1024px) {
  .phone {
    width: 560px;
  }
}

/* ================= BOTTOM FADE ================= */

.bottomFade {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -140px;
  width: 1400px;
  height: 420px;
  background: radial-gradient(
    ellipse at center,
    rgba(255,255,255,1) 0%,
    rgba(255,255,255,0.7) 25%,
    rgba(255,255,255,0.5) 45%,
    rgba(255,255,255,0.2) 65%,
    rgba(255,255,255,0) 85%
  );
  filter: blur(90px);
  pointer-events: none;
  z-index: 20;
}

@media (min-width: 640px) {
  .bottomFade {
    bottom: -160px;
  }
}

@media (min-width: 1024px) {
  .bottomFade {
    bottom: -220px;
  }
}

`}</style>
    </section>
  );
}