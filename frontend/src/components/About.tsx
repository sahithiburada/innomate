// // src/components/About.tsx
// "use client";

// export default function About() {
//   return (
//     <section id="about" className="about-section">
//       {/* ===== FONT IMPORT ===== */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
//       `}</style>

//       {/* ===== CONTENT ===== */}
//       <div className="content-wrapper">
//         {/* ===== TOP CONTENT ===== */}
//         <div className="top-content">
//           <h2 className="main-heading">
//             Designed to <br />
//             Help You Turn Ideas <br />
//             into{" "}
//             <span className="gradient-text">Confident Decisions</span>
//           </h2>

//           <p className="subline">
//             Early ideas can feel overwhelming. Innomate provides AI-powered
//             insights to help you move forward with confidence.
//           </p>
//         </div>

//         {/* ===== BOTTOM 3 BLOCKS ===== */}
//         <div className="bottom-blocks">
//           <div className="block">
//             <h3>Who We Are</h3>
//             <p>
//               Innomate is an AI-driven platform built for students and early
//               founders. We focus on helping ideas move forward with clarity
//               instead of guesswork.
//             </p>
//           </div>

//           <div className="block">
//             <h3>What We Do</h3>
//             <p>
//               We use AI to analyze startup ideas, market trends, and risks. Our
//               system turns early concepts into structured insights and
//               pitch-ready understanding.
//             </p>
//           </div>

//           <div className="block why-block">
//             <h3>Why It Matters</h3>
//             <p>
//               Better ideas start with better decisions. Innomate helps users
//               validate early, think strategically, and build with confidence.
//             </p>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .about-section {
//           width: 100%;
//           background: white;
//           overflow-x: hidden; /* No horizontal scroll */
//           font-family: 'Inter', sans-serif;
//           padding: 4rem 1.5rem; /* mobile padding */
//         }

//         @media (min-width: 640px) {
//           .about-section {
//             padding: 5rem 2.5rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .about-section {
//             padding: 9.25rem 6.25rem; /* desktop padding */
//           }
//         }

//         .content-wrapper {
//           max-width: 1400px;
//           margin: 0 auto;
//           display: flex;
//           flex-direction: column;
//           gap: 3.5rem;
//         }

//         @media (min-width: 640px) {
//           .content-wrapper {
//             gap: 4rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .content-wrapper {
//             gap: 6rem;
//           }
//         }

//         /* TOP CONTENT */
//         .top-content {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 2rem;
//           text-align: center;
//         }

//         @media (min-width: 1024px) {
//           .top-content {
//             grid-template-columns: minmax(0, 720px) minmax(0, 1fr);
//             gap: 5rem;
//             text-align: left;
//             align-items: flex-end;
//           }
//         }

//         .main-heading {
//           font-weight: 530;
//           color: black;
//           line-height: 1.1;
//           font-size: 2.5rem;
//           margin: 0;
//         }

//         @media (min-width: 640px) {
//           .main-heading {
//             font-size: 3rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .main-heading {
//             font-size: 4rem;
//             line-height: 81px;
//           }
//         }

//         .gradient-text {
//           font-weight: 770;
//           font-style: italic;
//           background: linear-gradient(to right, #f9b995, #f28ca6);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }

//         .subline {
//           font-size: 1.125rem;
//           line-height: 1.4;
//           color: black;
//           max-width: 36rem;
//           margin: 0 auto;
//         }

//         @media (min-width: 640px) {
//           .subline {
//             font-size: 1.25rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .subline {
//             font-size: 1.5rem;
//             line-height: 30px;
//             max-width: 420px;
//             margin: 0;
//           }
//         }

//         /* BOTTOM BLOCKS */
//         .bottom-blocks {
//           display: grid;
//           grid-template-columns: 1fr;
//           gap: 2rem;
//           text-align: center;
//         }

//         @media (min-width: 640px) {
//           .bottom-blocks {
//             grid-template-columns: repeat(2, 1fr);
//             gap: 2.5rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .bottom-blocks {
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5rem;
//             text-align: left;
//           }
//         }

//         .block {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }

//         .block h3 {
//           font-size: 1.625rem;
//           font-weight: 500;
//           color: black;
//           margin: 0;
//         }

//         @media (min-width: 640px) {
//           .block h3 {
//             font-size: 1.75rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .block h3 {
//             font-size: 2rem;
//           }
//         }

//         .block p {
//           font-size: 1rem;
//           line-height: 1.5;
//           color: #6d6d6d;
//           margin: 0;
//         }

//         @media (min-width: 640px) {
//           .block p {
//             font-size: 1.125rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .block p {
//             font-size: 1.25rem;
//             line-height: 25px;
//           }
//         }

//         /* Why block spans both columns on tablet */
//         @media (min-width: 640px) and (max-width: 1023px) {
//           .why-block {
//             grid-column: span 2;
//           }
//         }
//       `}</style>
//     </section>
//   );
// }

