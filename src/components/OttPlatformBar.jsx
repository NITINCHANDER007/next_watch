import React, { useRef, useState, useEffect } from 'react';
import { Zap, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { NETMIRROR_PLATFORMS } from '../services/netmirrorService';

export default function OttPlatformBar({
  activeOtt,
  onSelectOtt,
  onOpenNetmirrorCenter
}) {
  const chipsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!chipsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = chipsScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleWheel = (e) => {
    if (chipsScrollRef.current && Math.abs(e.deltaY) > 0) {
      chipsScrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleScrollLeft = () => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="ott-platform-bar-wrapper">
      <div className="ott-platform-bar-inner">
        <div className="ott-bar-left-label">
          <div className="ott-tv-pulse-wrap">
            <Tv size={15} className="ott-tv-icon" />
            <span className="tv-pulse-dot" />
          </div>
          <span className="ott-label-text">OTT PLATFORMS</span>
        </div>

        <div className="ott-chips-nav-container">
          {canScrollLeft && (
            <button 
              className="ott-scroll-arrow left" 
              onClick={handleScrollLeft}
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div 
            className="ott-platform-chips-scroll"
            ref={chipsScrollRef}
            onWheel={handleWheel}
            onScroll={checkScroll}
          >
            {NETMIRROR_PLATFORMS.map((platform) => {
              const isActive = activeOtt === platform.id;
              return (
                <button
                  key={platform.id}
                  className={`ott-chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectOtt(platform.id)}
                  style={{
                    '--platform-color': platform.brandColor,
                    '--platform-bg': platform.bgDark
                  }}
                  title={platform.tagline}
                >
                  <div className="ott-chip-logo-wrap">
                    <img src={platform.logo} alt={platform.name} />
                  </div>
                  <span className="ott-chip-name">{platform.name}</span>
                  {isActive && (
                    <>
                      <span className="ott-chip-active-dot" style={{ backgroundColor: platform.brandColor }} />
                      <span className="ott-chip-active-glow" />
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button 
              className="ott-scroll-arrow right" 
              onClick={handleScrollRight}
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <button 
          className="netmirror-center-trigger-btn"
          onClick={onOpenNetmirrorCenter}
          title="Open Streaming Center & Network Status"
        >
          <Zap size={13} className="bolt-icon" />
          <span className="btn-label-text">NetMirror Center</span>
          <span className="live-status-pill">
            <span className="live-dot-ping" />
            LIVE
          </span>
        </button>
      </div>
    </div>
  );
}
