import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, Volume2, VolumeX, Check, Film, Tv, Sparkles, ChevronDown, Zap } from 'lucide-react';
import { CATEGORIES } from '../data/moviesData';
import { PROFILES } from '../data/profilesData';
import { playNetflixTaDum } from '../utils/netflixAudio';

export default function Navbar({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeProfile,
  profiles = PROFILES,
  onSelectProfile,
  onSwitchProfileGate,
  soundEnabled,
  onToggleSound,
  myListCount,
  onOpenNetmirrorCenter
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    } else if (!searchQuery) {
      setIsSearchOpen(false);
    }
  };

  const handleProfileClick = (profile) => {
    onSelectProfile(profile);
    setIsProfileMenuOpen(false);
    if (soundEnabled) {
      playNetflixTaDum();
    }
  };

  return (
    <div className={`netflix-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        {/* Netflix Iconic Wordmark Logo */}
        <div 
          className="netflix-logo" 
          onClick={() => onSelectCategory('all')} 
          title="Netflix Home"
        >
          <svg viewBox="0 0 1024 276.742" width="104" height="28" fill="#E50914" aria-label="Netflix">
            <path d="M140.803 258.904c-15.404 2.705-31.079 3.516-47.294 5.676l-49.458-144.856v151.073c-15.404 1.621-29.457 3.783-44.051 5.945v-276.742h41.08l56.212 157.021v-157.021h43.511v258.904zm85.131-157.558c16.757 0 42.431-.811 57.835-.811v43.24c-19.189 0-41.619 0-57.835.811v64.322c25.405-1.621 50.809-3.785 76.482-4.596v41.617l-119.724 9.461v-255.39h119.724v43.241h-76.482v58.105zm237.284-58.104h-44.862v198.908c-14.594 0-29.188 0-43.239.539v-199.447h-44.862v-43.242h132.965l-.002 43.242zm70.266 55.132h59.187v43.24h-59.187v98.104h-42.433v-239.718h120.808v43.241h-78.375v55.133zm148.641 103.507c24.594.539 49.456 2.434 73.51 3.783v42.701c-38.646-2.434-77.293-4.863-116.75-5.676v-242.689h43.24v201.881zm109.994 49.457c13.783.812 28.377 1.623 42.43 3.242v-254.58h-42.43v251.338zm231.881-251.338l-54.863 131.615 54.863 145.127c-16.217-2.162-32.432-5.135-48.648-7.838l-31.078-79.994-31.617 73.51c-15.678-2.705-30.812-3.516-46.484-5.678l55.672-126.75-50.269-129.992h46.482l28.377 72.699 30.27-72.699h47.295z"/>
          </svg>
        </div>

        {/* Primary Navigation Links */}
        <nav className="nav-links">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`nav-link-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                onSelectCategory(cat.id);
                if (searchQuery) onSearchChange('');
              }}
            >
              {cat.title}
              {cat.id === 'my-list' && myListCount > 0 && (
                <span className="my-list-pill">{myListCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-right">
        {/* Animated Search Bar */}
        <div className={`nav-search-container ${isSearchOpen ? 'expanded' : ''}`}>
          <button 
            className="nav-icon-btn search-toggle" 
            onClick={handleSearchToggle}
            title="Search titles, actors, genres"
          >
            <Search size={19} />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            className="nav-search-input"
            placeholder="Titles, people, genres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>



        {/* Audio Ta-Dum Toggle & Test */}
        <button 
          className={`nav-icon-btn sound-btn ${soundEnabled ? 'active' : 'muted'}`}
          onClick={() => {
            onToggleSound();
            if (!soundEnabled) playNetflixTaDum();
          }}
          title={soundEnabled ? 'Ta-Dum Sound Enabled (Click to Mute)' : 'Sound Muted (Click to Enable)'}
        >
          {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="notif-wrapper">
          <button 
            className="nav-icon-btn notif-btn" 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
          >
            <Bell size={19} />
            <span className="notif-badge">3</span>
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">Notifications</div>
              <div className="notif-item">
                <div className="notif-thumb" style={{ background: '#e50914' }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div className="notif-content">
                  <p className="notif-title">New Arrival</p>
                  <p className="notif-desc">Stranger Things: Season 5 Sneak Peek is now streaming.</p>
                  <span className="notif-time">2 hours ago</span>
                </div>
              </div>
              <div className="notif-item">
                <div className="notif-thumb" style={{ background: '#ca8a04' }}>
                  <Film size={16} color="#fff" />
                </div>
                <div className="notif-content">
                  <p className="notif-title">Top 10 Today</p>
                  <p className="notif-desc">Dune: Part One jumped into #10 in Movies.</p>
                  <span className="notif-time">1 day ago</span>
                </div>
              </div>
              <div className="notif-item">
                <div className="notif-thumb" style={{ background: '#7c3aed' }}>
                  <Tv size={16} color="#fff" />
                </div>
                <div className="notif-content">
                  <p className="notif-title">Because you watched Dark</p>
                  <p className="notif-desc">Explore Cyberpunk: Edgerunners now.</p>
                  <span className="notif-time">2 days ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div 
          className="profile-menu-container"
          onMouseEnter={() => setIsProfileMenuOpen(true)}
          onMouseLeave={() => setIsProfileMenuOpen(false)}
        >
          <div className="profile-badge-btn" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
            <div 
              className="profile-avatar-thumb"
              style={{ background: activeProfile?.bgGradient || '#e50914' }}
            >
              <img 
                src={activeProfile?.avatar} 
                alt={activeProfile?.name} 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <ChevronDown size={14} className={`profile-chevron ${isProfileMenuOpen ? 'open' : ''}`} />
          </div>

          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-list">
                {profiles.map((prof) => (
                  <div
                    key={prof.id}
                    className={`profile-item ${prof.id === activeProfile?.id ? 'active' : ''}`}
                    onClick={() => handleProfileClick(prof)}
                  >
                    <div 
                      className="profile-avatar-thumb small"
                      style={{ background: prof.bgGradient }}
                    >
                      <img src={prof.avatar} alt={prof.name} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <span className="profile-item-name">{prof.name}</span>
                    {prof.id === activeProfile?.id && <Check size={14} className="profile-active-check" />}
                  </div>
                ))}
              </div>

              <div className="profile-divider" />

              <button 
                className="profile-dropdown-link" 
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onSwitchProfileGate();
                }}
              >
                Switch Profiles
              </button>
              <button 
                className="profile-dropdown-link"
                onClick={() => {
                  playNetflixTaDum();
                }}
              >
                Test Netflix Sound (Ta-Dum)
              </button>
              <div className="profile-divider" />
              <button 
                className="profile-dropdown-link signout"
                onClick={() => onSwitchProfileGate()}
              >
                Sign Out of Netflix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
