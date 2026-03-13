// "use client";

// import Image from "next/image";

// export default function FeaturesGrid() {
//   return (
//     <>
//       {/* Scroll Anchor */}
//       <div id="features" className="scroll-mt-[50px]" />

//       {/* Reduced top padding (pt-2 instead of previous spacing) */}
//       <section className="w-full bg-white relative overflow-hidden pt-2 pb-6">

//         {/* ===== Mobile Scroll Hint (Arrow Only) ===== */}
//         {/* Visible only on mobile & tablet */}
//         <div className="lg:hidden flex justify-center mb-2">
//           <span className="text-gray-400 text-sm animate-pulse">
//             ← Swipe →
//           </span>
//         </div>

//         {/* ===== SCROLL WRAPPER ===== */}
//         <div className="relative">
          
//           {/* LEFT FADE — Mobile Only */}
//           <div className="lg:hidden pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />

//           {/* RIGHT FADE — Mobile Only */}
//           <div className="lg:hidden pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

//           {/* Scroll only for mobile */}
//           <div className="overflow-x-auto lg:overflow-visible pb-4">
//             <div className="relative mx-auto w-[1400px] h-[760px] min-w-[1400px]">

//               {/* ================= COMPETITOR RESEARCH ================= */}
//               <div
//                 className="absolute bg-[#FEC3C5] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 295, height: 380, left: 100, top: 49 }}
//               >
//                 <div style={{ position: "absolute", left: 16, top: 16, width: 224 }}>
//                   <p
//                     style={{
//                       color: "#F35358",
//                       fontSize: 24,
//                       fontFamily: "Inter",
//                       fontWeight: 600,
//                       lineHeight: "28px",
//                       textTransform: "capitalize",
//                     }}
//                   >
//                     Wanna Know <br /> Your Competitors?
//                   </p>

//                   <Image
//                     src="/assets/competitors-underline.svg"
//                     alt=""
//                     width={107}
//                     height={10}
//                     style={{ marginTop: 6 }}
//                   />
//                 </div>

//                 <Image
//                   src="/assets/competitors-divider.svg"
//                   alt=""
//                   width={1}
//                   height={250}
//                   style={{
//                     position: "absolute",
//                     left: "50%",
//                     bottom: 0,
//                     transform: "translateX(-50%)",
//                     height: 250,
//                   }}
//                 />

//                 <Image
//                   src="/assets/competitors-people.svg"
//                   alt=""
//                   width={285}
//                   height={200}
//                   style={{
//                     position: "absolute",
//                     left: "50%",
//                     bottom: -10,
//                     transform: "translateX(-50%)",
//                     width: 285,
//                   }}
//                 />
//               </div>

//               {/* ================= SMART RECOMMENDATIONS ================= */}
//               <div
//                 className="absolute rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{
//                   width: 295,
//                   height: 217,
//                   left: 415,
//                   top: 49,
//                   background:
//                     "linear-gradient(180deg, #FEF1FB 0%, #F6D1E4 54%, #FFBDDF 100%)",
//                 }}
//               >
//                 <Image
//                   src="/assets/smart-recommendations.svg"
//                   alt=""
//                   width={170}
//                   height={170}
//                   className="absolute inset-0 m-auto w-[170px] animate-[slowSpin_18s_linear_infinite] hover:[animation-play-state:paused]"
//                 />
//               </div>

//               {/* ================= REALITY CHECK ================= */}
//               <div
//                 className="absolute rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{
//                   width: 295,
//                   height: 217,
//                   left: 730,
//                   top: 49,
//                   background: "#F6D1E4",
//                 }}
//               >
//                 <p className="absolute left-[16px] top-[16px] text-[#FF0686] text-[24px] font-semibold leading-tight capitalize">
//                   Give your idea <br /> a reality <br /> check
//                 </p>

//                 <p className="absolute left-[16px] top-[108px] text-[#E43A91] text-[12px] font-medium leading-tight capitalize">
//                   See how ready <br /> your idea really is
//                 </p>

//                 <Image
//                   src="/assets/reality-check.svg"
//                   alt=""
//                   width={300}
//                   height={217}
//                   style={{ position: "absolute", left: 3, width: 300 }}
//                 />
//               </div>

