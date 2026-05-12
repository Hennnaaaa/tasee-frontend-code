'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Newsletter from '@/components/Newsletter';
import { GET_ALL_CATEGORIES } from '@/utils/routes/customerRoutes';

// ── Screen size hook ──────────────────────────────────────────
const useScreenSize = () => {
  const [s, setS] = useState('desktop');
  useEffect(() => {
    const check = () => setS(window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop');
    check();
    let t;
    const h = () => { clearTimeout(t); t = setTimeout(check, 150); };
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); clearTimeout(t); };
  }, []);
  return s;
};

// ── Hero slideshow data ───────────────────────────────────────
// Round-robin: D1[0]→D2[0]→D3[0]→D4[0]→D5[0]→D1[1]→D2[1]→…
const DRESS_IMAGES = [
  ['IMG_5015.jpg','IMG_5016.jpg','IMG_5017.jpg','IMG_5018.jpg','IMG_5019.jpg','IMG_5020.jpg','IMG_5021.jpg','IMG_5022.jpg','IMG_5023.jpg','IMG_5234.JPG'],
  ['IMG_5036.jpg','IMG_5037.jpg','IMG_5038.jpg','IMG_5039.jpg','IMG_5040.jpg','IMG_5041.jpg','IMG_5042.jpg','IMG_5043.jpg','IMG_5044.jpg','IMG_5045.jpg','IMG_5046.jpg','IMG_5047.jpg','IMG_5048.jpg','IMG_5049.jpg','IMG_5305.JPG'],
  ['IMG_5050.jpg','IMG_5051.jpg','IMG_5052.jpg','IMG_5053.jpg','IMG_5054.jpg','IMG_5055.jpg','IMG_5056.jpg','IMG_5057.jpg','IMG_5058.jpg','IMG_5059.jpg','IMG_5060.jpg'],
  ['IMG_5024.jpg','IMG_5025.jpg','IMG_5026.jpg','IMG_5027.jpg','IMG_5028.jpg','IMG_5029.jpg','IMG_5030.jpg','IMG_5031.jpg','IMG_5032.jpg','IMG_5033.jpg','IMG_5034.jpg'],
  ['IMG_5061.jpg','IMG_5062.JPG','IMG_5063.JPG','IMG_5064.JPG','IMG_5065.JPG','IMG_5066.JPG','IMG_5067.JPG','IMG_5068.JPG','IMG_5069.JPG','IMG_5342.JPG'],
];

const HERO_SLIDES = (() => {
  const maxLen = Math.max(...DRESS_IMAGES.map(d => d.length));
  const out = [];
  for (let r = 0; r < maxLen; r++) {
    DRESS_IMAGES.forEach((dress, di) => {
      if (r < dress.length) out.push(`/hero-slides/dress-${di + 1}/${dress[r]}`);
    });
  }
  return out;
})();

// ── Desktop hero: 3-up crossfade slideshow ───────────────────
// Shows 3 portrait images side by side so the full image height is
// visible — no top/bottom cropping. Groups of 3 advance together.
const GROUP_SIZE = 3;
const TOTAL_GROUPS = Math.floor(HERO_SLIDES.length / GROUP_SIZE);

