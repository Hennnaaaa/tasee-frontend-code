'use client';

const DRESS_IMAGES = [
  ['IMG_5015.jpg','IMG_5016.jpg','IMG_5017.jpg','IMG_5018.jpg','IMG_5019.jpg','IMG_5020.jpg','IMG_5021.jpg','IMG_5022.jpg','IMG_5023.jpg','IMG_5234.JPG'],
  ['IMG_5036.jpg','IMG_5037.jpg','IMG_5038.jpg','IMG_5039.jpg','IMG_5040.jpg','IMG_5041.jpg','IMG_5042.jpg','IMG_5043.jpg','IMG_5044.jpg','IMG_5045.jpg','IMG_5046.jpg','IMG_5047.jpg','IMG_5048.jpg','IMG_5049.jpg','IMG_5305.JPG'],
  ['IMG_5050.jpg','IMG_5051.jpg','IMG_5052.jpg','IMG_5053.jpg','IMG_5054.jpg','IMG_5055.jpg','IMG_5056.jpg','IMG_5057.jpg','IMG_5058.jpg','IMG_5059.jpg','IMG_5060.jpg'],
  ['IMG_5024.jpg','IMG_5025.jpg','IMG_5026.jpg','IMG_5027.jpg','IMG_5028.jpg','IMG_5029.jpg','IMG_5030.jpg','IMG_5031.jpg','IMG_5032.jpg','IMG_5033.jpg','IMG_5034.jpg'],
  ['IMG_5061.jpg','IMG_5062.JPG','IMG_5063.JPG','IMG_5064.JPG','IMG_5065.JPG','IMG_5066.JPG','IMG_5067.JPG','IMG_5068.JPG','IMG_5069.JPG','IMG_5342.JPG'],
];

const BANNER_IMAGES = (() => {
  const out = [];
  const maxLen = Math.max(...DRESS_IMAGES.map(d => d.length));
  for (let r = 0; r < maxLen; r++) {
    DRESS_IMAGES.forEach((dress, di) => {
      if (r < dress.length) out.push(`/hero-slides/dress-${di + 1}/${dress[r]}`);
    });
  }
  return out;
})();

// Duplicate for seamless infinite loop
const DOUBLED = [...BANNER_IMAGES, ...BANNER_IMAGES];

export default function ScrollingImageBanner() {
  return (
    <div className="sm:hidden overflow-hidden w-full bg-white">
      <style>{`
        @keyframes banner-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .banner-track {
          display: flex;
          width: max-content;
          animation: banner-scroll 70s linear infinite;
          will-change: transform;
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
              className="w-full h-full object-cover"
              style={{ filter: 'sepia(30%) brightness(0.78) contrast(1.05)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
