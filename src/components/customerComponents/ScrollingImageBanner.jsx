'use client';

// Seeded RNG — deterministic so SSR and client produce the same order
let _seed = 42;
const rng = () => {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return (_seed >>> 0) / 0xffffffff;
};
const seededShuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const DRESS_IMAGES = [
  { d: 1,  imgs: ['IMG_5015.jpg','IMG_5016.jpg','IMG_5017.jpg','IMG_5018.jpg','IMG_5019.jpg','IMG_5020.jpg','IMG_5021.jpg','IMG_5022.jpg','IMG_5023.jpg','IMG_5234.JPG'] },
  { d: 2,  imgs: ['IMG_5036.jpg','IMG_5037.jpg','IMG_5038.jpg','IMG_5039.jpg','IMG_5040.jpg','IMG_5041.jpg','IMG_5042.jpg','IMG_5043.jpg','IMG_5044.jpg','IMG_5045.jpg','IMG_5046.jpg','IMG_5047.jpg','IMG_5048.jpg','IMG_5049.jpg','IMG_5305.JPG'] },
  { d: 3,  imgs: ['IMG_5050.jpg','IMG_5051.jpg','IMG_5052.jpg','IMG_5053.jpg','IMG_5054.jpg','IMG_5055.jpg','IMG_5056.jpg','IMG_5057.jpg','IMG_5058.jpg','IMG_5059.jpg','IMG_5060.jpg'] },
  { d: 4,  imgs: ['IMG_5024.jpg','IMG_5025.jpg','IMG_5026.jpg','IMG_5027.jpg','IMG_5028.jpg','IMG_5029.jpg','IMG_5030.jpg','IMG_5031.jpg','IMG_5032.jpg','IMG_5033.jpg','IMG_5034.jpg'] },
  { d: 5,  imgs: ['IMG_5061.jpg','IMG_5062.JPG','IMG_5063.JPG','IMG_5064.JPG','IMG_5065.JPG','IMG_5066.JPG','IMG_5067.JPG','IMG_5068.JPG','IMG_5069.JPG','IMG_5342.JPG'] },
  // Lueur collection
  { d: 6,  imgs: ['IMG_2150.JPG','IMG_2151.JPG','IMG_2152.JPG','IMG_2153.JPG','IMG_2154.JPG','IMG_2155.JPG','IMG_2156.JPG','IMG_2157.JPG'] },
  { d: 7,  imgs: ['IMG_2139.JPG','IMG_2140.JPG','IMG_2141.JPG','IMG_2142.JPG','IMG_2143.JPG','IMG_2144.JPG','IMG_2145.JPG','IMG_2146.JPG','IMG_2147.JPG'] },
  { d: 8,  imgs: ['IMG_2130.JPG','IMG_2131.JPG','IMG_2132.JPG','IMG_2133.JPG','IMG_2134.JPG','IMG_2135.JPG'] },
  { d: 9,  imgs: ['IMG_2125.JPG','IMG_2126.JPG','IMG_2127.JPG','IMG_2128.JPG','IMG_2129.JPG'] },
  { d: 10, imgs: ['IMG_2115.JPG','IMG_2116.JPG','IMG_2117.JPG','IMG_2118.JPG','IMG_2119.JPG','IMG_2120.JPG','IMG_2121.JPG'] },
];

// Pick up to 4 random images per folder to keep DOM lean (~40 nodes total)
const PER_FOLDER = 4;
const buckets = DRESS_IMAGES.map(({ d, imgs }) =>
  seededShuffle(imgs).slice(0, PER_FOLDER).map(name => ({ src: `/hero-slides/dress-${d}/${name}`, d }))
);

// Greedy no-adjacent-same-folder: always pick from the largest bucket ≠ last folder
const buildOrdered = (buckets) => {
  const groups = buckets.map(b => [...b]);
  const result = [];
  let lastD = -1;
  while (true) {
    let best = -1, bestLen = 0;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length > 0 && groups[i][0].d !== lastD && groups[i].length > bestLen) {
        bestLen = groups[i].length;
        best = i;
      }
    }
    // Fallback: only the last folder remains
    if (best === -1) {
      best = groups.findIndex(g => g.length > 0);
      if (best === -1) break;
    }
    const item = groups[best].shift();
    result.push(item.src);
    lastD = item.d;
  }
  return result;
};

const BANNER_IMAGES = buildOrdered(buckets);
const DOUBLED = [...BANNER_IMAGES, ...BANNER_IMAGES];

export default function ScrollingImageBanner() {
  return (
    <div className="sm:hidden overflow-hidden w-full bg-white">
      <style>{`
        @keyframes banner-scroll {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .banner-track {
          display: flex;
          width: max-content;
          animation: banner-scroll 55s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .banner-track img {
          backface-visibility: hidden;
        }
      `}</style>
      <div className="banner-track">
        {DOUBLED.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{ width: '47vw', height: '230px', marginRight: '4px' }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ filter: 'sepia(30%) brightness(0.78) contrast(1.05)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
