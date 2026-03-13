"use client";

export default function PageLoader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="card">
        <div className="loader">
          <p className="mr-2">loading</p>
          <div className="words">
            <span className="word">Ideas</span>
            <span className="word">Reports</span>
            <span className="word">Solutions</span>
            <span className="word">Analysis</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          --bg-color: #ffffff;
          background-color: var(--bg-color);
          padding: 1rem 2rem;
          border-radius: 1.25rem;
        }

        .loader {
          color: rgb(124, 124, 124);
          font-family: "Poppins", sans-serif;
          font-weight: 500;
          font-size: 25px;
          box-sizing: content-box;
          height: 40px;
          padding: 10px 10px;
          display: flex;
          border-radius: 8px;
        }

        .words {
          overflow: hidden;
          position: relative;
        }

        .words::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            var(--bg-color) 10%,
            transparent 30%,
            transparent 70%,
            var(--bg-color) 90%
          );
          z-index: 20;
        }

        .word {
          display: block;
          height: 100%;
          padding-left: 6px;
          color: #956afa;
          animation: spin_4991 4s infinite;
        }

        @keyframes spin_4991 {
          10% {
            transform: translateY(-102%);
          }
          25% {
            transform: translateY(-100%);
          }
          35% {
            transform: translateY(-202%);
          }
          50% {
            transform: translateY(-200%);
          }
          60% {
            transform: translateY(-302%);
          }
          75% {
            transform: translateY(-300%);
          }
          85% {
            transform: translateY(-402%);
          }
          100% {
            transform: translateY(-400%);
          }
        }
      `}</style>
    </div>
  );
}