function HeroSlideshow({ onReady }) {
  const [currGroup, setCurrGroup] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrGroup(g => (g + 1) % TOTAL_GROUPS);
        setFading(false);
      }, 700);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const slice = (g) => HERO_SLIDES.slice(g * GROUP_SIZE, g * GROUP_SIZE + GROUP_SIZE);
  const currImages = slice(currGroup);
  const nextImages = slice((currGroup + 1) % TOTAL_GROUPS);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Next group underneath — always fully visible, preloaded */}
      <div className="absolute inset-0 flex gap-px bg-black">
        {nextImages.map((src, i) => (
          <div key={`n${i}`} className="flex-1 overflow-hidden">
            <img src={src} alt="" aria-hidden="true"
              className="w-full h-full object-cover object-center" />
          </div>
        ))}
      </div>

      {/* Current group on top — only applies transition when fading OUT.
          No transition on restore, so the swap is instant with no flash. */}
      <div className={`absolute inset-0 flex gap-px bg-black ${fading ? 'opacity-0 transition-opacity duration-700' : 'opacity-100'}`}>
        {currImages.map((src, i) => (
          <div key={`c${currGroup}-${i}`} className="flex-1 overflow-hidden">
            <img
              src={src} alt=""
              onLoad={i === 0 ? onReady : undefined}
              className={`kb-${i} w-full h-full object-cover object-center`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Lookbook reel card ────────────────────────────────────────
function ReelCard({ src }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mountTimerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mountTimerRef.current = setTimeout(() => { setInView(true); observer.disconnect(); }, 350);
        } else {
          clearTimeout(mountTimerRef.current);
        }
      },
      { rootMargin: '40px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(mountTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!inView) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting && videoRef.current) { videoRef.current.pause(); setPlaying(false); } },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.src !== src && videoRef.current) { videoRef.current.pause(); setPlaying(false); }
    };
    window.addEventListener('reel-play', handler);
    return () => window.removeEventListener('reel-play', handler);
  }, [src]);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause(); setPlaying(false);
    } else {
      window.dispatchEvent(new CustomEvent('reel-play', { detail: { src } }));
      setBuffering(true);
      videoRef.current.play().catch(() => setBuffering(false));
      setPlaying(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-pointer select-none group bg-stone-900 aspect-[9/16] md:aspect-[3/4]"
      onClick={toggle}
    >
      {!ready && <div className="absolute inset-0 bg-stone-800 animate-pulse" />}

      {inView && (
        <video
          ref={videoRef}
          src={src}
          playsInline loop muted
          preload="metadata"
          onCanPlay={() => setReady(true)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 group-hover:from-black/30" />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${buffering ? 'opacity-0' : playing ? 'opacity-0 group-hover:opacity-60' : 'opacity-70 group-hover:opacity-100'}`}>
        {playing
          ? <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          : <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        }
      </div>
    </div>
  );
}

// ── Scroll-reveal section wrapper ─────────────────────────────
function RevealSection({ children, zIndex, bg = 'bg-white', rounded = true }) {
  return (
    <div
      className={`relative ${bg} ${rounded ? 'rounded-t-[32px]' : ''}`}
      style={{ zIndex, marginTop: rounded ? '-28px' : 0, boxShadow: rounded ? '0 -8px 40px rgba(0,0,0,0.10)' : 'none' }}
    >
      {children}
    </div>
  );
}

const REELS = [
  '/videos/reel-1.mp4','/videos/reel-2.mp4','/videos/reel-3.mp4',
  '/videos/reel-4.mp4','/videos/reel-5.mp4','/videos/reel-6.mp4',
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const screenSize = useScreenSize();
  const isMobile = mounted && screenSize === 'mobile';

  const parentCategories = categories.filter(c => !c.parentId && c.isActive);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch(`${GET_ALL_CATEGORIES}?includeInactive=false`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-stone-900">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — HERO
          Mobile  → looping video
          Desktop → crossfade image slideshow (instant, no download wait)
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 600 }}>

        {/* Dark overlay — hides until hero content is ready */}
        <div
          className="absolute inset-0 bg-stone-900 transition-opacity duration-1000"
          style={{ opacity: heroReady ? 0 : 1, zIndex: 1 }}
        />

        {/* Mobile: video */}
        {isMobile && (
          <video
            autoPlay muted loop playsInline
            preload="auto"
            src="/videos/hero.mp4"
            onCanPlay={() => setHeroReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
        )}

        {/* Desktop / Tablet: image slideshow */}
        {mounted && !isMobile && (
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HeroSlideshow onReady={() => setHeroReady(true)} />
          </div>
        )}

        {/* Cinematic gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.65) 100%)',
            zIndex: 2,
          }}
        />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-20 sm:pb-28" style={{ zIndex: 3 }}>
          <p className="text-white/55 text-[10px] tracking-[0.55em] uppercase mb-4 font-light">
            Premium Women's Fashion
          </p>
          <h1
            className="text-white font-black uppercase leading-none mb-3"
            style={{
              fontSize: screenSize === 'mobile' ? 'clamp(3rem,14vw,4.5rem)' : 'clamp(4.5rem,8vw,8rem)',
              fontFamily: "'Georgia','Times New Roman',serif",
              letterSpacing: '0.06em',
            }}
          >
            Tasee
          </h1>
          <p className="text-white/60 text-xs sm:text-sm tracking-[0.35em] uppercase mb-10 font-light" style={{ fontFamily: "'Georgia',serif" }}>
            New Collection
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
              className="bg-white text-stone-900 px-10 py-4 text-[11px] tracking-[0.3em] uppercase font-semibold hover:bg-stone-100 transition-colors duration-300 min-w-[180px] text-center"
            >
              Shop Now
            </Link>
            <a
              href="#lookbook"
              className="border border-white/60 text-white px-10 py-4 text-[11px] tracking-[0.3em] uppercase font-medium hover:bg-white/10 transition-colors duration-300 min-w-[180px] text-center"
            >
              Lookbook
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-white/30 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — CATEGORY LINKS
      ═══════════════════════════════════════════════════════ */}
      <RevealSection zIndex={10} bg="bg-white" rounded>
        {parentCategories.length > 0 && (
          <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center overflow-x-auto no-scrollbar">
              {parentCategories.slice(0, 6).map(cat => (
                <Link
                  key={cat.id}
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${cat.slug}`}
                  className="flex-shrink-0 px-5 sm:px-7 py-5 text-[10px] sm:text-xs tracking-[0.28em] uppercase text-stone-500 hover:text-stone-900 border-r border-stone-100 last:border-r-0 transition-colors whitespace-nowrap font-medium"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
                className="flex-shrink-0 px-5 sm:px-7 py-5 text-[10px] sm:text-xs tracking-[0.28em] uppercase text-stone-900 font-bold transition-colors whitespace-nowrap hover:text-stone-500"
              >
                All →
              </Link>
            </div>
          </nav>
        )}
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-20 sm:py-28 text-center">
          <p className="text-[10px] tracking-[0.45em] uppercase text-stone-400 mb-5">Est. 2024 — Pakistan</p>
          <h2
            className="text-stone-900 font-black uppercase leading-tight mb-7"
            style={{
              fontSize: screenSize === 'mobile' ? 'clamp(1.8rem,9vw,2.8rem)' : 'clamp(2.5rem,4.5vw,4.5rem)',
              fontFamily: "'Georgia','Times New Roman',serif",
              letterSpacing: '0.06em',
            }}
          >
            Crafted with<br />Intention
          </h2>
          <p className="text-stone-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10 tracking-wide">
            Every piece is designed for the woman who values quality, elegance, and timeless style above all else.
          </p>
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
            className="inline-block border border-stone-900 text-stone-900 px-12 py-4 text-[11px] tracking-[0.3em] uppercase font-medium hover:bg-stone-900 hover:text-white transition-all duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — LOOKBOOK / REELS
      ═══════════════════════════════════════════════════════ */}
      <RevealSection zIndex={20} bg="bg-stone-950" rounded>
        <section id="lookbook" className="py-20 sm:py-28">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-[10px] tracking-[0.45em] uppercase text-stone-500 mb-4">Behind the Collection</p>
              <h2
                className="text-white font-black uppercase"
                style={{
                  fontSize: screenSize === 'mobile' ? 'clamp(1.6rem,8vw,2.4rem)' : 'clamp(2rem,3.5vw,3.5rem)',
                  fontFamily: "'Georgia','Times New Roman',serif",
                  letterSpacing: '0.08em',
                }}
              >
                Lookbook
              </h2>
              <div className="w-10 h-px bg-stone-700 mx-auto mt-5" />
            </div>
            <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-3">
              {REELS.map((src) => <ReelCard key={src} src={src} />)}
            </div>
            <p className="text-center text-stone-600 text-[10px] tracking-[0.35em] mt-8 uppercase">
              Tap to play · Tap again to pause
            </p>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — NEWSLETTER
      ═══════════════════════════════════════════════════════ */}
      <RevealSection zIndex={30} bg="bg-stone-50" rounded>
        <section className="py-16 sm:py-24">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <Newsletter />
          </div>
        </section>
      </RevealSection>

    </div>
  );
}
