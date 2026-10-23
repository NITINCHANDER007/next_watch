import React, { useState, useRef, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  Subtitles,
  Gauge,
  Zap,
  Server,
  Download,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  SkipBack,
  SkipForward,
  Layers,
  X,
  Loader2,
  Sparkles,
  Film,
  ChevronDown
} from 'lucide-react';
import {
  NETMIRROR_CATALOG_MAP,
  POPULAR_IMDB_MAP,
  POPULAR_TITLE_IMDB_MAP,
  fetchNetMirrorStream,
  getNetMirrorServerUrls,
  NETMIRROR_EXTENSION_INFO,
  fetchNetMirrorPost,
  fetchNetMirrorSeasonEpisodes
} from '../services/netmirrorService';
import { getSeriesMetadata, getSeasonEpisodes } from '../data/seriesEpisodesData';

const extractYoutubeId = (raw, fallback = '3x77q40hATw') => {
  if (!raw) return fallback;
  const str = String(raw).trim();
  if (str.includes('youtu.be/')) {
    return str.split('youtu.be/')[1].split(/[?&#]/)[0] || fallback;
  }
  if (str.includes('youtube.com/watch')) {
    const match = str.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : fallback;
  }
  if (str.includes('youtube.com/embed/')) {
    return str.split('embed/')[1].split(/[?&#]/)[0] || fallback;
  }
  return str || fallback;
};

export default function VideoPlayerModal({
  movie,
  episode = null,
  onClose
}) {
  // Determine if content is a series
  const ott = movie?.ott || 'nf';
  const isSeries = Boolean(
    movie?.isSeries === true ||
    (movie?.isSeries !== false && (
      movie?.type === 't' ||
      movie?.type === 'series' ||
      movie?.seasons > 1 ||
      (movie?.duration && /season/i.test(movie.duration)) ||
      (movie?.episodes && movie?.episodes.length > 1) ||
      (episode && episode?.seasonNumber !== undefined && (movie?.isSeries || movie?.seasons > 0))
    ))
  );

  // Normalize initial season and episode
  const initialSeason = episode?.seasonNumber
    || (episode?.info?.[1] ? parseInt(String(episode.info[1]).replace(/\D/g, ''), 10) : 1)
    || 1;
  const initialEpNum = episode?.episodeNumber
    || (episode?.ep ? parseInt(episode.ep, 10) : 1)
    || 1;

  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(
    episode || {
      seasonNumber: initialSeason,
      episodeNumber: initialEpNum,
      title: `Episode ${initialEpNum}`,
      id: movie.playbackId || movie.id
    }
  );

  // Series Drawer & Season/Episode state
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerSeason, setDrawerSeason] = useState(initialSeason);
  const [playerSeasonsList, setPlayerSeasonsList] = useState(() => {
    if (!isSeries) return [];
    const meta = getSeriesMetadata(movie);
    if (meta?.seasons?.length > 0) {
      return meta.seasons.map((s) => ({
        id: `season-${s.seasonNumber}`,
        label: `Season ${s.seasonNumber}`,
        seasonNumber: s.seasonNumber,
        year: s.year
      }));
    }
    return [{ id: 'season-1', label: 'Season 1', seasonNumber: 1 }];
  });
  const [playerEpisodesCache, setPlayerEpisodesCache] = useState({});
  const [loadingDrawerEpisodes, setLoadingDrawerEpisodes] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Playback control states
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState('English [CC]');
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multi-server state (Server 1: AutoEmbed / NetMirror HLS, Server 2: VidLink, Server 3: SuperStream, Server 4: Official Trailer)
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [netmirrorLoading, setNetmirrorLoading] = useState(false);
  const [netmirrorStatus, setNetmirrorStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Synchronous + Fast Asynchronous IMDB ID Resolution to avoid double reload
  const cleanTitle = movie?.title ? movie.title.toLowerCase().trim() : '';
  const syncImdbId = movie?.imdbId
    || POPULAR_IMDB_MAP[movie?.id]
    || POPULAR_IMDB_MAP[movie?.netmirrorId]
    || (cleanTitle ? POPULAR_TITLE_IMDB_MAP[cleanTitle] : null)
    || null;

  const [resolvedImdbId, setResolvedImdbId] = useState(syncImdbId);
  const [isResolvingImdb, setIsResolvingImdb] = useState(!syncImdbId);

  useEffect(() => {
    const nextSyncId = movie?.imdbId
      || POPULAR_IMDB_MAP[movie?.id]
      || POPULAR_IMDB_MAP[movie?.netmirrorId]
      || (cleanTitle ? POPULAR_TITLE_IMDB_MAP[cleanTitle] : null)
      || null;

    setResolvedImdbId(nextSyncId);
    if (!nextSyncId && movie?.title) {
      setIsResolvingImdb(true);
      let active = true;
      const timeout = setTimeout(() => {
        if (active) setIsResolvingImdb(false);
      }, 1000);

      fetch(`/api/imdb/lookup?title=${encodeURIComponent(movie.title)}`)
        .then((r) => r.json())
        .then((data) => {
          if (active && data?.imdbId) {
            setResolvedImdbId(data.imdbId);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) {
            clearTimeout(timeout);
            setIsResolvingImdb(false);
          }
        });

      return () => {
        active = false;
        clearTimeout(timeout);
      };
    } else {
      setIsResolvingImdb(false);
    }
  }, [movie?.id, movie?.title, cleanTitle]);

  // Load series seasons and episodes metadata for the in-player episode switcher
  useEffect(() => {
    if (!isSeries) return;
    const targetId = movie.netmirrorId || movie.id;
    if (!targetId) return;

    fetchNetMirrorPost(targetId, ott)
      .then((data) => {
        if (data && data.status === 'ok') {
          // Extract seasons list
          if (data.season && Array.isArray(data.season) && data.season.length > 0) {
            const parsedSeasons = data.season.map((sObj, idx) => {
              const match = sObj.s.match(/Season\s*(\d+)/i);
              const num = match ? parseInt(match[1], 10) : idx + 1;
              return { id: sObj.id, label: sObj.s, seasonNumber: num };
            });
            setPlayerSeasonsList(parsedSeasons);

            // Cache any default returned episodes if they match
            const firstEpS = data.episodes?.[0]?.info?.[1];
            const matchS = firstEpS ? firstEpS.match(/S(\d+)/i) : null;
            const seasonNum = matchS ? parseInt(matchS[1], 10) : parsedSeasons[0].seasonNumber;
            if (data.episodes) {
              setPlayerEpisodesCache((prev) => ({
                ...prev,
                [seasonNum]: data.episodes
              }));
            }

            // Fetch current season episodes if not yet in cache
            const targetSeasonObj = parsedSeasons.find((s) => s.seasonNumber === currentSeason) || parsedSeasons[0];
            if (targetSeasonObj?.id && targetSeasonObj.seasonNumber !== seasonNum) {
              fetchNetMirrorSeasonEpisodes(targetSeasonObj.id, ott)
                .then((sData) => {
                  if (sData?.episodes) {
                    setPlayerEpisodesCache((prev) => ({
                      ...prev,
                      [targetSeasonObj.seasonNumber]: sData.episodes
                    }));
                  }
                })
                .catch(() => {});
            }
          }
        }
      })
      .catch(() => {});
  }, [isSeries, movie, ott, currentSeason]);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const hlsRef = useRef(null);

  // Playback ID resolution
  const netmirrorEntry = NETMIRROR_CATALOG_MAP[movie?.id];
  const firstEpId = movie?.episodes?.[0]?.id || movie?.playbackId;
  const playbackId = currentEpisode?.id
    || currentEpisode?.playbackId
    || (isSeries ? (firstEpId || movie?.playbackId || movie?.netmirrorId) : (movie?.playbackId || movie?.netmirrorId || movie?.id))
    || netmirrorEntry?.firstEpisodeId
    || netmirrorEntry?.netmirrorId
    || movie?.id
    || '80057281';

  // Server List Generation
  const serverList = useMemo(() => {
    return getNetMirrorServerUrls(movie, currentEpisode, ott, resolvedImdbId, movie?.tmdbId);
  }, [movie, currentEpisode, ott, resolvedImdbId]);

  const activeServer = useMemo(() => {
    if (selectedServerId != null) {
      return serverList.find((s) => s.id === selectedServerId) || serverList[0];
    }
    return serverList[0];
  }, [serverList, selectedServerId]);

  // Reset iframe preloader on server or episode change with auto-dismiss safety timeout
  useEffect(() => {
    setIframeLoading(true);
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeServer.id, currentEpisode]);

  // Show Toast notification
  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Generate full authentic episodes for drawer & navigation
  const generateDrawerFallbackEpisodes = (sNum) => {
    const masterEps = getSeasonEpisodes(movie, sNum);
    if (masterEps && masterEps.length > 0) {
      return masterEps.map((ep, idx) => ({
        ep: String(ep.episodeNumber || idx + 1),
        episodeNumber: ep.episodeNumber || idx + 1,
        seasonNumber: sNum,
        t: ep.title,
        title: ep.title,
        ep_desc: ep.synopsis || ep.description || `Episode ${ep.episodeNumber || idx + 1} of Season ${sNum}`,
        description: ep.synopsis || ep.description || `Episode ${ep.episodeNumber || idx + 1} of Season ${sNum}`,
        duration: ep.duration || '52m',
        info: [`E${ep.episodeNumber || idx + 1}`, `S${sNum}`, ep.duration || '52m'],
        id: `${movie.id}-s${sNum}-e${ep.episodeNumber || idx + 1}`
      }));
    }

    const list = [];
    for (let i = 1; i <= 8; i++) {
      list.push({
        ep: String(i),
        episodeNumber: i,
        seasonNumber: sNum,
        t: `Season ${sNum} Episode ${i}`,
        title: `Season ${sNum} Episode ${i}`,
        ep_desc: `Episode ${i} of Season ${sNum} in ${movie.title}.`,
        description: `Episode ${i} of Season ${sNum} in ${movie.title}.`,
        info: [`E${i}`, `S${sNum}`, '45m'],
        id: `${movie.id}-s${sNum}-e${i}`
      });
    }
    return list;
  };

  // Next / Previous Episode navigation calculations
  const totalSeasons = Math.max(1, playerSeasonsList.length || movie?.seasons || (isSeries ? 3 : 1));
  const currentSeasonEps = playerEpisodesCache[currentSeason] || generateDrawerFallbackEpisodes(currentSeason);
  const currentSeasonTotalEps = currentSeasonEps.length > 0 ? currentSeasonEps.length : 8;
  const currentEpNum = currentEpisode?.episodeNumber || 1;

  const hasPrev = currentSeason > 1 || currentEpNum > 1;
  const hasNext = currentSeason < totalSeasons || currentEpNum < currentSeasonTotalEps;

  const handleNextEpisode = () => {
    setIframeLoading(true);
    if (currentEpNum < currentSeasonTotalEps) {
      // Next ep in same season
      const nextEpNum = currentEpNum + 1;
      const foundEp = currentSeasonEps.find((e) => parseInt(e.ep || e.episodeNumber, 10) === nextEpNum);
      const nextEpObj = {
        seasonNumber: currentSeason,
        episodeNumber: nextEpNum,
        title: foundEp?.t || foundEp?.title || `Episode ${nextEpNum}`,
        description: foundEp?.ep_desc || foundEp?.description || `Episode ${nextEpNum} of Season ${currentSeason}`,
        duration: foundEp?.info?.[2] || foundEp?.duration || '45m',
        id: foundEp?.id || `${movie.id}-s${currentSeason}-e${nextEpNum}`
      };
      setCurrentEpisode(nextEpObj);
      showToast(`Playing S${currentSeason}:E${nextEpNum} • ${nextEpObj.title}`);
    } else if (currentSeason < totalSeasons) {
      // Advance to Season + 1, Ep 1
      const nextSeasonNum = currentSeason + 1;
      setCurrentSeason(nextSeasonNum);
      setDrawerSeason(nextSeasonNum);
      const nextSeasonObj = playerSeasonsList.find((s) => s.seasonNumber === nextSeasonNum);
      const cachedNextSeasonEps = playerEpisodesCache[nextSeasonNum] || generateDrawerFallbackEpisodes(nextSeasonNum);
      const ep1 = cachedNextSeasonEps?.[0];

      const nextEpObj = {
        seasonNumber: nextSeasonNum,
        episodeNumber: 1,
        title: ep1?.t || ep1?.title || 'Episode 1',
        description: ep1?.ep_desc || ep1?.description || `Episode 1 of Season ${nextSeasonNum}`,
        duration: ep1?.info?.[2] || ep1?.duration || '45m',
        id: ep1?.id || `${movie.id}-s${nextSeasonNum}-e1`
      };
      setCurrentEpisode(nextEpObj);
      showToast(`Starting Season ${nextSeasonNum}: Episode 1 • ${nextEpObj.title}`);

      if (nextSeasonObj?.id && !nextSeasonObj.id.startsWith('season-') && !playerEpisodesCache[nextSeasonNum]) {
        fetchNetMirrorSeasonEpisodes(nextSeasonObj.id, ott)
          .then((data) => {
            if (data?.episodes) {
              setPlayerEpisodesCache((prev) => ({ ...prev, [nextSeasonNum]: data.episodes }));
            }
          })
          .catch(() => {});
      }
    }
  };

  const handlePrevEpisode = () => {
    setIframeLoading(true);
    if (currentEpNum > 1) {
      const prevEpNum = currentEpNum - 1;
      const foundEp = currentSeasonEps.find((e) => parseInt(e.ep || e.episodeNumber, 10) === prevEpNum);
      const prevEpObj = {
        seasonNumber: currentSeason,
        episodeNumber: prevEpNum,
        title: foundEp?.t || foundEp?.title || `Episode ${prevEpNum}`,
        description: foundEp?.ep_desc || foundEp?.description || `Episode ${prevEpNum} of Season ${currentSeason}`,
        duration: foundEp?.info?.[2] || foundEp?.duration || '45m',
        id: foundEp?.id || `${movie.id}-s${currentSeason}-e${prevEpNum}`
      };
      setCurrentEpisode(prevEpObj);
      showToast(`Playing S${currentSeason}:E${prevEpNum} • ${prevEpObj.title}`);
    } else if (currentSeason > 1) {
      const prevSeasonNum = currentSeason - 1;
      setCurrentSeason(prevSeasonNum);
      setDrawerSeason(prevSeasonNum);
      const prevSeasonEps = playerEpisodesCache[prevSeasonNum] || generateDrawerFallbackEpisodes(prevSeasonNum);
      const lastEpNum = prevSeasonEps.length || 8;
      const lastEp = prevSeasonEps[lastEpNum - 1];

      const prevEpObj = {
        seasonNumber: prevSeasonNum,
        episodeNumber: lastEpNum,
        title: lastEp?.t || lastEp?.title || `Episode ${lastEpNum}`,
        description: lastEp?.ep_desc || lastEp?.description || `Episode ${lastEpNum} of Season ${prevSeasonNum}`,
        duration: lastEp?.info?.[2] || lastEp?.duration || '45m',
        id: lastEp?.id || `${movie.id}-s${prevSeasonNum}-e${lastEpNum}`
      };
      setCurrentEpisode(prevEpObj);
      showToast(`Playing S${prevSeasonNum}:E${lastEpNum} • ${prevEpObj.title}`);
    }
  };

  // In-Player Drawer Season switching
  const handleSelectDrawerSeason = async (seasonNum, seasonId) => {
    setDrawerSeason(seasonNum);
    if (playerEpisodesCache[seasonNum]) return;

    if (seasonId && !seasonId.startsWith('local-') && !seasonId.startsWith('season-')) {
      setLoadingDrawerEpisodes(true);
      try {
        const epData = await fetchNetMirrorSeasonEpisodes(seasonId, ott);
        if (epData?.episodes) {
          setPlayerEpisodesCache((prev) => ({ ...prev, [seasonNum]: epData.episodes }));
        }
      } catch (err) {
        console.warn('Failed to load drawer episodes:', err);
      } finally {
        setLoadingDrawerEpisodes(false);
      }
    }
  };

  const handlePlayDrawerEpisode = (seasonNum, ep, epNum) => {
    setIframeLoading(true);
    setCurrentSeason(seasonNum);
    const newEp = {
      seasonNumber: seasonNum,
      episodeNumber: epNum,
      title: ep?.t || ep?.title || `Episode ${epNum}`,
      description: ep?.ep_desc || ep?.description || `Episode ${epNum} of Season ${seasonNum}`,
      duration: ep?.info?.[2] || ep?.duration || '45m',
      id: ep?.id || `${movie.id}-s${seasonNum}-e${epNum}`
    };
    setCurrentEpisode(newEp);
    setShowDrawer(false);
    showToast(`Playing S${seasonNum}:E${epNum} • ${newEp.title}`);
  };

  // Load NetMirror Direct HLS stream when HLS server is selected
  useEffect(() => {
    let isCancelled = false;
    setErrorMessage(null);

    if (activeServer.type === 'hls') {
      setNetmirrorLoading(true);
      setNetmirrorStatus('resolving');

      fetchNetMirrorStream(playbackId, ott)
        .then((streamData) => {
          if (isCancelled) return;
          const url = streamData.streamUrl;
          setNetmirrorLoading(false);
          setNetmirrorStatus('connected');

          if (videoRef.current) {
            if (Hls.isSupported()) {
              if (hlsRef.current) {
                hlsRef.current.destroy();
              }
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 60
              });
              hlsRef.current = hls;
              hls.loadSource(url);
              hls.attachMedia(videoRef.current);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (videoRef.current) {
                  const playPromise = videoRef.current.play();
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => setIsPlaying(true))
                      .catch(() => {
                        if (videoRef.current) {
                          videoRef.current.muted = true;
                          setIsMuted(true);
                          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                        }
                      });
                  }
                }
              });

              hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                  console.warn('[NetMirror HLS Fatal]', data);
                  setErrorMessage('HLS Glitch. Auto-switching to Server 1 (VidSrc Live 4K)...');
                  setTimeout(() => {
                    setSelectedServerId(1);
                    setErrorMessage(null);
                  }, 1200);
                }
              });
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
              videoRef.current.src = url;
              videoRef.current.play().catch(() => {});
            }
          }
        })
        .catch(() => {
          setSelectedServerId(1);
        });
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    }

    return () => {
      isCancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeServer.type, playbackId, ott]);

  const togglePlayPause = () => {
    if (activeServer.type !== 'hls' && activeServer.type !== 'video') return;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const changeVolume = (delta) => {
    if (videoRef.current) {
      const newVol = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVol);
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume || 0.85;
        setIsMuted(false);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyLink = () => {
    const streamUrl = `${window.location.origin}/api/stream/master/${ott}/${playbackId}.m3u8`;
    navigator.clipboard.writeText(streamUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Auto-hide controls timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !showDrawer) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitlesMenu(false);
        setShowServerMenu(false);
        setShowDownloadMenu(false);
      }
    }, 3500);
  };

  // Bulletproof Safe Close that pops history and cleans up player instances
  const hasClosedRef = useRef(false);
  const handleSafeClose = (triggerHistoryBack = true) => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;

    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }

    // Cleanly pop browser history if modal state was pushed
    if (triggerHistoryBack && window.history.state?.modal === 'netflix-player') {
      window.history.back();
    }

    onClose();
  };

  // Browser Native History Popstate Integration (Chrome Back button & trackpad swipe back)
  useEffect(() => {
    window.history.pushState({ modal: 'netflix-player' }, '');

    const handlePopState = () => {
      handleSafeClose(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Slide Left / Right Gesture Handler (Touch & Pointer)
  const [swipeState, setSwipeState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    isSwiping: false,
    direction: null, // 'left' | 'right'
    deltaX: 0
  });

  const SWIPE_THRESHOLD = 70; // px threshold to trigger return to browse
  const pointerStartRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.target.closest('button, input, select, .player-drawer-content, .player-server-dropdown, .control-dropdown-wrap')) {
      return;
    }
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isSwiping: true,
      direction: null,
      deltaX: 0
    });
  };

  const handleTouchMove = (e) => {
    if (!swipeState.isSwiping) return;
    const touch = e.touches[0];
    const dx = touch.clientX - swipeState.startX;
    const dy = touch.clientY - swipeState.startY;

    // Detect horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      setSwipeState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        deltaX: dx,
        direction: dx > 0 ? 'right' : 'left'
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!swipeState.isSwiping) return;
    const absDelta = Math.abs(swipeState.deltaX);
    if (absDelta >= SWIPE_THRESHOLD) {
      showToast('← Returning to Browse...');
      handleSafeClose(true);
    }
    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      isSwiping: false,
      direction: null,
      deltaX: 0
    });
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, select, .player-drawer-content, .player-server-dropdown, .control-dropdown-wrap, .player-bottom-controls')) {
      return;
    }
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 15) {
      setSwipeState({
        startX: pointerStartRef.current.x,
        startY: pointerStartRef.current.y,
        currentX: e.clientX,
        isSwiping: true,
        direction: dx > 0 ? 'right' : 'left',
        deltaX: dx
      });
    }
  };

  const handlePointerUp = () => {
    if (!pointerStartRef.current) return;
    const absDelta = Math.abs(swipeState.deltaX);
    pointerStartRef.current = null;
    if (absDelta >= SWIPE_THRESHOLD) {
      showToast('← Returning to Browse...');
      handleSafeClose(true);
    }
    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      isSwiping: false,
      direction: null,
      deltaX: 0
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showDrawer) {
          setShowDrawer(false);
        } else if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          handleSafeClose(true);
        }
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        skipTime(10);
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        skipTime(-10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(0.05);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(-0.05);
      } else if (e.key === 'n' && isSeries) {
        handleNextEpisode();
      } else if (e.key === 'p' && isSeries) {
        handlePrevEpisode();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isPlaying, volume, isMuted, isSeries, showDrawer, currentEpNum, currentSeason]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showSkipIntro = currentTime >= 5 && currentTime <= 85;

  return (
    <div
      ref={containerRef}
      className={`netflix-video-player-container ${swipeState.isSwiping ? 'is-swiping' : ''}`}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => setShowControls(true)}
    >
      {/* Dynamic Slide Left / Right HUD Indicator */}
      {swipeState.isSwiping && Math.abs(swipeState.deltaX) > 15 && (
        <div
          className="player-swipe-feedback-hud"
          style={{
            transform: `translate(${swipeState.deltaX > 0 ? 'calc(-50% + 15px)' : 'calc(-50% - 15px)'}, -50%)`,
            opacity: Math.min(Math.abs(swipeState.deltaX) / SWIPE_THRESHOLD, 1)
          }}
        >
          <div className="player-swipe-arrow-badge">
            {swipeState.direction === 'right' ? <ArrowRight size={32} /> : <ArrowLeft size={32} />}
          </div>
          <div className="player-swipe-text-wrap">
            <span className="player-swipe-main-text">
              {Math.abs(swipeState.deltaX) >= SWIPE_THRESHOLD ? 'Release to Go Back' : 'Slide to Go Back'}
            </span>
            <span className="player-swipe-sub-text">
              {Math.abs(swipeState.deltaX) >= SWIPE_THRESHOLD ? 'Returning to Browse' : 'Keep sliding to return'}
            </span>
          </div>
          <div className="player-swipe-bar">
            <div
              className="player-swipe-bar-progress"
              style={{ width: `${Math.min((Math.abs(swipeState.deltaX) / SWIPE_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Top Header Overlay with Title, Season/Episode Navigation, Server Selector */}
      <div className={`player-top-controls ${showControls ? 'visible' : ''}`}>
        {/* Left Side: Back + Clean Title & Season/Episode */}
        <div className="player-header-left">
          <button
            type="button"
            className="player-back-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSafeClose(true);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            title="Back to Browse"
            aria-label="Back to Browse"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="player-title-info">
            <div className="player-title-row">
              <h1 className="player-main-title">{movie.title}</h1>
              {activeServer.type === 'youtube' ? (
                <span className="netmirror-live-tag theatrical-tag">
                  <Film size={12} />
                  <span>Official Trailer</span>
                </span>
              ) : (
                <span className="netmirror-live-tag">
                  <Zap size={12} />
                  <span>{movie.quality || '4K Ultra HD'}</span>
                </span>
              )}
            </div>
            {activeServer.type === 'youtube' ? (
              <span className="player-episode-subtitle theatrical-note">
                Select Server 1-3 in top right to stream full movie
              </span>
            ) : isSeries ? (
              <span className="player-episode-subtitle">
                Season {currentSeason} • Episode {currentEpNum} • {currentEpisode?.title || `Episode ${currentEpNum}`}
              </span>
            ) : (
              <span className="player-episode-subtitle">
                {movie.releaseYear || '2024'} • {movie.duration || 'Full Movie'}
              </span>
            )}
          </div>
        </div>

        {/* Center: Sleek Unified Series Navigation Pill */}
        {isSeries && (
          <div className="player-header-center" onClick={(e) => e.stopPropagation()}>
            <div className="series-nav-pill-group">
              <button
                className="series-nav-btn"
                onClick={handlePrevEpisode}
                disabled={!hasPrev}
                title={hasPrev ? 'Previous Episode' : 'First Episode'}
              >
                <SkipBack size={15} />
                <span>Prev</span>
              </button>

              <button
                className={`series-nav-btn episodes-btn ${showDrawer ? 'active' : ''}`}
                onClick={() => setShowDrawer(!showDrawer)}
                title="Episodes & Seasons List"
              >
                <Layers size={15} />
                <span>Episodes & Seasons</span>
              </button>

              <button
                className="series-nav-btn"
                onClick={handleNextEpisode}
                disabled={!hasNext}
                title={hasNext ? 'Next Episode' : 'Last Episode'}
              >
                <span>Next</span>
                <SkipForward size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Right: Consolidated Server & Tool Actions */}
        <div className="player-header-right" onClick={(e) => e.stopPropagation()}>
          {/* Quick Rotate to Next Mirror */}
          <button
            className="player-icon-action-btn"
            onClick={() => {
              const currIdx = serverList.findIndex((s) => s.id === activeServer.id);
              const nextSrv = serverList[(currIdx + 1) % serverList.length] || serverList[0];
              setSelectedServerId(nextSrv.id);
              showToast(`Switched to ${nextSrv.name}`);
            }}
            title="Cycle to next streaming mirror"
          >
            <RotateCw size={15} />
          </button>

          {/* Open Direct Stream in New Tab */}
          {activeServer.type === 'embed' && activeServer.url && (
            <a
              href={activeServer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="player-icon-action-btn"
              title="Open stream in separate window (bypass cookies/adblock)"
            >
              <ExternalLink size={15} />
            </a>
          )}

          {/* Consolidated Server Pill Selector */}
          <div className="control-dropdown-wrap">
            <button
              className="player-server-pill-btn"
              onClick={() => {
                setShowServerMenu(!showServerMenu);
                setShowDownloadMenu(false);
              }}
              title="Select Streaming Server"
            >
              <Server size={14} className="server-icon" />
              <span className="server-label">
                {activeServer.name.length > 20 ? activeServer.name.substring(0, 20) + '...' : activeServer.name}
              </span>
              <span className="server-chip">{activeServer.badge || '4K'}</span>
              <ChevronDown size={14} className={`dropdown-chevron ${showServerMenu ? 'open' : ''}`} />
            </button>

            {showServerMenu && (
              <div className="player-server-dropdown right-align">
                <div className="dropdown-menu-header">Streaming Servers</div>
                <div className="dropdown-options-list">
                  {serverList.map((srv, idx) => (
                    <button
                      key={srv.id}
                      className={`server-dropdown-option ${selectedServerId === srv.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedServerId(srv.id);
                        setShowServerMenu(false);
                        showToast(`Switched to Server ${idx + 1}`);
                      }}
                    >
                      <div className="srv-title-col">
                        <div className="srv-name-row">
                          <span className={`srv-dot ${selectedServerId === srv.id ? 'active' : ''}`} />
                          <span className="srv-name">{srv.name}</span>
                        </div>
                        <small className="srv-desc">{srv.description}</small>
                      </div>
                      <span className="srv-badge">{srv.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Download & Links Menu */}
          <div className="control-dropdown-wrap">
            <button
              className="player-icon-action-btn"
              onClick={() => {
                setShowDownloadMenu(!showDownloadMenu);
                setShowServerMenu(false);
              }}
              title="Download & Stream Links"
            >
              <Download size={15} />
            </button>

            {showDownloadMenu && (
              <div className="player-server-dropdown right-align">
                <div className="dropdown-menu-header">Stream Links & Tools</div>
                <button className="server-dropdown-option" onClick={handleCopyLink}>
                  <div className="srv-title-col">
                    <span className="srv-name">
                      {copiedLink ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                      {copiedLink ? 'HLS Link Copied!' : 'Copy HLS Stream URL'}
                    </span>
                    <small className="srv-desc">For VLC / MPV / External Players</small>
                  </div>
                </button>
                <div className="server-dropdown-option active">
                  <div className="srv-title-col">
                    <span className="srv-name" style={{ color: '#22c55e' }}>
                      <Check size={14} color="#22c55e" />
                      100% In-Browser Playback
                    </span>
                    <small className="srv-desc">No extensions or downloads required</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notificationMsg && (
        <div className="player-toast-notification">
          <Sparkles size={16} color="#e50914" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Fallback Glitch Notification if any */}
      {errorMessage && (
        <div className="player-error-notification">
          <AlertTriangle size={18} color="#eab308" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Video Element or Mirror Embed */}
      {isResolvingImdb ? (
        <div className="player-resolving-overlay">
          <div className="netflix-cinematic-loader">
            <div className="netflix-ribbon-n">N</div>
            <div className="netmirror-spinner" />
            <span className="resolving-text">Connecting to Ultra HD 4K Stream...</span>
            <span className="resolving-subtext">{movie.title} • {activeServer.name}</span>
          </div>
        </div>
      ) : activeServer.type === 'embed' ? (
        <div className="player-embed-wrapper">
          {iframeLoading && (
            <div className="player-iframe-preloader">
              <div className="netflix-cinematic-loader">
                <div className="netflix-ribbon-n">N</div>
                <div className="netmirror-spinner" />
                <span className="resolving-text">Loading 4K Ultra Stream...</span>
                <span className="resolving-subtext">{activeServer.name} • {activeServer.badge}</span>
              </div>
            </div>
          )}
          <iframe
            key={`stream-live-v4-${activeServer.id}-${selectedServerId}-${currentSeason}-${currentEpNum}-${activeServer.url}`}
            title={activeServer.name}
            src={activeServer.url}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="eager"
            referrerPolicy="origin"
            onLoad={() => setIframeLoading(false)}
            className="player-embed-iframe"
          />
        </div>
      ) : activeServer.type === 'youtube' ? (
        <div className="player-youtube-embed-wrapper">
          <iframe
            key={`youtube-trailer-${movie.id}-${activeServer.id}-${activeServer.url}`}
            title={`${movie.title} Official 4K Trailer`}
            src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(activeServer.url || movie.youtubeId, '3x77q40hATw')}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="player-youtube-iframe"
          />
        </div>
      ) : (
        <div className="player-video-wrapper">
          <video
            ref={videoRef}
            className="player-video-element"
            src={activeServer.type === 'video' ? activeServer.url : undefined}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onPlaying={() => {
              setIsPlaying(true);
              setNetmirrorLoading(false);
            }}
            onWaiting={() => setNetmirrorLoading(true)}
            onCanPlay={() => setNetmirrorLoading(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlayPause}
          />

          {!isPlaying && !netmirrorLoading && (activeServer.type === 'hls' || activeServer.type === 'video') && (
            <button
              className="player-big-play-btn"
              onClick={togglePlayPause}
              title="Click to Play"
            >
              <Play size={44} fill="#ffffff" />
            </button>
          )}

          {isMuted && isPlaying && (
            <button className="player-unmute-banner" onClick={toggleMute} title="Click to Unmute Audio">
              <VolumeX size={18} />
              <span>Video is Muted — Click to Unmute</span>
            </button>
          )}

          {netmirrorLoading && selectedServerId === 5 && (
            <div className="netmirror-loading-overlay">
              <div className="netmirror-spinner" />
              <span>Connecting to NetMirror 4K HLS Stream ({netmirrorStatus})...</span>
            </div>
          )}
        </div>
      )}

      {/* Floating Quick Next Episode Button (Visible for Series across all servers when controls are shown) */}
      {isSeries && hasNext && showControls && (
        <button
          className="player-floating-next-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleNextEpisode();
          }}
          title="Play Next Episode"
        >
          <span>Next Ep (S{currentSeason}:E{currentEpNum < currentSeasonTotalEps ? currentEpNum + 1 : 1})</span>
          <SkipForward size={17} />
        </button>
      )}

      {/* Skip Intro Floating Button */}
      {showSkipIntro && activeServer.type === 'hls' && (
        <button
          className="player-skip-intro-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              videoRef.current.currentTime = 85;
            }
          }}
        >
          <FastForward size={18} />
          <span>Skip Intro</span>
        </button>
      )}

      {/* Subtitles Overlay */}
      {activeServer.type === 'hls' && selectedSubtitle !== 'Off' && isPlaying && currentTime > 5 && (
        <div className="player-subtitle-overlay">
          <span>{`[${movie.title}] (dramatic sound sequence)`}</span>
        </div>
      )}

      {/* Bottom Custom Netflix Controls Overlay (Shown for HLS & Direct Video) */}
      {(activeServer.type === 'hls' || activeServer.type === 'video') && (
        <div
          className={`player-bottom-controls ${showControls ? 'visible' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timeline Scrubber */}
          <div className="player-scrub-bar-container" onClick={handleSeek}>
            <div className="player-scrub-track">
              <div
                className="player-scrub-fill"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="player-scrub-handle" />
              </div>
            </div>
          </div>

          {/* Controls Lower Bar */}
          <div className="player-controls-row">
            {/* Left Controls */}
            <div className="controls-left">
              {isSeries && (
                <button
                  className="control-btn"
                  onClick={handlePrevEpisode}
                  disabled={!hasPrev}
                  title="Previous Episode"
                >
                  <SkipBack size={22} />
                </button>
              )}

              <button
                className="control-btn"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="#fff" />}
              </button>

              {isSeries && (
                <button
                  className="control-btn"
                  onClick={handleNextEpisode}
                  disabled={!hasNext}
                  title="Next Episode"
                >
                  <SkipForward size={22} />
                </button>
              )}

              <button className="control-btn" onClick={() => skipTime(-10)} title="Rewind 10 seconds">
                <RotateCcw size={22} />
              </button>

              <button className="control-btn" onClick={() => skipTime(10)} title="Forward 10 seconds">
                <RotateCw size={22} />
              </button>

              {/* Volume Slider Group */}
              <div className="volume-group">
                <button className="control-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  title="Volume"
                />
              </div>

              {/* Time Counter */}
              <span className="player-time-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="controls-right">
              {isSeries && (
                <button
                  className={`control-btn ${showDrawer ? 'active' : ''}`}
                  onClick={() => setShowDrawer(!showDrawer)}
                  title="Episodes"
                >
                  <Layers size={22} />
                </button>
              )}

              {/* Speed Menu */}
              <div className="control-dropdown-wrap">
                <button
                  className="control-btn"
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSubtitlesMenu(false);
                  }}
                  title="Playback Speed"
                >
                  <Gauge size={22} />
                  <span className="speed-label">{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="control-dropdown-menu">
                    <span className="dropdown-menu-header">Playback Speed</span>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        className={`dropdown-option ${playbackSpeed === speed ? 'active' : ''}`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed === 1 ? '1x (Normal)' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitles & Audio Menu */}
              <div className="control-dropdown-wrap">
                <button
                  className="control-btn"
                  onClick={() => {
                    setShowSubtitlesMenu(!showSubtitlesMenu);
                    setShowSpeedMenu(false);
                  }}
                  title="Audio & Subtitles"
                >
                  <Subtitles size={22} />
                </button>

                {showSubtitlesMenu && (
                  <div className="control-dropdown-menu wide">
                    <div className="subtitles-column">
                      <span className="dropdown-menu-header">Subtitles</span>
                      {['Off', 'English [CC]', 'Spanish', 'French', 'Japanese', 'Hindi'].map((sub) => (
                        <button
                          key={sub}
                          className={`dropdown-option ${selectedSubtitle === sub ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSubtitle(sub);
                            setShowSubtitlesMenu(false);
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                className="control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Player Episodes & Seasons Drawer */}
      {isSeries && (
        <div
          className={`player-drawer-backdrop ${showDrawer ? 'visible' : ''}`}
          onClick={() => setShowDrawer(false)}
        >
          <div
            className={`player-episodes-drawer ${showDrawer ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3 className="drawer-title">Episodes & Seasons</h3>
                <span className="drawer-series-name">{movie.title}</span>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setShowDrawer(false)}
                title="Close Drawer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Season Selector in Drawer */}
            {playerSeasonsList.length > 1 && (
              <div className="drawer-season-picker">
                <span className="drawer-picker-label">Season:</span>
                <div className="drawer-seasons-scroll">
                  {playerSeasonsList.map((s) => (
                    <button
                      key={s.id || s.seasonNumber}
                      className={`drawer-season-pill ${drawerSeason === s.seasonNumber ? 'active' : ''}`}
                      onClick={() => handleSelectDrawerSeason(s.seasonNumber, s.id)}
                    >
                      Season {s.seasonNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes List in Drawer */}
            <div className="drawer-episodes-list">
              {loadingDrawerEpisodes ? (
                <div className="drawer-loading">
                  <Loader2 size={30} className="spin-icon" color="#e50914" />
                  <span>Loading Season {drawerSeason} Episodes...</span>
                </div>
              ) : (
                (playerEpisodesCache[drawerSeason] || generateDrawerFallbackEpisodes(drawerSeason)).map((ep, idx) => {
                  const epNum = parseInt(ep?.ep || ep?.episodeNumber, 10) || idx + 1;
                  const isCurrentPlaying = currentSeason === drawerSeason && currentEpNum === epNum;

                  return (
                    <div
                      key={`${drawerSeason}-${epNum}`}
                      className={`drawer-episode-card ${isCurrentPlaying ? 'now-playing' : ''}`}
                      onClick={() => handlePlayDrawerEpisode(drawerSeason, ep, epNum)}
                    >
                      <div className="drawer-ep-thumb-wrap">
                        <img
                          src={ep?.id ? `https://imgcdn.kim/epimg/150/${ep.id}.jpg` : (movie.backdrop || movie.poster)}
                          alt={ep?.t || ep?.title || `Episode ${epNum}`}
                          className="drawer-ep-thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.src = movie.backdrop || movie.poster;
                          }}
                        />
                        <div className="drawer-ep-play-overlay">
                          <Play size={18} fill="#fff" />
                        </div>
                        {isCurrentPlaying && (
                          <div className="now-playing-pill">PLAYING</div>
                        )}
                        <span className="drawer-thumb-duration">{ep?.info?.[2] || ep?.duration || '45m'}</span>
                      </div>
                      <div className="drawer-ep-details">
                        <div className="drawer-ep-header-row">
                          <span className="drawer-ep-num">E{epNum}</span>
                          <h4 className="drawer-ep-title">{ep?.t || ep?.title || `Episode ${epNum}`}</h4>
                        </div>
                        <span className="drawer-ep-duration">{ep?.info?.[2] || ep?.duration || '45m'}</span>
                        <p className="drawer-ep-plot">
                          {ep?.ep_desc || ep?.description || `Episode ${epNum} of Season ${drawerSeason} in ${movie.title}.`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
