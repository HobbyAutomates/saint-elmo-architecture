import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

/* ── Constants ── */
const BRAND_DARK = "#213138";
const FULL_TEXT = "Saint Elmo";
const HOUSE_IMG =
  "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780471903/building_bzziky.png";
const BG_IMG =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260603_073200_7082add5-f1f8-4873-8696-d6f78a44089b.png&w=1920&q=85";

const GALLERY_VIDEOS = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154759_4cdc8175-8261-497c-b688-9477c76545d4.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154751_39b1b9bb-2708-4211-b6a2-d39f93309e52.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154737_eba7900c-0313-483c-a30a-632c747ccc42.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_144009_4348fe33-f885-4345-8e92-3fe1c2625d32.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_145337_e44eaa8c-6bb1-4a6e-a70f-ed0231cbaccb.mp4",
];

/* ── Helpers ── */
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ── CountUp ── */
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState("0" + suffix);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const dur = 2000;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = clamp((now - t0) / dur, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(eased * end) + suffix);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, suffix]);

  return <span ref={ref}>{display}</span>;
}

/* ── Brand Logo ── */
function BrandLogo({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      className={`font-primary select-none ${className}`}
      style={{ color, transition: "color 0.35s ease" }}
    >
      <span style={{ fontWeight: 700 }}>Saint</span>{" "}
      <span style={{ fontWeight: 700 }}>Elm</span>
      <span style={{ fontWeight: 900 }}>o</span>
    </span>
  );
}

