'use client';

import { useState, useEffect, useRef } from 'react';

export default function ReelCard({ src, className = '' }) {
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
      className={`relative overflow-hidden cursor-pointer select-none group bg-stone-900 aspect-[9/16] md:aspect-[3/4] ${className}`}
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
          ? <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          : <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        }
      </div>
    </div>
  );
}
