'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ReelCard({ src, poster, className = '' }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mountTimerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // iOS Safari ignores React's muted JSX prop — ref callback sets it on the DOM node directly
  const setVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.defaultMuted = true;
    }
  }, []);

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
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.muted = true;
      window.dispatchEvent(new CustomEvent('reel-play', { detail: { src } }));
      setBuffering(true);
      video.play()
        .then(() => setPlaying(true))
        .catch(() => { setBuffering(false); setPlaying(false); });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer select-none group bg-stone-900 aspect-[9/16] md:aspect-[3/4] ${className}`}
      onClick={toggle}
    >
      {/* Poster image — always visible when video is not playing.
          Using <img> instead of the <video poster> attribute because the browser
          poster disappears after the first play/pause cycle, showing black instead. */}
      {poster && !playing && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Skeleton only before the card enters the viewport and no poster is available */}
      {!inView && !poster && (
        <div className="absolute inset-0 bg-stone-800 animate-pulse" />
      )}

      {/* Video — invisible when not playing so CSS poster shows through underneath */}
      {inView && (
        <video
          ref={setVideoRef}
          playsInline
          loop
          muted
          preload="metadata"
          onWaiting={() => setBuffering(true)}
          onPlaying={() => { setBuffering(false); setPlaying(true); }}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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
