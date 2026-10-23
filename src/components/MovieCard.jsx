import React, { useState, useRef } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { getFallbackImage } from '../utils/imageUtils';

function Top10SvgNumber({ rank }) {
  return (
    <div className="top10-rank-number" aria-label={`Top ${rank}`}>
      <svg className="top10-svg-glyph" viewBox="0 0 100 160">
        <text
          x={rank === 1 ? '58' : rank === 10 ? '48' : '52'}
          y="142"
          textAnchor="middle"
          fontSize={rank === 10 ? '135' : '155'}
          fontWeight="900"
          fontFamily="'Bebas Neue', 'Impact', sans-serif"
          className="top10-text-outline"
        >
          {rank}
        </text>
        <text
          x={rank === 1 ? '58' : rank === 10 ? '48' : '52'}
          y="142"
          textAnchor="middle"
          fontSize={rank === 10 ? '135' : '155'}
          fontWeight="900"
          fontFamily="'Bebas Neue', 'Impact', sans-serif"
          className="top10-text-fill"
        >
          {rank}
        </text>
      </svg>
    </div>
  );
}

export default function MovieCard({
  movie,
  onPlay,
  onOpenDetail,
  isInMyList,
  onToggleMyList,
  isTall = false,
  rank = null
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const inList = isInMyList(movie.id);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 280);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  const imgSrc = (isTall || rank) ? (movie.poster || movie.backdrop) : (movie.backdrop || movie.poster);
  const fallbackSrc = getFallbackImage(movie.title, (isTall || rank) ? 'poster' : 'backdrop', movie.themeColor, movie.ott);

  return (
    <div
      className={`movie-card-container ${isTall ? 'tall-card' : ''} ${rank ? 'has-rank' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Authentic Netflix Top 10 Giant 3D Number */}
      {rank && <Top10SvgNumber rank={rank} />}

      {/* Main Base Card */}
      <div 
        className="movie-card-base"
        onClick={() => onOpenDetail(movie)}
      >
        <img
          src={imgError ? fallbackSrc : (imgSrc || fallbackSrc)}
          alt={movie.title}
          className="movie-card-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />

        {/* OTT Platform Original ribbon badge (Netflix Red "N", Prime "PRIME", Disney+ "DISNEY+") */}
        {movie.isOriginal && (
          (!movie.ott || movie.ott === 'nf') ? (
            <div className="card-n-badge" title="Netflix Original">
              <span className="n-ribbon-text">N</span>
            </div>
          ) : movie.ott === 'pv' ? (
            <div className="card-ott-badge prime" title="Prime Video Original">
              <span className="ott-ribbon-text">PRIME</span>
            </div>
          ) : movie.ott === 'hs' ? (
            <div className="card-ott-badge disney" title="Disney+ Original">
              <span className="ott-ribbon-text">DISNEY+</span>
            </div>
          ) : movie.ott === 'appleTV' ? (
            <div className="card-ott-badge apple" title="Apple Original">
              <span className="ott-ribbon-text">TV+</span>
            </div>
          ) : movie.ott === 'zee5' ? (
            <div className="card-ott-badge zee5" title="Zee5 Exclusive">
              <span className="ott-ribbon-text">ZEE5</span>
            </div>
          ) : null
        )}

        {/* Recently Added / Top 10 Ribbon Tag */}
        {movie.top10Rank && !rank && (
          <div className={`card-top10-pill ${movie.ott || 'nf'}`}>
            <span>TOP 10</span>
          </div>
        )}

        {/* Continue Watching Progress Bar */}
        {movie.episodes && movie.episodes[0]?.progress > 0 && (
          <div className="card-progress-bar">
            <div 
              className="card-progress-fill" 
              style={{ width: `${movie.episodes[0].progress}%` }} 
            />
          </div>
        )}

        {/* Card Overlay Title */}
        <div className="card-gradient-overlay">
          <span className="card-overlay-title">{movie.title}</span>
        </div>
      </div>

      {/* Hover Expand Popup (Netflix signature hover puff-up) */}
      {isHovered && (
        <div 
          className="movie-card-popup"
          onClick={(e) => {
            if (e.target.closest('button')) return;
            onOpenDetail(movie);
          }}
        >
          {/* Popup Media Preview */}
          <div className="popup-media-wrapper">
            <img
              src={imgError ? fallbackSrc : (movie.backdrop || fallbackSrc)}
              alt={movie.title}
              className="popup-media-img"
              referrerPolicy="no-referrer"
            />
            {movie.isOriginal && (
              <div className={`popup-n-badge ${movie.ott || 'nf'}`}>
                <span className="n-icon">
                  {movie.ott === 'pv' ? 'PRIME' : movie.ott === 'hs' ? 'DISNEY+' : movie.ott === 'appleTV' ? 'TV+' : movie.ott === 'zee5' ? 'ZEE5' : 'N'}
                </span>
                <span className="popup-series-tag">{movie.isSeries ? 'S E R I E S' : 'F I L M'}</span>
              </div>
            )}
            <div className="popup-media-gradient" />
            <h4 className="popup-media-title">{movie.title}</h4>
          </div>

          {/* Popup Quick Details & Actions */}
          <div className="popup-info-body">
            {/* Quick Action Buttons Row */}
            <div className="popup-actions-row">
              <div className="popup-actions-left">
                <button
                  className="popup-btn-play"
                  onClick={() => onPlay(movie)}
                  title={`Play ${movie.title}`}
                >
                  <Play size={18} fill="#000" color="#000" />
                </button>
                <button
                  className={`popup-btn-circle ${inList ? 'active' : ''}`}
                  onClick={() => onToggleMyList(movie)}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? <Check size={16} /> : <Plus size={16} />}
                </button>
                <button
                  className={`popup-btn-circle ${isLiked ? 'active' : ''}`}
                  onClick={() => setIsLiked(!isLiked)}
                  title={isLiked ? 'Liked' : 'Rate this'}
                >
                  <ThumbsUp size={15} fill={isLiked ? '#fff' : 'none'} />
                </button>
              </div>

              <button
                className="popup-btn-circle popup-btn-expand"
                onClick={() => onOpenDetail(movie)}
                title="Episode & Info"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Metadata Line */}
            <div className="popup-metadata-line">
              <span className="popup-match">{movie.matchScore || 98}% Match</span>
              <span className="popup-rating">{movie.rating || 'U/A 16+'}</span>
              <span className="popup-duration">{movie.duration}</span>
              <span className="popup-hd">4K Ultra HD</span>
            </div>

            {/* Genres Dot Tags */}
            <div className="popup-genres-line">
              {movie.genres?.slice(0, 3).map((genre, idx) => (
                <span key={genre} className="popup-genre-item">
                  {idx > 0 && <span className="genre-dot">•</span>}
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
