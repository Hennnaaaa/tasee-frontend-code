'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export default function ReelCard({ src, className = '' }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  // iOS Safari ignores React's muted JSX prop — must set on DOM node directly
  const setVideoRef = useCallback((node) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.defaultMuted = true;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          if (!userPausedRef.current) {
            video.play().catch(() => {});
          }
        } else {
          video.pause();
          // Reset userPaused when card leaves — ready to autoplay next time
          userPausedRef.current = false;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer select-none group bg-stone-900 aspect-[9/16] md:aspect-[3/4] ${className}`}
      onClick={toggle}
    >
      <video
        ref={setVideoRef}
        playsInline
        loop
        muted
        preload="metadata"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${playing ? 'opacity-0 group-hover:opacity-60' : 'opacity-70 group-hover:opacity-100'}`}>
        {playing
          ? <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          : <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        }
      </div>
    </div>
  );
}