// src/components/About.tsx


// src/components/About.tsx

// src/components/About.tsx
"use client";

export default function About() {
  return (
    <section id="about" className="about-section">
      {/* ===== FONT IMPORT ===== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ===== CONTENT ===== */}
      <div className="content-wrapper">
        {/* ===== TOP CONTENT ===== */}
        <div className="top-content">
          <h2 className="main-heading">
            Designed to <br />
            Help You Turn Ideas <br />
            into{" "}
            <span className="gradient-text">Confident Decisions</span>
          </h2>

          <p className="subline">
            Early ideas can feel overwhelming. Innomate provides AI-powered
            insights to help you move forward with confidence.
          </p>
        </div>

        {/* ===== BOTTOM 3 BLOCKS ===== */}
        <div className="bottom-blocks">
          <div className="block">
            <h3>Who We Are</h3>
            <p>
              Innomate is an AI-driven platform built for students and early
              founders. We focus on helping ideas move forward with clarity
              instead of guesswork.
            </p>
          </div>

          <div className="block">
            <h3>What We Do</h3>
            <p>
              We use AI to analyze startup ideas, market trends, and risks. Our
              system turns early concepts into structured insights and
              pitch-ready understanding.
            </p>
          </div>

          <div className="block why-block">
            <h3>Why It Matters</h3>
            <p>
              Better ideas start with better decisions. Innomate helps users
              validate early, think strategically, and build with confidence.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          width: 100%;
          background: white;
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
          padding: 5rem 1.5rem 6rem; /* ↑ more top/bottom padding → taller section */
        }

        @media (min-width: 640px) {
          .about-section {
            padding: 6rem 2.5rem 7rem; /* taller on tablet */
          }
        }

        @media (min-width: 1024px) {
          .about-section {
            padding: 9.25rem 6.25rem; /* desktop unchanged */
          }
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4rem; /* ↑ increased → more breathing room */
        }

        @media (min-width: 640px) {
          .content-wrapper {
            gap: 5rem; /* tablet — clean separation */
          }
        }

        @media (min-width: 1024px) {
          .content-wrapper {
            gap: 6rem; /* desktop unchanged */
          }
        }

        /* TOP CONTENT */
        .top-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem; /* ↑ more space between heading & subline */
          text-align: center;
        }

        @media (min-width: 1024px) {
          .top-content {
            grid-template-columns: minmax(0, 720px) minmax(0, 1fr);
            gap: 5rem;
            text-align: left;
            align-items: flex-end;
          }
        }

        .main-heading {
          font-weight: 600;
          color: black;
          line-height: 1.1;
          font-size: 2.25rem;
          margin: 0;
        }

        @media (min-width: 640px) {
          .main-heading {
            font-size: 2.75rem;
          }
        }

        @media (min-width: 1024px) {
          .main-heading {
            font-size: 3.75rem;
            line-height: 81px;
          }
        }

        .gradient-text {
          font-weight: 800;
          font-style: italic;
          background: linear-gradient(to right, #f9b995, #f28ca6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subline {
          font-size: 1rem;
          line-height: 1.5; /* kept airy */
          color: black;
          max-width: 36rem;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .subline {
            font-size: 1.125rem;
          }
        }

        @media (min-width: 1024px) {
          .subline {
            font-size: 1.375rem;
            line-height: 30px;
            max-width: 420px;
            margin: 0;
          }
        }

        /* BOTTOM BLOCKS */
        .bottom-blocks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem; /* ↑ increased → blocks feel separated & clean */
          text-align: center;
        }

        @media (min-width: 640px) {
          .bottom-blocks {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem; /* tablet — good separation */
          }
        }

        @media (min-width: 1024px) {
          .bottom-blocks {
            grid-template-columns: repeat(3, 1fr);
            gap: 5rem; /* desktop unchanged */
            text-align: left;
          }
        }

        .block {
          display: flex;
          flex-direction: column;
          gap: 1rem; /* kept readable */
        }

        .block h3 {
          font-size: 1.5rem;
          font-weight: 500;
          color: black;
          margin: 0;
        }

        @media (min-width: 640px) {
          .block h3 {
            font-size: 1.625rem;
          }
        }

        @media (min-width: 1024px) {
          .block h3 {
            font-size: 1.875rem;
          }
        }

        .block p {
          font-size: 0.9375rem;
          line-height: 1.6; /* ↑ slightly more air between lines */
          color: #6d6d6d;
          margin: 0;
        }

        @media (min-width: 640px) {
          .block p {
            font-size: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .block p {
            font-size: 1.125rem;
            line-height: 25px;
          }
        }

        /* Why block spans both columns on tablet */
        @media (min-width: 640px) and (max-width: 1023px) {
          .why-block {
            grid-column: span 2;
          }
        }
      `}</style>
    </section>
  );
}