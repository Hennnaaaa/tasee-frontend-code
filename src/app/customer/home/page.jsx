'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Newsletter from '@/components/Newsletter';
import { GET_ALL_CATEGORIES } from '@/utils/routes/customerRoutes';
import ReelCard from '@/components/customerComponents/lookbook/ReelCard';

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
  ['IMG_5015.jpg','IMG_5016.jpg','IMG_5017.jpg','IMG_5018.jpg','IMG_5019.jpg','IMG_5020.jpg','IMG_5021.jpg','IMG_5022.jpg','IMG_5023.jpg'],
  ['IMG_5036.jpg','IMG_5037.jpg','IMG_5038.jpg','IMG_5039.jpg','IMG_5040.jpg','IMG_5041.jpg','IMG_5042.jpg','IMG_5043.jpg','IMG_5044.jpg','IMG_5045.jpg','IMG_5046.jpg','IMG_5047.jpg','IMG_5048.jpg','IMG_5049.jpg','IMG_5305.JPG'],
  ['IMG_5050.jpg','IMG_5051.jpg','IMG_5052.jpg','IMG_5053.jpg','IMG_5054.jpg','IMG_5055.jpg','IMG_5056.jpg','IMG_5057.jpg','IMG_5058.jpg','IMG_5059.jpg','IMG_5060.jpg'],
  ['IMG_5024.jpg','IMG_5025.jpg','IMG_5026.jpg','IMG_5027.jpg','IMG_5028.jpg','IMG_5029.jpg','IMG_5030.jpg','IMG_5031.jpg','IMG_5032.jpg','IMG_5033.jpg','IMG_5034.jpg'],
  ['IMG_5061.jpg','IMG_5062.JPG','IMG_5063.JPG','IMG_5064.JPG','IMG_5065.JPG','IMG_5066.JPG','IMG_5067.JPG','IMG_5068.JPG','IMG_5069.JPG'],
  // Lueur collection
  ['IMG_2150.JPG','IMG_2151.JPG','IMG_2152.JPG','IMG_2153.JPG','IMG_2154.JPG','IMG_2155.JPG','IMG_2156.JPG','IMG_2157.JPG'],
  ['IMG_2139.JPG','IMG_2140.JPG','IMG_2141.JPG','IMG_2142.JPG','IMG_2143.JPG','IMG_2144.JPG','IMG_2145.JPG','IMG_2146.JPG','IMG_2147.JPG'],
  ['IMG_2130.JPG','IMG_2131.JPG','IMG_2132.JPG','IMG_2133.JPG','IMG_2134.JPG','IMG_2135.JPG'],
  ['IMG_2125.JPG','IMG_2126.JPG','IMG_2127.JPG','IMG_2128.JPG','IMG_2129.JPG'],
  ['IMG_2115.JPG','IMG_2116.JPG','IMG_2117.JPG','IMG_2118.JPG','IMG_2119.JPG','IMG_2120.JPG','IMG_2121.JPG'],
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

function HeroSlideshow({ onReady, groupSize = 3 }) {
  const [currGroup, setCurrGroup] = useState(0);
  const [fading, setFading] = useState(false);
  const totalGroups = Math.floor(HERO_SLIDES.length / groupSize);

  useEffect(() => {
    setCurrGroup(0);
  }, [groupSize]);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrGroup(g => (g + 1) % totalGroups);
        setFading(false);
      }, 700);
    }, 3800);
    return () => clearInterval(t);
  }, [totalGroups]);

  const slice = (g) => HERO_SLIDES.slice(g * groupSize, g * groupSize + groupSize);
  const currImages = slice(currGroup);
  const nextImages = slice((currGroup + 1) % totalGroups);

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
  '/videos/reel-1.mp4',
  '/videos/reel-7.mp4',
  '/videos/reel-2.mp4',
  '/videos/reel-8.mp4',
  '/videos/reel-3.mp4',
  '/videos/reel-9.mp4',
  '/videos/reel-4.mp4',
  '/videos/reel-10.mp4',
  '/videos/reel-5.mp4',
  '/videos/reel-11.mp4',
  '/videos/reel-6.mp4',
  '/videos/reel-12.mp4',
  '/videos/reel-13.mp4',
  '/videos/reel-14.mp4',
  '/videos/reel-15.mp4',
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const screenSize = useScreenSize();
  const isMobile = mounted && screenSize === 'mobile';

  const parentCategories = categories.filter(c => !c.parentId && c.isActive);

  useEffect(() => { setMounted(true); }, []);

  // Fallback: reveal hero after 4 s even if video/image never fires onCanPlay/onLoad
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 4000);
    return () => clearTimeout(t);
  }, []);

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

        {/* Image slideshow for all screen sizes */}
        {mounted && (
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HeroSlideshow
              onReady={() => setHeroReady(true)}
              groupSize={screenSize === 'mobile' ? 1 : screenSize === 'tablet' ? 2 : 3}
            />
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

        {/* Scroll hint — uses safe-area-inset-bottom so it clears iPhone home indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ bottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}
        >
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
              {parentCategories.slice(0, 6).map(cat => {
                // Link to the first active subcategory — parent pages will be empty
                const firstSub = categories.find(c => c.parentId === cat.id && c.isActive !== false);
                const href = firstSub
                  ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${cat.slug}/${firstSub.slug}`
                  : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`;
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className="flex-shrink-0 px-5 sm:px-7 py-5 text-[10px] sm:text-xs tracking-[0.28em] uppercase text-stone-500 hover:text-stone-900 border-r border-stone-100 last:border-r-0 transition-colors whitespace-nowrap font-medium"
                  >
                    {cat.name}
                  </Link>
                );
              })}
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
          SECTION 3 — LOOKBOOK / REELS (horizontal scroll carousel)
      ═══════════════════════════════════════════════════════ */}
      <RevealSection zIndex={20} bg="bg-stone-950" rounded>
        <section id="lookbook" className="py-20 sm:py-28 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14 px-4 sm:px-10">
            <p className="text-[10px] tracking-[0.45em] uppercase text-stone-500 mb-4">Behind the Collection</p>
            <h2
              className="text-white font-black uppercase"
              style={{
                fontSize: screenSize === 'mobile' ? 'clamp(1.6rem,8vw,2.4rem)' : 'clamp(2rem,3.5vw,3rem)',
                fontFamily: "'Georgia','Times New Roman',serif",
                letterSpacing: '0.08em',
              }}
            >
              Lookbook
            </h2>
            <div className="w-10 h-px bg-stone-700 mx-auto mt-5" />
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-2 sm:gap-3 overflow-x-scroll no-scrollbar snap-x snap-mandatory px-4 sm:px-10 pb-4">
            {REELS.map((src) => (
              <div
                key={src}
                className="flex-shrink-0 snap-start w-[72vw] sm:w-[44vw] md:w-[30vw] lg:w-[24vw]"
              >
                <ReelCard src={src} />
              </div>
            ))}
          </div>

          <p className="text-center text-stone-700 text-[10px] tracking-[0.35em] mt-6 uppercase px-4">
            Scroll to play · Tap to pause
          </p>
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
