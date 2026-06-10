import React from 'react';
import videoSource from './8620894-uhd_3840_2160_25fps.mp4';

interface HeroProps {
  onScrollTo?: (id: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  return (
    <div className="relative w-full min-h-[90vh] bg-[#FFFDF9] border-b border-pink-100 overflow-hidden select-none">
      {/* Pure, raw background video element with no overlays or filters */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover select-none z-0"
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
