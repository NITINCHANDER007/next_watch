import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, Plus, Check } from 'lucide-react';
import { getFallbackImage } from '../utils/imageUtils';

export default function HeroBillboard({
  movie,
  onPlay,
  onOpenDetail,
  isInMyList,
  onToggleMyList,
  soundEnabled,
  onToggleSound,
  isModalOpen = false
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true); // Always mute trailer by default
  const [activeTrailerId, setActiveTrailerId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setLogoError(false);
    let active = true;

    if (isModalOpen) {
      setActiveTrailerId(null);
      setIsTrailerMuted(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (movie?.youtubeId) {
      timerRef.current = setTimeout(() => {
        if (active && !isModalOpen) {
          setActiveTrailerId(movie.id);
        }
      }, 1600);
    }

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [movie?.id, movie?.youtubeId, isModalOpen]);

  if (!movie) return null;

  // Trailer is completely disabled if any modal/player is open
  const showVideoTrailer = !isModalOpen && activeTrailerId === movie.id;

  const inList = isInMyList(movie.id);
  const fallbackSrc = getFallbackImage(movie.title, 'backdrop', movie.themeColor);

  return (
    <section className="hero-billboard">
      {/* Background Media Layer: High-Res Backdrop + Live Ambient Trailer Video */}
      <div className="hero-media-layer">
        <img
          src={imgError ? fallbackSrc : (movie.backdrop || fallbackSrc)}
          alt={movie.title}
          className={`hero-bg-img ${imgLoaded ? 'loaded' : ''} ${showVideoTrailer ? 'fade-out' : ''}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
        />

        {/* Ambient Video Trailer Preview */}
        {showVideoTrailer && movie.youtubeId && (
          <div className="hero-video-trailer-wrapper">
            <iframe
              title={`${movie.title} Trailer`}
              src={`https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&mute=${isTrailerMuted ? '1' : '0'}&controls=0&loop=1&playlist=${movie.youtubeId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="hero-video-trailer-iframe"
            />
          </div>
        )}

        {/* Cinematic Multi-Directional Netflix Vignettes */}
        <div className="hero-vignette-left" />
        <div className="hero-vignette-bottom" />
        <div className="hero-vignette-top" />
      </div>

      {/* Hero Content Information */}
      <div className="hero-content">
        {/* Dynamic Netflix Brand Tag */}
        <div className="hero-brand-tag">
          <span 
            className="hero-n-badge"
            style={{
              background: movie.ott === 'pv' ? '#00A8E1' : movie.ott === 'hs' ? '#113CCF' : movie.ott === 'appleTV' ? '#666' : '#e50914'
            }}
          >
            {movie.ott === 'pv' ? 'P' : movie.ott === 'hs' ? 'D+' : movie.ott === 'appleTV' ? '' : 'N'}
          </span>
          <span className="hero-series-text">
            {movie.ott === 'pv'
              ? 'A M A Z O N   O R I G I N A L'
              : movie.ott === 'hs'
              ? 'D I S N E Y +   O R I G I N A L'
              : movie.ott === 'appleTV'
              ? 'A P P L E   O R I G I N A L'
              : movie.isSeries
              ? 'N E T F L I X   S E R I E S'
              : 'N E T F L I X   F I L M'}
          </span>
        </div>

        {/* Title Artwork */}
        {movie.namelogo && !logoError ? (
          <div className="hero-title-logo-wrap">
            <img 
              src={movie.namelogo} 
              alt={movie.title} 
              className="hero-namelogo-img"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)} 
            />
          </div>
        ) : (
          <h1 className="hero-title">{movie.title}</h1>
        )}

        {/* Badges / Accolades Row */}
        <div className="hero-badges-row">
          {movie.top10Rank && (
            <div className="hero-top10-badge">
              <span className="top10-icon">TOP 10</span>
              <span className="top10-text">#{movie.top10Rank} in TV Shows Today</span>
            </div>
          )}
          <span className="hero-match-score">{movie.matchScore || 99}% Match</span>
          <span className="hero-rating-pill">{movie.rating || 'U/A 16+'}</span>
          <span className="hero-duration">{movie.duration}</span>
          <span className="hero-quality-badge">{movie.quality || '4K Ultra HD'}</span>
          <span className="hero-spatial-audio">Spatial Audio</span>
        </div>

        {/* Synopsis */}
        <p className="hero-synopsis">{movie.synopsis}</p>

        {/* Action Buttons */}
        <div className="hero-actions">
          <button 
            className="hero-btn btn-play"
            onClick={() => onPlay(movie)}
            title={`Play ${movie.title}`}
          >
            <Play size={24} fill="currentColor" />
            <span>Play</span>
          </button>

          <button 
            className="hero-btn btn-info"
            onClick={() => onOpenDetail(movie)}
            title="More Information"
          >
            <Info size={22} />
            <span>More Info</span>
          </button>

          <button
            className={`hero-btn-circle ${inList ? 'in-list' : ''}`}
            onClick={() => onToggleMyList(movie)}
            title={inList ? 'Remove from My List' : 'Add to My List'}
          >
            {inList ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* Bottom Right Floating Controls */}
      <div className="hero-bottom-right">
        {movie.youtubeId && (
          <button 
            className="hero-sound-toggle"
            onClick={() => setIsTrailerMuted(!isTrailerMuted)}
            title={isTrailerMuted ? 'Unmute Trailer Audio' : 'Mute Trailer Audio'}
          >
            {isTrailerMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}

        <div className="hero-maturity-badge">
          <span className="maturity-age">{movie.rating || '16+'}</span>
          <span className="maturity-desc">violence, gore, language</span>
        </div>
      </div>
    </section>
  );
}
