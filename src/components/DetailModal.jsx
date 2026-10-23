import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX, ChevronDown, Zap, Loader2, Download } from 'lucide-react';
import { getFallbackImage } from '../utils/imageUtils';
import { fetchNetMirrorPost, fetchNetMirrorSeasonEpisodes } from '../services/netmirrorService';
import { getSeriesMetadata, getSeasonEpisodes } from '../data/seriesEpisodesData';

export default function DetailModal({
  movie,
  allMovies,
  onClose,
  onPlay,
  isInMyList,
  onToggleMyList,
  soundEnabled,
  onToggleSound,
  onSelectMovie
}) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [seasonEpisodesCache, setSeasonEpisodesCache] = useState({});
  const [loadingSeasonEpisodes, setLoadingSeasonEpisodes] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes'); // 'episodes' | 'trailers' | 'similar' | 'about'
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const seasonDropdownRef = useRef(null);

  // Fetch dynamic episodes and metadata from NetMirror
  useEffect(() => {
    if (!movie) return;
    setLiveData(null);
    setSelectedSeason(1);
    setSeasonEpisodesCache({});
    setShowSeasonDropdown(false);
    setActiveTab(movie.isSeries ? 'episodes' : 'similar');

    const targetId = movie.netmirrorId || movie.id;
    if (targetId) {
      setLoadingLive(true);
      fetchNetMirrorPost(targetId, movie.ott || 'nf')
        .then((data) => {
          if (data && data.status === 'ok') {
            setLiveData(data);

            if (data.season && Array.isArray(data.season) && data.season.length > 0) {
              const s1 = data.season.find((s) => /season\s*1\b/i.test(s.s)) || data.season[0];
              const returnedSeasonInfo = data.episodes?.[0]?.info?.[1];

              if (returnedSeasonInfo && returnedSeasonInfo !== 'S1' && s1?.id && s1.id !== data.episodes?.[0]?.id) {
                const matchS = returnedSeasonInfo.match(/S(\d+)/i);
                const actualSeasonNum = matchS ? parseInt(matchS[1], 10) : data.season.length;
                const matchedSeasonObj = data.season.find((s) => s.s.includes(`Season ${actualSeasonNum}`)) || data.season[data.season.length - 1];

                if (matchedSeasonObj?.id) {
                  setSeasonEpisodesCache((prev) => ({
                    ...prev,
                    [matchedSeasonObj.id]: data.episodes
                  }));
                }

                setLoadingSeasonEpisodes(true);
                fetchNetMirrorSeasonEpisodes(s1.id, movie.ott || 'nf')
                  .then((s1Data) => {
                    if (s1Data?.episodes && s1Data.episodes.length > 0) {
                      setSeasonEpisodesCache((prev) => ({
                        ...prev,
                        [s1.id]: s1Data.episodes
                      }));
                    }
                  })
                  .catch(() => {})
                  .finally(() => setLoadingSeasonEpisodes(false));
              } else if (s1?.id && data.episodes) {
                setSeasonEpisodesCache((prev) => ({
                  ...prev,
                  [s1.id]: data.episodes
                }));
              }
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingLive(false));
    }
  }, [movie]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(e.target)) {
        setShowSeasonDropdown(false);
      }
    };
    if (showSeasonDropdown) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [showSeasonDropdown]);

  // Prevent background body scroll & support Esc / popstate back navigation
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Push browser history entry for seamless back button handling
    window.history.pushState({ modal: 'netflix-detail' }, '');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  // Normalized seasons list (Hook declared unconditionally at top level)
  const seasonsList = useMemo(() => {
    if (!movie) return [];

    if (liveData?.season && Array.isArray(liveData.season) && liveData.season.length > 0) {
      return liveData.season.map((sObj, idx) => {
        const match = sObj.s.match(/Season\s*(\d+)/i);
        const seasonNum = match ? parseInt(match[1], 10) : idx + 1;
        return {
          id: sObj.id,
          label: sObj.s,
          seasonNumber: seasonNum
        };
      });
    }

    const seriesMeta = getSeriesMetadata(movie);
    if (seriesMeta?.seasons?.length > 0) {
      return seriesMeta.seasons.map((s) => ({
        id: `season-${s.seasonNumber}`,
        label: `Season ${s.seasonNumber}`,
        seasonNumber: s.seasonNumber,
        year: s.year
      }));
    }

    const durationMatch = movie?.duration?.match(/(\d+)\s*Season/i);
    const totalSeasons = movie?.seasons || (durationMatch ? parseInt(durationMatch[1], 10) : (movie?.isSeries ? 3 : 1));
    const list = [];
    for (let i = 1; i <= Math.max(1, totalSeasons); i++) {
      list.push({
        id: `local-season-${i}`,
        label: `Season ${i}`,
        seasonNumber: i
      });
    }
    return list;
  }, [liveData?.season, movie]);

  const currentSeasonObj = useMemo(() => {
    if (!seasonsList || seasonsList.length === 0) return null;
    return seasonsList.find((s) => s.seasonNumber === selectedSeason) || seasonsList[0];
  }, [seasonsList, selectedSeason]);

  const handleSelectSeason = async (seasonItem) => {
    setSelectedSeason(seasonItem.seasonNumber);
    setShowSeasonDropdown(false);

    if (seasonEpisodesCache[seasonItem.id]) return;

    if (seasonItem.id && !seasonItem.id.startsWith('local-') && !seasonItem.id.startsWith('season-')) {
      setLoadingSeasonEpisodes(true);
      try {
        const epData = await fetchNetMirrorSeasonEpisodes(seasonItem.id, movie?.ott || 'nf');
        if (epData?.episodes && epData.episodes.length > 0) {
          setSeasonEpisodesCache((prev) => ({
            ...prev,
            [seasonItem.id]: epData.episodes
          }));
        }
      } catch (err) {
        console.warn('Failed to load season episodes:', err);
      } finally {
        setLoadingSeasonEpisodes(false);
      }
    }
  };

  const effectiveEpisodes = useMemo(() => {
    if (!movie) return [];
    const cachedEps = currentSeasonObj?.id ? seasonEpisodesCache[currentSeasonObj.id] : null;

    if (cachedEps && cachedEps.length > 0) {
      return cachedEps.filter(Boolean).map((ep, idx) => ({
        episodeNumber: parseInt(ep?.ep, 10) || idx + 1,
        seasonNumber: selectedSeason,
        title: ep?.t || (`Episode ${ep?.ep || idx + 1}`),
        description: ep?.ep_desc || (`Episode ${ep?.ep || idx + 1} of ${movie.title}`),
        duration: ep?.info?.[2] || '45m',
        id: ep?.id || `${movie.id}-s${selectedSeason}-e${idx + 1}`,
        progress: (idx === 0 ? 65 : idx === 1 ? 25 : 0)
      }));
    }

    if (liveData?.episodes && liveData.episodes.length > 0) {
      const firstEpSeason = liveData.episodes[0]?.info?.[1];
      const matchS = firstEpSeason ? firstEpSeason.match(/S(\d+)/i) : null;
      const liveEpSeasonNum = matchS ? parseInt(matchS[1], 10) : 1;

      if (liveEpSeasonNum === selectedSeason) {
        return liveData.episodes.filter(Boolean).map((ep, idx) => ({
          episodeNumber: parseInt(ep?.ep, 10) || idx + 1,
          seasonNumber: selectedSeason,
          title: ep?.t || (`Episode ${ep?.ep || idx + 1}`),
          description: ep?.ep_desc || (`Episode ${ep?.ep || idx + 1} of ${movie.title}`),
          duration: ep?.info?.[2] || '45m',
          id: ep?.id || `${movie.id}-s${selectedSeason}-e${idx + 1}`,
          progress: (idx === 0 ? 65 : 0)
        }));
      }
    }

    // Comprehensive master database lookup for every series & season
    const masterEps = getSeasonEpisodes(movie, selectedSeason);
    if (masterEps && masterEps.length > 0) {
      return masterEps.map((ep, idx) => ({
        episodeNumber: ep.episodeNumber || idx + 1,
        seasonNumber: selectedSeason,
        title: ep.title,
        description: ep.synopsis || ep.description || `Episode ${ep.episodeNumber || idx + 1} of Season ${selectedSeason} in ${movie.title}.`,
        duration: ep.duration || '52m',
        id: `${movie.id}-s${selectedSeason}-e${ep.episodeNumber || idx + 1}`,
        progress: (selectedSeason === 1 && idx === 0 ? 65 : selectedSeason === 1 && idx === 1 ? 25 : 0)
      }));
    }

    const episodesCount = 8;
    const generated = [];
    for (let i = 1; i <= episodesCount; i++) {
      generated.push({
        episodeNumber: i,
        seasonNumber: selectedSeason,
        title: `Season ${selectedSeason} Episode ${i}`,
        description: `Episode ${i} of Season ${selectedSeason} in ${movie.title}.`,
        duration: '45m',
        id: `${movie.id}-s${selectedSeason}-e${i}`,
        progress: 0
      });
    }
    return generated;
  }, [currentSeasonObj, seasonEpisodesCache, liveData, selectedSeason, movie]);

  const isSeries = Boolean(
    movie?.isSeries === true ||
    (movie?.isSeries !== false && (
      liveData?.type === 't' ||
      liveData?.type === 'series' ||
      seasonsList.length > 1 ||
      (movie?.duration && /season/i.test(movie.duration))
    ))
  );

  const synopsis = liveData?.desc || movie?.synopsis;
  const castList = useMemo(() => liveData?.moredetails?.find((m) => m.k === 'Cast')?.v?.split(',').map((s) => s.trim()) || movie?.cast || [], [liveData, movie?.cast]);
  const creator = liveData?.moredetails?.find((m) => m.k === 'Creator' || m.k === 'Director')?.v || movie?.creator;
  const genreList = useMemo(() => liveData?.moredetails?.find((m) => m.k === 'Genre')?.v?.split(',').map((s) => s.trim()) || movie?.genres || [], [liveData, movie?.genres]);
  const maturityReason = liveData?.moredetails?.find((m) => m.k === 'Maturity Reason')?.v || 'violence, gore, language, scary sequences';

  const similarMovies = useMemo(() => {
    if (!movie || !allMovies) return [];
    const directMatches = allMovies.filter(
      (m) => m.id !== movie.id && m.genres?.some((g) => genreList.includes(g))
    );
    if (directMatches.length >= 6) return directMatches.slice(0, 6);

    const platformMatches = allMovies.filter(
      (m) => m.id !== movie.id && (m.ott === movie.ott || m.categories?.some((c) => movie.categories?.includes(c)))
    );
    const combined = [...directMatches, ...platformMatches.filter((m) => !directMatches.some((d) => d.id === m.id))];
    if (combined.length >= 6) return combined.slice(0, 6);

    const remaining = allMovies.filter((m) => m.id !== movie.id && !combined.some((c) => c.id === m.id));
    return [...combined, ...remaining].slice(0, 6);
  }, [allMovies, movie, genreList]);

  if (!movie) return null;

  const inList = isInMyList(movie.id);
  const fallbackHero = getFallbackImage(movie.title, 'backdrop', movie.themeColor);

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="detail-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        {/* Modal Hero Banner */}
        <div className="modal-hero-wrapper">
          <img
            src={imgError ? fallbackHero : (movie.backdrop || fallbackHero)}
            alt={movie.title}
            className="modal-hero-img"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
          <div className="modal-hero-vignette" />

          <div className="modal-hero-content">
            {movie.isOriginal && (
              <div className="modal-n-brand">
                <span className="n-logo">N</span>
                <span className="n-type">{isSeries ? 'S E R I E S' : 'F I L M'}</span>
              </div>
            )}
            <h2 className="modal-hero-title">{movie.title}</h2>

            <div className="modal-hero-actions">
              <button
                className="modal-btn-play"
                onClick={() => onPlay(movie, isSeries ? (effectiveEpisodes[0] || { episodeNumber: 1, seasonNumber: selectedSeason }) : null)}
                title={'Play ' + movie.title}
              >
                <Play size={20} fill="#000" color="#000" />
                <span>Play {isSeries ? `S${selectedSeason}:E${effectiveEpisodes[0]?.episodeNumber || 1}` : ''}</span>
              </button>

              <button
                className={'modal-btn-circle ' + (inList ? 'active' : '')}
                onClick={() => onToggleMyList(movie)}
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? <Check size={20} /> : <Plus size={20} />}
              </button>

              <button
                className={'modal-btn-circle ' + (isLiked ? 'active' : '')}
                onClick={() => setIsLiked(!isLiked)}
                title={isLiked ? 'Liked' : 'Rate this'}
              >
                <ThumbsUp size={18} fill={isLiked ? '#fff' : 'none'} />
              </button>

              <button
                className="modal-btn-circle sound-toggle"
                onClick={onToggleSound}
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Information Grid */}
        <div className="modal-details-grid">
          {/* Left Column: Metadata & Synopsis */}
          <div className="modal-left-col">
            <div className="modal-meta-row">
              <span className="modal-match-score">{movie.matchScore || 98}% Match</span>
              <span className="modal-year">{liveData?.year || movie.releaseYear || 2024}</span>
              <span className="modal-rating-badge">{liveData?.ua || movie.rating || 'U/A 16+'}</span>
              <span className="modal-duration">
                {liveData?.runtime || (isSeries ? `${seasonsList.length} Season${seasonsList.length > 1 ? 's' : ''}` : movie.duration || '2h')}
              </span>
              <span className="modal-quality-badge">{liveData?.hdsd || movie.quality || '4K Ultra HD'}</span>
              <span className="modal-spatial-audio">Dolby Atmos</span>
              <span className="modal-netmirror-badge">
                <Zap size={12} className={loadingLive ? 'pulse-spin' : ''} />
                <span>{loadingLive ? 'Syncing NetMirror...' : 'NetMirror 4K'}</span>
              </span>
            </div>

            <div className="modal-audio-tag">
              <span>{movie.audio || 'Dolby Atmos · 5.1 Multi-Audio · Ultra HD'}</span>
            </div>

            <p className="modal-synopsis-text">{synopsis}</p>
          </div>

          {/* Right Column: Cast, Genres, Creator */}
          <div className="modal-right-col">
            {castList.length > 0 && (
              <div className="modal-info-group">
                <span className="info-label">Cast: </span>
                <span className="info-value">{castList.slice(0, 6).join(', ')}</span>
              </div>
            )}

            {genreList.length > 0 && (
              <div className="modal-info-group">
                <span className="info-label">Genres: </span>
                <span className="info-value">{genreList.join(', ')}</span>
              </div>
            )}

            <div className="modal-info-group">
              <span className="info-label">This title is: </span>
              <span className="info-value">{movie.tags?.join(', ') || 'Ominous, Suspenseful, 4K Ultra Stream'}</span>
            </div>

            {creator && (
              <div className="modal-info-group">
                <span className="info-label">{isSeries ? 'Creator:' : 'Director:'} </span>
                <span className="info-value">{creator}</span>
              </div>
            )}

            <div className="modal-info-group">
              <span className="info-label">Maturity Rating: </span>
              <span className="info-value maturity-reasons">{maturityReason}</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs (Netflix Signature Navigation) */}
        <div className="modal-nav-tabs">
          {isSeries && (
            <button
              className={`modal-tab-btn ${activeTab === 'episodes' ? 'active' : ''}`}
              onClick={() => setActiveTab('episodes')}
            >
              Episodes
            </button>
          )}

          {movie.youtubeId && (
            <button
              className={`modal-tab-btn ${activeTab === 'trailers' ? 'active' : ''}`}
              onClick={() => setActiveTab('trailers')}
            >
              Trailers & More
            </button>
          )}

          <button
            className={`modal-tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={() => setActiveTab('similar')}
          >
            More Like This
          </button>

          <button
            className={`modal-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About {movie.title}
          </button>
        </div>

        {/* TAB 1: Episodes Section (If Series) */}
        {isSeries && activeTab === 'episodes' && (
          <div className="modal-episodes-section">
            <div className="episodes-header">
              <h3 className="episodes-title">Episodes</h3>

              {/* Interactive Season Selector Dropdown */}
              {seasonsList.length > 1 && (
                <div className="season-selector-wrapper" ref={seasonDropdownRef}>
                  <button
                    className="season-selector-btn"
                    onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                    aria-expanded={showSeasonDropdown}
                    title="Select Season"
                  >
                    <span>{currentSeasonObj?.label || `Season ${selectedSeason}`}</span>
                    <ChevronDown size={17} className={`chevron-icon ${showSeasonDropdown ? 'rotate' : ''}`} />
                  </button>

                  {showSeasonDropdown && (
                    <div className="season-dropdown-menu">
                      <div className="dropdown-menu-header">Select Season</div>
                      {seasonsList.map((s) => (
                        <button
                          key={s.id || s.seasonNumber}
                          className={`season-dropdown-item ${selectedSeason === s.seasonNumber ? 'active' : ''}`}
                          onClick={() => handleSelectSeason(s)}
                        >
                          <span className="season-item-label">{s.label}</span>
                          {selectedSeason === s.seasonNumber && <Check size={16} color="#e50914" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Episode List or Loading Indicator */}
            {loadingSeasonEpisodes ? (
              <div className="episodes-loading-state">
                <Loader2 size={32} className="spin-icon" color="#e50914" />
                <span>Loading Season {selectedSeason} Episodes from NetMirror...</span>
              </div>
            ) : (
              <div className="episodes-list">
                {effectiveEpisodes.map((ep) => (
                  <div
                    key={`${ep.seasonNumber}-${ep.episodeNumber}-${ep.id}`}
                    className="episode-item"
                    onClick={() => onPlay(movie, ep)}
                    title={`Play ${ep.title}`}
                  >
                    <span className="episode-num">{ep.episodeNumber}</span>
                    <div className="episode-thumbnail-wrap">
                      <img
                        src={`https://imgcdn.kim/epimg/150/${ep.id}.jpg`}
                        alt={ep.title}
                        className="episode-thumb-img"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.src = movie.backdrop || fallbackHero;
                        }}
                      />
                      <div className="episode-play-overlay">
                        <Play size={22} fill="#fff" />
                      </div>
                      {ep.progress > 0 && (
                        <div className="episode-progress-line">
                          <div className="episode-progress-fill" style={{ width: `${ep.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="episode-info">
                      <div className="episode-top-line">
                        <h4 className="episode-name">{ep.title}</h4>
                        <span className="episode-runtime">{ep.duration}</span>
                      </div>
                      <p className="episode-plot">{ep.description}</p>
                    </div>
                    <button className="episode-download-icon" title="Stream Ready">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Trailers & More */}
        {activeTab === 'trailers' && movie.youtubeId && (
          <div className="modal-trailers-section">
            <h3 className="section-sub-title">Trailers & Teasers</h3>
            <div className="trailers-grid">
              <div className="trailer-card" onClick={() => onPlay(movie)}>
                <div className="trailer-thumbnail-wrap">
                  <img
                    src={`https://img.youtube.com/vi/${movie.youtubeId}/hqdefault.jpg`}
                    alt="Official Trailer"
                    className="trailer-thumb-img"
                  />
                  <div className="trailer-play-icon">
                    <Play size={28} fill="#fff" />
                  </div>
                  <span className="trailer-duration-badge">Trailer</span>
                </div>
                <div className="trailer-info">
                  <h4 className="trailer-title">Official 4K Trailer: {movie.title}</h4>
                  <p className="trailer-desc">Watch the official promo trailer streaming in Ultra HD.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: More Like This */}
        {activeTab === 'similar' && similarMovies.length > 0 && (
          <div className="modal-similar-section">
            <h3 className="similar-title">More Like This</h3>
            <div className="similar-grid">
              {similarMovies.map((similar) => (
                <div 
                  key={similar.id} 
                  className="similar-card"
                  onClick={() => (onSelectMovie ? onSelectMovie(similar) : onPlay(similar))}
                  title={`View details for ${similar.title}`}
                >
                  <div className="similar-media-wrap">
                    <img
                      src={similar.backdrop || getFallbackImage(similar.title, 'backdrop', similar.themeColor)}
                      alt={similar.title}
                      className="similar-img"
                      referrerPolicy="no-referrer"
                    />
                    <span className="similar-duration-tag">{similar.duration}</span>
                    <button
                      className="similar-quick-play"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(similar);
                      }}
                      title="Play"
                    >
                      <Play size={18} fill="#fff" />
                    </button>
                  </div>

                  <div className="similar-card-body">
                    <div className="similar-card-top">
                      <span className="similar-match">{similar.matchScore || 98}% Match</span>
                      <span className="similar-rating">{similar.rating || 'TV-14'}</span>
                    </div>
                    <h4 className="similar-name">{similar.title}</h4>
                    <p className="similar-synopsis">{similar.synopsis}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: About Title */}
        {activeTab === 'about' && (
          <div className="modal-about-section">
            <h3 className="section-sub-title">About <strong>{movie.title}</strong></h3>
            <div className="about-details-content">
              {creator && (
                <p className="about-row">
                  <span className="about-label">{isSeries ? 'Creator:' : 'Director:'}</span>
                  <span className="about-val">{creator}</span>
                </p>
              )}
              {castList.length > 0 && (
                <p className="about-row">
                  <span className="about-label">Cast:</span>
                  <span className="about-val">{castList.join(', ')}</span>
                </p>
              )}
              {genreList.length > 0 && (
                <p className="about-row">
                  <span className="about-label">Genres:</span>
                  <span className="about-val">{genreList.join(', ')}</span>
                </p>
              )}
              <p className="about-row">
                <span className="about-label">Audio:</span>
                <span className="about-val">{movie.audio || 'Dolby Atmos, English [Original], Hindi 5.1'}</span>
              </p>
              <p className="about-row">
                <span className="about-label">Subtitles:</span>
                <span className="about-val">English [CC], Spanish, French, Hindi, Japanese</span>
              </p>
              <p className="about-row">
                <span className="about-label">Maturity Rating:</span>
                <span className="about-val rating-pill">{movie.rating || 'U/A 16+'}</span>
                <span className="about-sub-val">Recommended for ages 16 and up. {maturityReason}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
