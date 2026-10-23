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
          <svg viewBox="0 0 111 30" width="102" height="30" fill="#E50914" aria-label="Netflix">
            <path d="M105.062 14.28L111 30c-1.78-.28-3.56-.56-5.34-.84l-3.32-8.82-3.32 8.82c-1.78.28-3.56.56-5.34.84l5.94-15.72L93.722 0h5.34l3.22 8.52L105.502 0h5.34l-5.78 14.28zm-22.18-7.74v8.52h9.12v4.86h-9.12v9.3h-5.34V0h15.96v4.86h-10.62v1.68zm-15.36 17.58c-1.78-.28-3.56-.56-5.34-.84V0h5.34v24.12zm-12.06 4.98c-1.78.28-3.56.56-5.34.84l-6.24-17.4V30h-5.34V0h5.34l6.24 17.4V0h5.34v29.1zm-24.18-4.98c-1.78-.28-3.56-.56-5.34-.84V4.86h-4.8V0h14.94v4.86h-4.8v19.26zm-17.76 0c-1.78-.28-3.56-.56-5.34-.84V0h14.94v4.86h-9.6v7.38h8.58v4.86h-8.58v6.24h9.6v4.86h-18.06V24.12zM0 30V0h5.34l6.84 18.3V0h5.34v30h-5.34L5.34 11.7V30H0z"/>
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

        {/* NetMirror Center Hub Trigger Button */}
        <button
          className="nav-netmirror-hub-btn"
          onClick={onOpenNetmirrorCenter}
          title="Open Streaming Center & Network Status"
        >
          <Zap size={15} className="hub-bolt-icon" />
          <span className="hub-text">NetMirror</span>
          <span className="hub-live-dot" />
        </button>

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
