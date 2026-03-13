"use client";

import AuthMeshPanel from "./AuthMeshPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f7f6fb]">

      {/* ================= DESKTOP (UNCHANGED) ================= */}
      <div className="hidden lg:flex w-1/2 h-screen">
        <AuthMeshPanel />
      </div>

      <div className="hidden lg:flex w-1/2 h-screen items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    {/* ================= MOBILE ONLY ================= */}
    <div className="lg:hidden min-h-screen w-full bg-white relative overflow-hidden">

      {/* Top Ombre Section */}
    <div
      className="absolute top-0 left-0 w-full h-[55vh]"
      style={{
        background: `
          radial-gradient(
            120% 80% at 50% -10%,
            #fbcfe8 0%,
            #f8c8dc 25%,
            #fce7f3 45%,
            #ffffff 70%
          )
        `,
      }}
    />



      {/* Content Centered in White */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </div>


    </div>
  );
}