//               {/* ================= SWOT ================= */}
//               <div
//                 className="absolute bg-[#FFDBC7] rounded-[10px] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 295, height: 333, left: 1048, top: 49 }}
//               >
//                 <Image
//                   src="/assets/swot.svg"
//                   alt=""
//                   width={230}
//                   height={230}
//                   style={{ width: 230 }}
//                 />
//               </div>

//               {/* ================= PITCH DECK ================= */}
//               <div
//                 className="absolute bg-[#FFECE1] rounded-[10px] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 610, height: 311, left: 415, top: 292 }}
//               >
//                 <Image
//                   src="/assets/pitch-deck.svg"
//                   alt="Pitch Deck"
//                   width={520}
//                   height={311}
//                   style={{ width: 520 }}
//                 />
//               </div>

//               {/* ================= IDEA UNDERSTANDING ================= */}
//               <div
//                 className="absolute bg-[#FFDBC7] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 295, height: 306, left: 100, top: 453 }}
//               >
//                 <p className="absolute left-[33px] top-[24px] text-[#BE7248] text-[32px] font-medium leading-tight">
//                   Idea <br /> Understanding
//                 </p>

//                 <Image
//                   src="/assets/idea-understanding.svg"
//                   alt=""
//                   width={230}
//                   height={176}
//                   style={{ position: "absolute", left: 33, top: 130, width: 230 }}
//                 />
//               </div>

//               {/* ================= MARKET ================= */}
//               <div
//                 className="absolute rounded-[10px] overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 295, height: 351, left: 1048, top: 408 }}
//               >
//                 <Image
//                   src="/assets/market-interest.svg"
//                   alt=""
//                   fill
//                   className="object-cover"
//                 />
//               </div>

//               {/* ================= FEASIBILITY ================= */}
//               <div
//                 className="absolute bg-[#FFC2D5] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{ width: 210, height: 139, left: 415, top: 620 }}
//               >
//                 <Image
//                   src="/assets/feasibility-meter.svg"
//                   alt=""
//                   width={210}
//                   height={139}
//                   style={{ position: "absolute", inset: 0, margin: "auto", width: 210 }}
//                 />
//               </div>

//               {/* ================= BUDGET ================= */}
//               <div
//                 className="absolute rounded-[10px] overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
//                 style={{
//                   width: 371,
//                   height: 139,
//                   left: 657,
//                   top: 620,
//                   background:
//                     "linear-gradient(314deg, #FFC2D5 52%, #FFDCC5 100%)",
//                 }}
//               >
//                 <Image
//                   src="/assets/budget.svg"
//                   alt=""
//                   fill
//                   style={{
//                     filter: "drop-shadow(0px 3px 6.3px #D58D65)",
//                     objectFit: "contain",
//                   }}
//                 />
//               </div>

//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }


"use client";