/* ── App ── */
export default function App() {
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [lifting, setLifting] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [liftDone, setLiftDone] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [navOnDark, setNavOnDark] = useState(false);
  const [hamburgerHover, setHamburgerHover] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const houseWrapRef = useRef<HTMLDivElement>(null);
  const houseInnerRef = useRef<HTMLDivElement>(null);
  const houseImgRef = useRef<HTMLImageElement>(null);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const CHAR_INTERVAL = 140;
  const TYPE_START = 600;
  const totalChars = FULL_TEXT.length;
  const LIFT_AT = TYPE_START + totalChars * CHAR_INTERVAL + 700;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < totalChars; i++) {
      timers.push(
        setTimeout(() => {
          setTyped(FULL_TEXT.slice(0, i + 1));
        }, TYPE_START + i * CHAR_INTERVAL)
      );
    }
    timers.push(setTimeout(() => setShowCursor(false), LIFT_AT - 150));
    timers.push(setTimeout(() => setLifting(true), LIFT_AT));
    timers.push(setTimeout(() => setHeroVisible(true), LIFT_AT + 1300));
    timers.push(setTimeout(() => setLiftDone(true), LIFT_AT + 2100));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const check = () => {
      const refs = [darkRef.current, galleryRef.current];
      let onDark = false;
      for (const el of refs) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 0 && r.bottom > 0) {
          onDark = true;
          break;
        }
      }
      setNavOnDark(onDark);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  const updateHousePosition = useCallback(() => {
    const wrap = houseWrapRef.current;
    const inner = houseInnerRef.current;
    const img = houseImgRef.current;
    const hero = heroRef.current;
    const dark = darkRef.current;
    if (!wrap || !inner || !img || !hero || !dark || !liftDone) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const heroRect = hero.getBoundingClientRect();
    const heroH = hero.offsetHeight;
    const darkRect = dark.getBoundingClientRect();
    const baseW = Math.max(vw, 1400);
    const imgH = img.offsetHeight || (baseW * img.naturalHeight) / (img.naturalWidth || 1);

    const triggerPoint = -(heroH * 0.3);
    const endPoint = heroRect.top - (darkRect.bottom - vh);
    const rawProgress = endPoint === triggerPoint ? 0 : (heroRect.top - triggerPoint) / (endPoint - triggerPoint);
    const progress = clamp(rawProgress, 0, 1);
    const t = smoothstep(smoothstep(progress));

    const startX = (vw - baseW) / 2;
    const startY = vh - imgH;

    const finalScale = 1.45;
    const finalX = (vw - baseW * finalScale) / 2;
    const mobileOffset = vw < 1024 ? -250 : 4;
    const finalY = darkRect.bottom - imgH * finalScale + 500 + mobileOffset;

    if (progress <= 0) {
      inner.style.position = "";
      inner.style.top = "";
      inner.style.left = "";
      inner.style.transform = "";
      inner.style.transformOrigin = "";
      wrap.style.bottom = "0";
      wrap.style.left = "50%";
      wrap.style.transform = "translateX(-50%)";
      wrap.style.width = "100%";
      wrap.style.minWidth = "1400px";
      return;
    }

    wrap.style.bottom = "auto";
    wrap.style.left = "0";
    wrap.style.transform = "none";
    wrap.style.width = baseW + "px";
    wrap.style.minWidth = "0";

    const currentX = startX + (finalX - startX) * t;
    const currentY = startY + (finalY - startY) * t;
    const currentScale = 1 + (finalScale - 1) * t;

    inner.style.position = "fixed";
    inner.style.top = "0";
    inner.style.left = "0";
    inner.style.transformOrigin = "top left";
    inner.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
  }, [liftDone]);

  useEffect(() => {
    if (!liftDone) return;
    const onScroll = () => requestAnimationFrame(updateHousePosition);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateHousePosition();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [liftDone, updateHousePosition]);

  const navColor = navOnDark ? "#ffffff" : BRAND_DARK;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        .font-primary { font-family: 'Syne', sans-serif; }
        .font-secondary { font-family: 'Inter', sans-serif; }
        body { background: #f5f0ea; overflow-x: clip; margin: 0; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        @media (max-width: 639px) {
          .hero-subtitle-desktop { display: none !important; }
          .hero-subtitle-mobile  { display: block !important; }
          .hero-text-block { padding-top: 90px !important; }
          .hero-heading-top { justify-content: flex-start !important; }
          .hero-own-the { font-size: 7.5vw !important; }
          .hero-extraordinary { font-size: 14.5vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-subtitle-desktop { display: none !important; }
          .hero-subtitle-mobile  { display: block !important; }
          .hero-text-block { padding-top: 110px !important; }
          .hero-heading-top { justify-content: flex-start !important; }
          .hero-own-the { font-size: 5.5vw !important; }
          .hero-extraordinary { font-size: 11vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
        }
        @media (min-width: 1024px) {
          .hero-subtitle-desktop { display: block !important; }
          .hero-subtitle-mobile  { display: none !important; }
          .hero-text-block { padding-top: calc(28vh - 50px) !important; }
          .hero-own-the { font-size: 3vw !important; }
          .hero-extraordinary { font-size: clamp(52px, 6.5vw, 9vw) !important; white-space: nowrap !important; line-height: 0.88 !important; }
        }

        .s2-statement {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          color: #e8e4df;
          letter-spacing: -0.02em;
          line-height: 1.35;
          white-space: nowrap;
          font-size: clamp(22px, 2.6vw, 42px);
        }
        .s2-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          padding: clamp(30px, 4vw, 60px) 1.5rem clamp(60px, 8vw, 120px);
        }
        @media (min-width: 768px) { .s2-content { padding-left: 2.5rem; padding-right: 2.5rem; } }
        @media (min-width: 1024px) { .s2-content { padding-left: 4rem; padding-right: 4rem; } }
        .s2-stats-row {
          max-width: 1200px;
          margin: clamp(48px, 6vw, 80px) auto 0;
          padding-left: 25%;
          display: flex;
          width: 100%;
        }
        .s2-stat-item { flex: 1; }
        .s2-stat-item + .s2-stat-item {
          border-left: 1px solid rgba(255,255,255,0.2);
          padding-left: clamp(20px, 2.5vw, 40px);
        }
        .s2-stat-num {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          color: #fff;
          font-size: clamp(36px, 4.5vw, 72px);
          line-height: 1.1;
        }
        .s2-stat-label {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          font-size: clamp(12px, 1.1vw, 16px);
          margin-top: clamp(4px, 0.5vw, 8px);
          letter-spacing: 0.01em;
        }
        .s2-statement-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 25%;
        }
        @media (max-width: 767px) {
          .s2-statement-wrap, .s2-stats-row { padding-left: 0 !important; }
          .s2-statement { white-space: normal !important; font-size: clamp(20px, 5.5vw, 32px) !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .s2-statement-wrap, .s2-stats-row { padding-left: 15% !important; }
          .s2-section { min-height: 70vh !important; }
          .s2-statement { white-space: normal !important; }
        }

        .s3-gallery-section {
          position: relative; z-index: 25; margin-top: -100vh;
          background: #1a1a1a; height: 100vh; overflow: hidden;
        }
        .s3-ticker-wrap {
          position: absolute; inset: 0;
          display: flex; align-items: center;
          overflow: hidden; z-index: 0; pointer-events: none;
        }
        .ticker-track { display: flex; white-space: nowrap; }
        .ticker-word {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(100px, 14vw, 220px);
          color: rgba(255,255,255,0.04);
          white-space: nowrap; letter-spacing: -0.02em;
          user-select: none; padding-right: 0.3em;
        }
        .s3-gallery-content {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          height: 100%; padding: clamp(24px, 4vw, 60px);
        }
        .gallery-expand-row {
          display: flex; gap: 6px; height: 70%;
          max-width: 1200px; width: 100%;
        }
        .gallery-expand-item {
          flex: 1 1 0%; height: 100%; border-radius: 12px;
          overflow: hidden; cursor: pointer;
          transition: flex 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gallery-expand-item.expanded { flex: 4; }
        .gallery-expand-item video { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 1023px) {
          .s3-gallery-section { height: auto; min-height: 100vh; overflow: visible; }
          .s3-ticker-wrap { position: sticky; top: 0; height: 100vh; width: 100%; margin-bottom: -100vh; }
          .s3-gallery-content { height: auto; align-items: flex-start; padding: 80px 16px 60px; }
          .gallery-expand-row {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 8px; height: auto; width: 100%; max-width: 700px;
          }
          .gallery-expand-item {
            flex: none !important; height: auto;
            aspect-ratio: 4/5; border-radius: 10px;
            transition: transform 0.3s ease;
          }
          .gallery-expand-item:hover { transform: scale(1.02); }
          .gallery-expand-item:last-child:nth-child(odd) {
            grid-column: 1 / -1; max-width: calc(50% - 4px); justify-self: center;
          }
        }
        @media (max-width: 479px) {
          .s3-gallery-content { padding: 60px 12px 48px; }
          .gallery-expand-row { gap: 6px; }
        }
      `}</style>

      {/* ── Preloader ── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: BRAND_DARK,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: lifting ? "translateY(-100%)" : "translateY(0)",
          transition: lifting && !liftDone ? "transform 1.5s cubic-bezier(0.45, 0, 0.15, 1)" : "none",
          pointerEvents: liftDone ? "none" : "auto",
        }}
      >
        <span
          className="font-primary"
          style={{ fontSize: "2.6rem", color: "#fff", letterSpacing: "-0.02em", display: "inline-flex", alignItems: "center" }}
        >
          {typed.split("").map((ch, i) => (
            <span key={i} style={{ fontWeight: ch === "o" && i === FULL_TEXT.length - 1 ? 900 : 700 }}>
              {ch === " " ? " " : ch}
            </span>
          ))}
          {showCursor && (
            <span
              style={{
                display: "inline-block", width: 3, height: "1.1em",
                background: "#fff", borderRadius: 2, marginLeft: 2,
                animation: "blink 0.7s step-end infinite",
              }}
            />
          )}
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 lg:px-16 py-5 md:py-6">
        <BrandLogo color={navColor} className="text-xl" />
        <button
          className="relative z-50 flex flex-col items-end justify-center gap-[7px] w-10 h-10"
          onClick={() => setMenuOpen(!menuOpen)}
          onMouseEnter={() => setHamburgerHover(true)}
          onMouseLeave={() => setHamburgerHover(false)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={24} style={{ color: BRAND_DARK, transition: "color 0.35s ease" }} />
          ) : (
            <>
              <span style={{ display: "block", height: 1, background: navColor, transition: "width 0.3s ease, background 0.35s ease", width: hamburgerHover ? 20 : 28 }} />
              <span style={{ display: "block", width: 28, height: 1, background: navColor, transition: "background 0.35s ease" }} />
            </>
          )}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8" style={{ background: "#f5f0ea" }}>
          {["Projects", "Philosophy", "Gallery", "Inquire"].map((link) => (
            <button
              key={link}
              className="font-primary text-4xl font-light tracking-widest uppercase hover:text-gray-500 transition-colors"
              style={{ color: "#000" }}
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </button>
          ))}
        </div>
      )}

      {/* ── House Image ── */}
      <div
        ref={houseWrapRef}
        style={{ position: "fixed", zIndex: 22, pointerEvents: "none", willChange: "transform", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", minWidth: 1400 }}
      >
        <div
          ref={houseInnerRef}
          style={{
            transform: lifting ? "translateY(0)" : "translateY(102vh)",
            transition: !liftDone ? "transform 1.5s cubic-bezier(0.45, 0, 0.15, 1) 0.4s" : "none",
          }}
        >
          <img ref={houseImgRef} src={HOUSE_IMG} alt="" aria-hidden style={{ width: "100%", display: "block" }} />
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative", minHeight: "100vh", overflow: "visible",
          backgroundImage: `url(${BG_IMG})`, backgroundSize: "cover",
          backgroundPosition: "center center", backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="hero-text-block"
          style={{
            position: "relative", zIndex: 10,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(-28px)",
            transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
          }}
        >
          <div className="hero-heading-top flex items-end justify-between px-6 md:px-10 lg:px-16" style={{ marginBottom: "-0.04em" }}>
            <span className="font-primary hero-own-the uppercase" style={{ fontWeight: 800, color: "#000", letterSpacing: "-0.03em", lineHeight: 1 }}>
              BUILT WITH
            </span>
            <p
              className="hero-subtitle-desktop font-primary text-right"
              style={{ fontWeight: 700, fontSize: "clamp(10px, 0.95vw, 14px)", maxWidth: 300, opacity: 0.7, lineHeight: 1.6, marginBottom: "0.2em", letterSpacing: "0.02em", display: "none" }}
            >
              Passive House architecture with vision,<br />craft, and site-specific precision.
            </p>
          </div>
          <div style={{ overflow: "hidden" }}>
            <h1
              className="font-primary hero-extraordinary uppercase px-6 md:px-10 lg:px-16"
              style={{ fontWeight: 800, color: "#000", letterSpacing: "-0.03em", margin: 0 }}
            >
              PERMANENCE
            </h1>
          </div>
          <p
            className="hero-subtitle-mobile font-primary px-6"
            style={{ fontWeight: 600, fontSize: "clamp(12px, 3vw, 15px)", opacity: 0.65, marginTop: "0.9em", display: "none" }}
          >
            Passive House architecture with vision,<br />craft, and site-specific precision.
          </p>
        </div>
      </section>

      {/* ── Dark Statement + Stats ── */}
      <div ref={darkRef} style={{ position: "relative", height: "200vh", zIndex: 20 }}>
        <div style={{ height: "4vh", background: "#1a1a1a" }} />
        <div
          className="s2-section"
          style={{ position: "sticky", top: 0, height: "100vh", background: "#1a1a1a", overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div className="s2-content">
            <div className="s2-statement-wrap">
              <p className="s2-statement">
                Every structure we design is shaped<br />
                through a lens of permanence, sustainability,<br />
                and site-specific intention. Passive House<br />
                is not a label. It is our discipline.
              </p>
            </div>
            <div className="s2-stats-row">
              <div className="s2-stat-item">
                <div className="s2-stat-num"><CountUp end={15} suffix="+" /></div>
                <div className="s2-stat-label">Years of Practice</div>
              </div>
              <div className="s2-stat-item">
                <div className="s2-stat-num"><CountUp end={2} /></div>
                <div className="s2-stat-label">Studios — Austin + NYC</div>
              </div>
              <div className="s2-stat-item">
                <div className="s2-stat-num"><CountUp end={100} suffix="%" /></div>
                <div className="s2-stat-label">PHIUS + LEED Committed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div ref={galleryRef} className="s3-gallery-section">
        <div className="s3-ticker-wrap">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy} style={{ display: "flex" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="ticker-word">Saint Elmo</span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="s3-gallery-content">
          <div className="gallery-expand-row">
            {GALLERY_VIDEOS.map((src, i) => (
              <div
                key={i}
                className={`gallery-expand-item${hoveredIdx === i ? " expanded" : ""}`}
                style={hoveredIdx !== null && hoveredIdx !== i ? { flex: "0.6 1 0%" } : undefined}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <video src={src} autoPlay loop muted playsInline />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#1a1a1a", position: "relative", zIndex: 26 }} className="py-16 px-6 md:px-10 lg:px-16">
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.15) 80%, transparent 100%)", marginBottom: 48 }} />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <BrandLogo color="#e8e4df" className="text-2xl" />
            <p className="font-secondary text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Austin + New York City
            </p>
            <p className="font-secondary text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Passive House &middot; LEED &middot; AIA &middot; CPHC
            </p>
            <p className="font-secondary text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              Sergey Belov, Principal — Cornell B.Arch<br />
              Stephanie Belov, Interiors — MA Sustainable Design, UT
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/in/sergeybelovarchitect" target="_blank" rel="noopener noreferrer" className="font-secondary text-sm hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.5)" }}>
              LinkedIn
            </a>
            <a href="https://saintelmoarch.com" target="_blank" rel="noopener noreferrer" className="font-secondary text-sm hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.5)" }}>
              Website
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
