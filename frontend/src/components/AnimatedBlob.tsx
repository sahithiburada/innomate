// "use client";

// export default function AnimatedBlob() {
//   return (
//     <>
//       <div className="orb-wrapper">
//         <div className="orb-core" />
//         <div className="orb-glow" />
//       </div>

//       <style jsx>{`
//         .orb-wrapper {
//           position: relative;
//           width: 420px;
//           height: 420px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           animation: float 10s ease-in-out infinite;
//         }

//         .orb-core {
//           width: 320px;
//           height: 320px;
//           border-radius: 50%;
//           position: relative;
//           overflow: hidden;
//           background: radial-gradient(
//             circle at 35% 35%,
//             rgba(255,255,255,0.8),
//             rgba(255,255,255,0.2) 40%,
//             transparent 60%
//           );
//           backdrop-filter: blur(20px);
//         }

//         .orb-core::before {
//           content: "";
//           position: absolute;
//           width: 200%;
//           height: 200%;
//           top: -50%;
//           left: -50%;
//           border-radius: 50%;
//           background: conic-gradient(
//             from 0deg,
//             #d946ef,
//             #9333ea,
//             #2563eb,
//             #06b6d4,
//             #d946ef
//           );
//           filter: blur(50px);
//           animation: rotate 25s linear infinite;
//           opacity: 0.9;
//         }

//         .orb-core::after {
//           content: "";
//           position: absolute;
//           inset: 0;
//           border-radius: 50%;
//           background: radial-gradient(
//             circle at 50% 60%,
//             rgba(255,255,255,0.9),
//             rgba(255,255,255,0.2) 40%,
//             transparent 70%
//           );
//           filter: blur(12px);
//         }

//         .orb-glow {
//           position: absolute;
//           width: 380px;
//           height: 380px;
//           border-radius: 50%;
//           background: radial-gradient(
//             circle,
//             rgba(168,85,247,0.25),
//             rgba(6,182,212,0.15),
//             transparent 70%
//           );
//           filter: blur(60px);
//           animation: pulse 6s ease-in-out infinite alternate;
//         }

//         @keyframes rotate {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-25px); }
//         }

//         @keyframes pulse {
//           from { opacity: 0.6; transform: scale(1); }
//           to { opacity: 1; transform: scale(1.05); }
//         }
//       `}</style>
//     </>
//   );
// }