export default function FeaturesGrid() {
  return (
    <>
      {/* Scroll Anchor */}
      <div id="features" className="scroll-mt-[50px]" />

      <section className="w-full bg-white pt-6 pb-10 relative overflow-hidden">

        {/* ===== MOBILE INTRO ===== */}
        <div className="block lg:hidden text-center mb-6 px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-black">
            Explore Our Features
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Swipe through tools built to validate and refine your ideas.
          </p>
          <p className="text-lg text-gray-400 mt-3 tracking-wide animate-pulse">
            ← Swipe to explore →
          </p>
        </div>

        {/* ===== SCROLL WRAPPER ===== */}
        <div className="relative">

          {/* LEFT FADE */}
          <div className="lg:hidden pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-20" />

          {/* RIGHT FADE */}
          <div className="lg:hidden pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-20" />

          <div className="overflow-x-auto lg:overflow-visible">
            <div className="relative mx-auto w-[1400px] h-[760px] min-w-[1400px]">

              {/* ================= COMPETITOR ================= */}
              <div
                className="absolute bg-[#FEC3C5] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 295, height: 380, left: 100, top: 49 }}
              >
                <div className="absolute left-4 top-4 w-[224px]">
                  <p className="text-[#F35358] text-[24px] font-semibold leading-[28px] capitalize">
                    Wanna Know <br /> Your Competitors?
                  </p>
                  <img
                    src="/assets/competitors-underline.svg"
                    alt=""
                    className="w-[107px] mt-1"
                  />
                </div>

                <img
                  src="/assets/competitors-divider.svg"
                  alt=""
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[250px]"
                />

                <img
                  src="/assets/competitors-people.svg"
                  alt=""
                  className="absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-[285px]"
                />
              </div>

              {/* ================= SMART ================= */}
              <div
                className="absolute rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{
                  width: 295,
                  height: 217,
                  left: 415,
                  top: 49,
                  background:
                    "linear-gradient(180deg, #FEF1FB 0%, #F6D1E4 54%, #FFBDDF 100%)",
                }}
              >
                <img
                  src="/assets/smart-recommendations.svg"
                  alt=""
                  className="absolute inset-0 m-auto w-[170px] animate-[slowSpin_18s_linear_infinite] hover:[animation-play-state:paused]"
                />
              </div>

              {/* ================= REALITY ================= */}
              <div
                className="absolute rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{
                  width: 295,
                  height: 217,
                  left: 730,
                  top: 49,
                  background: "#F6D1E4",
                }}
              >
                <p className="absolute left-4 top-4 text-[#FF0686] text-[24px] font-semibold leading-tight capitalize">
                  Give your idea <br /> a reality <br /> check
                </p>

                <p className="absolute left-4 top-[108px] text-[#E43A91] text-[12px] font-medium capitalize">
                  See how ready <br /> your idea really is
                </p>

                <img
                  src="/assets/reality-check.svg"
                  alt=""
                  className="absolute left-[3px] w-[300px]"
                />
              </div>

              {/* ================= SWOT ================= */}
              <div
                className="absolute bg-[#FFDBC7] rounded-[10px] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 295, height: 333, left: 1048, top: 49 }}
              >
                <img src="/assets/swot.svg" alt="" className="w-[230px]" />
              </div>

              {/* ================= PITCH ================= */}
              <div
                className="absolute bg-[#FFECE1] rounded-[10px] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 610, height: 311, left: 415, top: 292 }}
              >
                <img src="/assets/pitch-deck.svg" alt="" className="w-[520px]" />
              </div>

              {/* ================= IDEA ================= */}
              <div
                className="absolute bg-[#FFDBC7] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 295, height: 306, left: 100, top: 453 }}
              >
                <p className="absolute left-[33px] top-[24px] text-[#BE7248] text-[32px] font-medium leading-tight">
                  Idea <br /> Understanding
                </p>

                <img
                  src="/assets/idea-understanding.svg"
                  alt=""
                  className="absolute left-[33px] top-[130px] w-[230px]"
                />
              </div>
{/* ================= MARKET ================= */}
<div
  className="absolute rounded-[10px] overflow-hidden
             transition-all duration-300 ease-out
             hover:-translate-y-1 hover:shadow-lg"
  style={{ width: 295, height: 351, left: 1048, top: 408 }}
>
  {/* Background Image */}
  <img
    src="/assets/market-interest.svg"
    alt=""
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* TEXT LAYER (THIS WAS MISSING) */}
  <p className="absolute left-[18px] top-[30px] text-[#C05B5B] text-[14px] leading-[26px]">
    See how{" "}
    <span className="text-[#BA7070] text-[26px] font-medium">
      Market interest
    </span>
    <br />
    is moving for your idea.
  </p>
</div>


              {/* ================= FEASIBILITY ================= */}
              <div
                className="absolute bg-[#FFC2D5] rounded-[10px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ width: 210, height: 139, left: 415, top: 620 }}
              >
                <img
                  src="/assets/feasibility-meter.svg"
                  alt=""
                  className="absolute inset-0 m-auto w-[210px]"
                />
              </div>

              {/* ================= BUDGET ================= */}
              <div
                className="absolute rounded-[10px] overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{
                  width: 371,
                  height: 139,
                  left: 657,
                  top: 620,
                  background:
                    "linear-gradient(314deg, #FFC2D5 52%, #FFDCC5 100%)",
                }}
              >
                <div className="absolute -left-5 -top-5 w-[210px] h-[180px] overflow-hidden rotate-[-5deg]">
                  <img
                    src="/assets/budget.svg"
                    alt=""
                    className="w-full h-full"
                    style={{
                      filter: "drop-shadow(0px 3px 6.3px #D58D65)",
                    }}
                  />
                </div>

                <div className="absolute left-[178px] top-[22px] w-[199px]">
                  <p className="text-[#F93977] text-[26px] font-semibold leading-[30px] capitalize mb-1">
                    Budget <br /> Insights.
                  </p>
                  <p className="text-[#D74B7C] text-[14px] capitalize leading-[15px]">
                    Early-stage estimated cost outlook
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
