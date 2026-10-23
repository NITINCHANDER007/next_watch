import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBillboard from './components/HeroBillboard';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import DetailModal from './components/DetailModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import ProfileGate from './components/ProfileGate';
import OttPlatformBar from './components/OttPlatformBar';
import NetmirrorCenterModal from './components/NetmirrorCenterModal';
import { MOVIES } from './data/moviesData';
import { PROFILES } from './data/profilesData';
import { playNetflixTaDum } from './utils/netflixAudio';
import { searchNetMirrorCombined, NETMIRROR_PLATFORMS } from './services/netmirrorService';
import { Zap, Play, Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  // Profiles state with localStorage persistence
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_profiles');
      return saved ? JSON.parse(saved) : PROFILES;
    } catch {
      return PROFILES;
    }
  });

  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_active_profile_id');
      const found = profiles.find((p) => p.id === saved);
      return found || profiles[0];
    } catch {
      return profiles[0];
    }
  });

  const [showProfileGate, setShowProfileGate] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('netflix_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.warn('Could not save profiles:', e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      if (activeProfile?.id) {
        localStorage.setItem('netflix_active_profile_id', activeProfile.id);
      }
    } catch (e) {
      console.warn('Could not save active profile:', e);
    }
  }, [activeProfile]);

  const handleAddProfile = (newProfile) => {
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfile(newProfile);
    setShowProfileGate(false);
    if (soundEnabled) playNetflixTaDum();
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
    if (activeProfile?.id === updatedProfile.id) {
      setActiveProfile(updatedProfile);
    }
  };

  const handleDeleteProfile = (profileId) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== profileId);
      if (activeProfile?.id === profileId) {
        setActiveProfile(next[0] || PROFILES[0]);
      }
      return next;
    });
  };

  // Active OTT Platform (Default: Netflix 'nf')
  const [activeOtt, setActiveOtt] = useState('nf');

  // NetMirror Center Hub Modal toggle
  const [showNetmirrorModal, setShowNetmirrorModal] = useState(false);

  // Category & Navigation
  const [activeCategory, setActiveCategory] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [netmirrorLiveResults, setNetmirrorLiveResults] = useState([]);
  const [isSearchingNetmirror, setIsSearchingNetmirror] = useState(false);

  // Modals state
  const [detailMovie, setDetailMovie] = useState(null);
  const [playingMovie, setPlayingMovie] = useState(null);
  const [playingEpisode, setPlayingEpisode] = useState(null);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // My List with local storage persistence
  const [myListIds, setMyListIds] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_my_list');
      return saved ? JSON.parse(saved) : ['stranger-things', 'wednesday', 'the-boys'];
    } catch {
      return ['stranger-things', 'wednesday'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('netflix_my_list', JSON.stringify(myListIds));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [myListIds]);

  const isInMyList = (id) => myListIds.includes(id);

  const toggleMyList = (movie) => {
    setMyListIds((prev) => {
      if (prev.includes(movie.id)) {
        return prev.filter((id) => id !== movie.id);
      } else {
        return [...prev, movie.id];
      }
    });
  };

  // Master Header Scroll Effect (Smooth glassmorphism on scroll)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time combined multi-OTT live search from NetMirror NewTV and NetMirror Center
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    const timer = setTimeout(() => {
      setIsSearchingNetmirror(true);
      searchNetMirrorCombined(searchQuery, activeOtt)
        .then((results) => {
          setNetmirrorLiveResults(results || []);
        })
        .catch(() => {})
        .finally(() => {
          setIsSearchingNetmirror(false);
        });
    }, 280);

    return () => {
      clearTimeout(timer);
      setIsSearchingNetmirror(false);
    };
  }, [searchQuery, activeOtt]);

  const visibleLiveResults = searchQuery.trim().length >= 2 ? netmirrorLiveResults : [];

  // Current OTT metadata
  const currentOttMeta = useMemo(() => {
    return NETMIRROR_PLATFORMS.find((p) => p.id === activeOtt) || NETMIRROR_PLATFORMS[0];
  }, [activeOtt]);

  // Filter movies for active OTT platform & Kids profile
  const platformMovies = useMemo(() => {
    let list = MOVIES.filter((m) => m.ott === activeOtt);
    if (list.length < 10) list = MOVIES;

    if (activeProfile?.isKids) {
      return list.filter((m) => {
        const rating = (m.rating || '').toUpperCase();
        if (rating.includes('A 18') || rating.includes('TV-MA') || rating.includes('R ') || rating === 'R') {
          return false;
        }
        if (m.categories?.includes('kids') || m.genres?.some((g) => /anime|animation|family|children|kids/i.test(g))) {
          return true;
        }
        if (['TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'PG', 'G', 'U'].some((r) => rating.includes(r))) {
          return true;
        }
        return false;
      });
    }

    return list;
  }, [activeOtt, activeProfile?.isKids]);

  // Helper to accurately classify Indian cinema (Bollywood, Tollywood, regional)
  const isIndianCinema = (m) => {
    if (m.categories?.includes('bollywood')) return true;
    const hay = `${m.title} ${(m.genres || []).join(' ')} ${(m.tags || []).join(' ')} ${m.audio || ''} ${m.synopsis || ''}`.toLowerCase();
    return /hindi|tamil|telugu|kannada|malayalam|marathi|punjabi|bengali|india|bollywood|tollywood|kollywood|drishyam|awarapan|gehraiyaan|rocky aur rani|teri baaton|sita ramam|khalifa|dupahiya|lenin pandiyan|jailer|sardar|mirzapur|panchayat|radhe shyam|jawan|pathaan|dangal|agneepath|b\.a\. pass|kurla to|traitors \(telugu\)|waiting hai|masterplan|hokum/i.test(hay);
  };

  // Helper to accurately classify Anime & Asian animation
  const isAnimeOrAsian = (m) => {
    if (m.categories?.includes('anime')) return true;
    const hay = `${m.title} ${(m.genres || []).join(' ')} ${(m.tags || []).join(' ')} ${m.synopsis || ''}`.toLowerCase();
    return /anime|manga|japan|japanese|demon slayer|dragon ball|naruto|jujutsu|attack on titan|chainsaw|death note|one piece|witch and my crush|noble girl|angel next door|farming life|cunning fiancé|kusunoki|spirit chronicles|healing magic|100 girlfriends|sato-san|cheat-granting|reincarnated aristocrat|overgeared|helluva boss|firefly wedding|heaven official/i.test(hay);
  };

  // Specific content genre lists
  const bollywoodMovies = useMemo(() => {
    return platformMovies.filter(isIndianCinema);
  }, [platformMovies]);

  const animeMovies = useMemo(() => {
    return platformMovies.filter(isAnimeOrAsian);
  }, [platformMovies]);

  const hollywoodMovies = useMemo(() => {
    return platformMovies.filter(
      (m) => !isIndianCinema(m) && !isAnimeOrAsian(m)
    );
  }, [platformMovies]);

  const seriesMovies = useMemo(() => {
    return platformMovies.filter((m) => m.isSeries);
  }, [platformMovies]);

  const featureMovies = useMemo(() => {
    return platformMovies.filter((m) => !m.isSeries);
  }, [platformMovies]);

  const actionMovies = useMemo(() => {
    return platformMovies.filter((m) => m.categories?.includes('action'));
  }, [platformMovies]);

  const scifiMovies = useMemo(() => {
    return platformMovies.filter((m) => m.categories?.includes('scifi'));
  }, [platformMovies]);

  const dramaMovies = useMemo(() => {
    return platformMovies.filter((m) => m.categories?.includes('drama'));
  }, [platformMovies]);

  // Select Billboard Featured Movie based on active OTT and category
  const billboardMovie = useMemo(() => {
    if (activeCategory === 'bollywood') {
      return (
        bollywoodMovies.find((m) => m.id === '235527' || m.title === 'Agneepath') ||
        bollywoodMovies[0] ||
        platformMovies[0]
      );
    }
    if (activeCategory === 'hollywood') {
      return (
        hollywoodMovies.find((m) => m.id === '70131314' || m.title === 'Inception') ||
        hollywoodMovies[0] ||
        platformMovies[0]
      );
    }
    if (activeCategory === 'anime') {
      return (
        animeMovies.find((m) => m.title?.includes('Demon Slayer')) ||
        animeMovies[0] ||
        platformMovies[0]
      );
    }
    if (activeCategory === 'tv') {
      return (
        seriesMovies.find((m) => m.id === 'stranger-things') ||
        seriesMovies.find((m) => m.id === 'wednesday') ||
        seriesMovies[0] ||
        platformMovies[0]
      );
    }
    if (activeCategory === 'movies') {
      return (
        featureMovies.find((m) => m.id === 'interstellar' || m.title === 'Interstellar') ||
        featureMovies[0] ||
        platformMovies[0]
      );
    }

    if (activeOtt === 'pv') {
      return MOVIES.find((m) => m.id === 'the-boys') || MOVIES.find((m) => m.id === 'fallout') || platformMovies[0];
    }
    if (activeOtt === 'hs') {
      return MOVIES.find((m) => m.id === 'loki') || MOVIES.find((m) => m.id === 'deadpool-wolverine') || platformMovies[0];
    }
    if (activeOtt === 'appleTV') {
      return MOVIES.find((m) => m.id === 'severance') || platformMovies[0];
    }
    if (activeOtt === 'zee5') {
      return MOVIES.find((m) => m.id === 'rrr') || bollywoodMovies[0] || platformMovies[0];
    }

    return MOVIES.find((m) => m.id === 'stranger-things') || platformMovies[0];
  }, [activeOtt, activeCategory, platformMovies, bollywoodMovies, hollywoodMovies, animeMovies, seriesMovies, featureMovies]);

  // Filter movies for local search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.genres?.some((g) => g.toLowerCase().includes(query)) ||
        m.tags?.some((t) => t.toLowerCase().includes(query)) ||
        m.cast?.some((c) => c.toLowerCase().includes(query)) ||
        m.creator?.toLowerCase().includes(query) ||
        m.synopsis.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Handler for opening player
  const handlePlayMovie = (movie, episode = null) => {
    if (soundEnabled) {
      playNetflixTaDum();
    }
    setPlayingMovie(movie);
    setPlayingEpisode(episode);
    setDetailMovie(null);

    // Update continue watching in active profile
    if (movie?.id && activeProfile) {
      const existingIds = (activeProfile.continueWatching || []).filter((id) => id !== movie.id);
      const updatedProfile = {
        ...activeProfile,
        continueWatching: [movie.id, ...existingIds].slice(0, 10)
      };
      setActiveProfile(updatedProfile);
      setProfiles((prev) => prev.map((p) => (p.id === activeProfile.id ? updatedProfile : p)));
    }
  };

  // Convert NetMirror live search item to playable movie object
  const handlePlayNetmirrorResult = (item) => {
    const movieObj = {
      id: item.id,
      title: item.title,
      backdrop: item.backdrop || item.backdrop_path || ('https://imgcdn.kim/poster/h/' + item.id + '.jpg'),
      poster: item.poster || item.backdrop_path || ('https://imgcdn.kim/poster/v/' + item.id + '.jpg'),
      netmirrorId: item.netmirrorId || item.id,
      playbackId: item.playbackId || item.id,
      releaseYear: item.releaseYear || item.release_date || 2024,
      isSeries: item.isSeries ?? (item.media_type === 'tv' || item.title?.includes('S1') || item.title?.includes('Season')),
      duration: item.duration || (item.media_type === 'tv' ? 'Series' : 'Feature Film'),
      rating: item.rating || 'TV-14',
      matchScore: item.matchScore || 98,
      quality: '4K Ultra HD',
      synopsis: item.synopsis || (item.title + ' streaming online in 4K Ultra HD via NetMirror live engine.'),
      genres: item.genres || ['NetMirror Stream', item.media_type === 'tv' ? 'TV Series' : 'Movie'],
      ott: item.ott || activeOtt
    };
    handlePlayMovie(movieObj);
  };

  const handleOpenDetail = (movie) => {
    setDetailMovie(movie);
  };

  const handleCloseDetail = () => {
    setDetailMovie(null);
  };

  const handleClosePlayer = () => {
    setPlayingMovie(null);
    setPlayingEpisode(null);
  };

  // Continue watching movies for active profile
  const continueWatchingMovies = useMemo(() => {
    const ids = activeProfile?.continueWatching || ['stranger-things', 'the-boys'];
    return ids.map((id) => MOVIES.find((m) => m.id === id)).filter(Boolean);
  }, [activeProfile]);

  // Top 10 movies sorted by rank for active platform
  const top10Movies = useMemo(() => {
    return platformMovies
      .filter((m) => m.top10Rank != null)
      .sort((a, b) => a.top10Rank - b.top10Rank);
  }, [platformMovies]);

  // Category-specific content list for standalone category grid view
  const categoryMovies = useMemo(() => {
    if (activeCategory === 'my-list') {
      return myListIds.map((id) => MOVIES.find((m) => m.id === id)).filter(Boolean);
    }
    if (activeCategory === 'tv') {
      return seriesMovies;
    }
    if (activeCategory === 'movies') {
      return featureMovies;
    }
    if (activeCategory === 'bollywood') {
      return bollywoodMovies;
    }
    if (activeCategory === 'hollywood') {
      return hollywoodMovies;
    }
    if (activeCategory === 'anime') {
      return animeMovies;
    }
    if (activeCategory === 'trending') {
      return platformMovies.filter((m) => m.categories?.includes('trending'));
    }
    return platformMovies;
  }, [activeCategory, myListIds, seriesMovies, featureMovies, bollywoodMovies, hollywoodMovies, animeMovies, platformMovies]);

  return (
    <div
      className="netflix-app"
      style={{
        '--active-brand-color': currentOttMeta.brandColor,
        '--active-bg-dark': currentOttMeta.bgDark
      }}
    >
      {/* Profile Gate ("Who's watching?") Screen */}
      {showProfileGate && (
        <ProfileGate
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={(profile) => {
            setActiveProfile(profile);
            setShowProfileGate(false);
          }}
          onAddProfile={handleAddProfile}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileGate(false)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Unified Master Header (Fixed Top Netflix Bar + Docked OTT Platform Selector) */}
      <header className={`netflix-master-header ${isScrolled ? 'scrolled' : ''}`}>
        <Navbar
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeProfile={activeProfile}
          profiles={profiles}
          onSelectProfile={setActiveProfile}
          onSwitchProfileGate={() => setShowProfileGate(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          myListCount={myListIds.length}
          onOpenNetmirrorCenter={() => setShowNetmirrorModal(true)}
        />

        <OttPlatformBar
          activeOtt={activeOtt}
          onSelectOtt={(ott) => {
            setActiveOtt(ott);
            if (soundEnabled) playNetflixTaDum();
          }}
          onOpenNetmirrorCenter={() => setShowNetmirrorModal(true)}
        />
      </header>

      {/* NetMirror Center & Extension Hub Modal */}
      {showNetmirrorModal && (
        <NetmirrorCenterModal
          onClose={() => setShowNetmirrorModal(false)}
          activeOtt={activeOtt}
          onSelectOtt={(ott) => {
            setActiveOtt(ott);
            setShowNetmirrorModal(false);
            if (soundEnabled) playNetflixTaDum();
          }}
        />
      )}

      <main className="main-content">
        {/* Search Results Grid View (Combining Local + Live NetMirror Search) */}
        {searchQuery.trim() ? (
          <section className="search-results-section">
            <div className="search-results-header">
              <div className="search-title-group">
                <h2 className="search-results-title">
                  Explore titles related to: <span className="search-query-text">"{searchQuery}"</span>
                </h2>
                <div className="search-meta-badge">
                  <Zap size={14} color="#e50914" />
                  <span>NetMirror Live Search Online</span>
                </div>
              </div>
              <p className="search-results-count">
                {searchResults.length + visibleLiveResults.length} titles found across catalogs
              </p>
            </div>

            {/* NetMirror Live Search Stream Section */}
            {visibleLiveResults.length > 0 && (
              <div className="netmirror-live-search-container">
                <div className="live-search-subhead">
                  <Sparkles size={16} color="#e50914" />
                  <h3>Live Streaming Titles from NetMirror Cluster</h3>
                  <span className="live-pulse-badge">Live Feeds</span>
                </div>
                <div className="netmirror-search-grid">
                  {visibleLiveResults.map((item) => (
                    <div
                      key={item.id}
                      className="netmirror-result-card"
                      onClick={() => handlePlayNetmirrorResult(item)}
                    >
                      <div className="result-poster-wrap">
                        <img
                          src={item.poster || ('https://imgcdn.kim/poster/v/' + item.id + '.jpg')}
                          alt={item.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.src = 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg';
                          }}
                        />
                        <div className="result-overlay">
                          <button className="result-play-circle" title="Instant Play">
                            <Play size={18} fill="#fff" />
                          </button>
                        </div>
                      </div>
                      <div className="result-info">
                        <span className="result-title" title={item.title}>
                          {item.title}
                        </span>
                        <div className="result-meta-row">
                          <span className="result-year">{item.releaseYear || '2024'}</span>
                          <span className="result-tag">{item.isSeries ? 'Series' : 'Movie'}</span>
                          <span className="result-live-pill">
                            <Zap size={11} /> 4K Stream
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curated 4K Local Catalog Results */}
            {searchResults.length > 0 && (
              <div className="curated-search-section">
                <h3 className="section-subtitle">Netflix 4K HDR Showcase</h3>
                <div className="movies-grid">
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayMovie}
                      onOpenDetail={handleOpenDetail}
                      isInMyList={isInMyList}
                      onToggleMyList={toggleMyList}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && visibleLiveResults.length === 0 && !isSearchingNetmirror && (
              <div className="empty-state">
                <h3>No titles found</h3>
                <p>
                  Your search for "{searchQuery}" did not have any matches. Try searching for "Stranger Things", "Dangal", "Jawan", "Avengers", "Demon Slayer", or "The Boys".
                </p>
                <button
                  className="btn-primary-red"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>
        ) : activeCategory === 'my-list' ? (
          /* My List Grid View */
          <section className="category-filter-section">
            <div className="category-header">
              <h2 className="category-title">My List</h2>
            </div>

            {categoryMovies.length > 0 ? (
              <div className="movies-grid">
                {categoryMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlayMovie}
                    onOpenDetail={handleOpenDetail}
                    isInMyList={isInMyList}
                    onToggleMyList={toggleMyList}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Your list is empty</h3>
                <p>
                  Explore movies and TV shows and click the <strong>+</strong> icon to save your favorite titles to watch later.
                </p>
                <button
                  className="btn-primary-red"
                  onClick={() => setActiveCategory('all')}
                >
                  Browse Home
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Main Browse View (Billboard + Categories) */
          <>
            {/* Cinematic Hero Billboard */}
            <HeroBillboard
              movie={billboardMovie}
              onPlay={handlePlayMovie}
              onOpenDetail={handleOpenDetail}
              isInMyList={isInMyList}
              onToggleMyList={toggleMyList}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              isModalOpen={Boolean(playingMovie || detailMovie)}
            />

            {/* Content Rows */}
            <div className="content-rows-container">
              {/* Continue Watching for Active Profile */}
              {continueWatchingMovies.length > 0 && activeCategory === 'all' && (
                <MovieRow
                  title={'Continue Watching for ' + (activeProfile?.name || 'You')}
                  movies={continueWatchingMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                />
              )}

              {/* Top 10 in Your Country Today (Legendary 3D Number Row) */}
              {(activeCategory === 'all' || activeCategory === 'trending') && (
                <MovieRow
                  title={'Top 10 on ' + currentOttMeta.name + ' Today'}
                  movies={top10Movies.length > 0 ? top10Movies : platformMovies.slice(0, 10)}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  isTop10={true}
                  onExplore={() => setActiveCategory('trending')}
                />
              )}

              {/* Bollywood Blockbusters & Indian Cinema */}
              {(activeCategory === 'all' || activeCategory === 'bollywood') && bollywoodMovies.length > 0 && (
                <MovieRow
                  title={currentOttMeta.name === 'Netflix' ? 'Bollywood Blockbusters & Indian Cinema' : currentOttMeta.name + ' Bollywood & Indian Cinema'}
                  movies={bollywoodMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('bollywood')}
                />
              )}

              {/* Hollywood Global Blockbusters */}
              {(activeCategory === 'all' || activeCategory === 'hollywood') && hollywoodMovies.length > 0 && (
                <MovieRow
                  title={currentOttMeta.name === 'Netflix' ? 'Hollywood Global Blockbusters' : currentOttMeta.name + ' Hollywood & Global Hits'}
                  movies={hollywoodMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('hollywood')}
                />
              )}

              {/* Trending Now */}
              {(activeCategory === 'all' || activeCategory === 'trending') && (
                <MovieRow
                  title={'Trending on ' + currentOttMeta.name}
                  movies={platformMovies.filter((m) => m.categories?.includes('trending'))}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('trending')}
                />
              )}

              {/* Originals Row */}
              {(activeCategory === 'all' || activeCategory === 'tv') && (
                <MovieRow
                  title={currentOttMeta.name + ' Originals & Exclusives'}
                  movies={platformMovies.filter((m) => m.isOriginal).length > 0 ? platformMovies.filter((m) => m.isOriginal) : platformMovies.slice(0, 12)}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  isTall={true}
                  onExplore={() => setActiveCategory('tv')}
                />
              )}

              {/* Binge-Worthy TV Series */}
              {(activeCategory === 'all' || activeCategory === 'tv') && seriesMovies.length > 0 && (
                <MovieRow
                  title={currentOttMeta.name === 'Netflix' ? 'Binge-Worthy TV Series & Web Shows' : currentOttMeta.name + ' Series & Web Shows'}
                  movies={seriesMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('tv')}
                />
              )}

              {/* Anime & Japanese Animation Hits */}
              {(activeCategory === 'all' || activeCategory === 'anime') && animeMovies.length > 0 && (
                <MovieRow
                  title={currentOttMeta.name === 'Netflix' ? 'Anime & Japanese Animation Hits' : currentOttMeta.name + ' Anime & Asian Animation'}
                  movies={animeMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('anime')}
                />
              )}

              {/* Feature Films */}
              {(activeCategory === 'all' || activeCategory === 'movies') && featureMovies.length > 0 && (
                <MovieRow
                  title={currentOttMeta.name === 'Netflix' ? 'Critically Acclaimed Feature Films' : currentOttMeta.name + ' Feature Films'}
                  movies={featureMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                  onExplore={() => setActiveCategory('movies')}
                />
              )}

              {/* Action & Thrillers */}
              {(activeCategory === 'all' || activeCategory === 'movies') && actionMovies.length > 0 && (
                <MovieRow
                  title="Action & High-Adrenaline Thrillers"
                  movies={actionMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                />
              )}

              {/* Sci-Fi & Mind-Bending */}
              {activeCategory === 'all' && scifiMovies.length > 0 && (
                <MovieRow
                  title="Sci-Fi & Mind-Bending"
                  movies={scifiMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                />
              )}

              {/* Critically Acclaimed Dramas */}
              {activeCategory === 'all' && dramaMovies.length > 0 && (
                <MovieRow
                  title="Emotional & Critically Acclaimed Dramas"
                  movies={dramaMovies}
                  onPlay={handlePlayMovie}
                  onOpenDetail={handleOpenDetail}
                  isInMyList={isInMyList}
                  onToggleMyList={toggleMyList}
                />
              )}
            </div>

            {/* Standalone Full Category Grid when specific category is active (e.g. Bollywood, Hollywood, Anime) */}
            {activeCategory !== 'all' && (
              <section className="category-filter-section" style={{ marginTop: '2rem' }}>
                <div className="category-header">
                  <h2 className="category-title">
                    All {activeCategory === 'bollywood' ? 'Bollywood & Indian' : activeCategory === 'hollywood' ? 'Hollywood' : activeCategory === 'anime' ? 'Anime' : activeCategory === 'tv' ? 'TV Shows' : activeCategory === 'movies' ? 'Movies' : 'Popular'} Titles ({categoryMovies.length})
                  </h2>
                </div>
                <div className="movies-grid">
                  {categoryMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayMovie}
                      onOpenDetail={handleOpenDetail}
                      isInMyList={isInMyList}
                      onToggleMyList={toggleMyList}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Movie Details Modal */}
      {detailMovie && (
        <DetailModal
          movie={detailMovie}
          allMovies={MOVIES}
          onClose={handleCloseDetail}
          onPlay={handlePlayMovie}
          isInMyList={isInMyList}
          onToggleMyList={toggleMyList}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onSelectMovie={handleOpenDetail}
        />
      )}

      {/* Video Player Modal */}
      {playingMovie && (
        <VideoPlayerModal
          movie={playingMovie}
          episode={playingEpisode}
          onClose={handleClosePlayer}
        />
      )}

      {/* Official Netflix + NetMirror Footer */}
      <footer className="netflix-footer">
        <div className="footer-social-row">
          <span className="footer-social-link">Audio Description</span>
          <span className="footer-social-link" onClick={() => setShowNetmirrorModal(true)} style={{ cursor: 'pointer', color: '#e50914' }}>
            ⚡ NetMirror Center Hub
          </span>
          <span className="footer-social-link">Help Center</span>
          <span className="footer-social-link">Media Center</span>
          <span className="footer-social-link">Multi-OTT Network</span>
        </div>

        <div className="footer-links-grid">
          <a href="#investor" className="footer-link">Investor Relations</a>
          <a href="#jobs" className="footer-link">Jobs</a>
          <a href="#terms" className="footer-link">Terms of Use</a>
          <a href="#privacy" className="footer-link">Privacy</a>
          <a href="#legal" className="footer-link">Legal Notices</a>
          <a href="#cookies" className="footer-link">Cookie Preferences</a>
          <a href="#corporate" className="footer-link">Corporate Information</a>
          <a href="#contact" className="footer-link">Contact Us</a>
        </div>

        <button className="service-code-btn" onClick={() => setShowNetmirrorModal(true)}>
          NetMirror Diagnostics
        </button>
        <p className="footer-copyright">
          © 1997-2026 Netflix, Inc. · Powered by NetMirror Center Multi-OTT Architecture (Bollywood, Hollywood, Series & Anime)
        </p>
      </footer>
    </div>
  );
}
