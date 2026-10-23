import React, { useState } from 'react';
import { Plus, Pencil, X, Check, Trash2 } from 'lucide-react';
import { PROFILES } from '../data/profilesData';
import { playNetflixTaDum } from '../utils/netflixAudio';

const AVATAR_OPTIONS = [
  {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    color: '#E50914',
    bgGradient: 'linear-gradient(135deg, #e50914, #831010)'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    color: '#9333ea',
    bgGradient: 'linear-gradient(135deg, #9333ea, #4c1d95)'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #b45309)'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #06b6d4, #0e7490)'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #10b981, #065f46)'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #ec4899, #9d174d)'
  }
];

export default function ProfileGate({
  profiles = PROFILES,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onClose,
  soundEnabled
}) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formIsKids, setFormIsKids] = useState(false);
  const [formAvatarIdx, setFormAvatarIdx] = useState(0);

  const handleProfileClick = (profile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setFormName(profile.name);
      setFormIsKids(Boolean(profile.isKids));
      const idx = AVATAR_OPTIONS.findIndex((a) => a.avatar === profile.avatar);
      setFormAvatarIdx(idx >= 0 ? idx : 0);
      return;
    }

    if (soundEnabled) {
      playNetflixTaDum();
    }
    onSelectProfile(profile);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setFormName('');
    setFormIsKids(false);
    setFormAvatarIdx(profiles.length % AVATAR_OPTIONS.length);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const chosen = AVATAR_OPTIONS[formAvatarIdx];
    const newProfile = {
      id: 'profile-' + Date.now(),
      name: formName.trim(),
      avatar: chosen.avatar,
      color: chosen.color,
      bgGradient: chosen.bgGradient,
      isKids: formIsKids,
      continueWatching: []
    };

    if (onAddProfile) {
      onAddProfile(newProfile);
    }
    setIsAdding(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProfile || !formName.trim()) return;

    const chosen = AVATAR_OPTIONS[formAvatarIdx];
    const updated = {
      ...editingProfile,
      name: formName.trim(),
      avatar: chosen.avatar,
      color: chosen.color,
      bgGradient: chosen.bgGradient,
      isKids: formIsKids
    };

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setEditingProfile(null);
  };

  const handleDelete = (profileId) => {
    if (profiles.length <= 1) return;
    if (onDeleteProfile) {
      onDeleteProfile(profileId);
    }
    setEditingProfile(null);
  };

  return (
    <div className="profile-gate-screen">
      {/* Top Header */}
      <div className="profile-gate-top">
        <svg viewBox="0 0 111 30" width="120" height="34" fill="#E50914" aria-label="Netflix">
          <path d="M105.062 14.28L111 30c-1.78-.28-3.56-.56-5.34-.84l-3.32-8.82-3.32 8.82c-1.78.28-3.56.56-5.34.84l5.94-15.72L93.722 0h5.34l3.22 8.52L105.502 0h5.34l-5.78 14.28zm-22.18-7.74v8.52h9.12v4.86h-9.12v9.3h-5.34V0h15.96v4.86h-10.62v1.68zm-15.36 17.58c-1.78-.28-3.56-.56-5.34-.84V0h5.34v24.12zm-12.06 4.98c-1.78.28-3.56.56-5.34.84l-6.24-17.4V30h-5.34V0h5.34l6.24 17.4V0h5.34v29.1zm-24.18-4.98c-1.78-.28-3.56-.56-5.34-.84V4.86h-4.8V0h14.94v4.86h-4.8v19.26zm-17.76 0c-1.78-.28-3.56-.56-5.34-.84V0h14.94v4.86h-9.6v7.38h8.58v4.86h-8.58v6.24h9.6v4.86h-18.06V24.12zM0 30V0h5.34l6.84 18.3V0h5.34v30h-5.34L5.34 11.7V30H0z"/>
        </svg>

        {onClose && (
          <button className="profile-gate-close-btn" onClick={onClose} title="Back to Netflix">
            <X size={26} />
          </button>
        )}
      </div>

      <div className="profile-gate-center">
        <h1 className="profile-gate-title">
          {isManaging ? 'Manage Profiles:' : "Who's watching?"}
        </h1>

        <div className="profile-gate-cards">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`gate-profile-card ${isManaging ? 'managing' : ''}`}
              onClick={() => handleProfileClick(profile)}
            >
              <div 
                className="gate-avatar-box" 
                style={{ background: profile.bgGradient }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="gate-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {isManaging && (
                  <div className="gate-manage-overlay">
                    <Pencil size={28} color="#ffffff" />
                  </div>
                )}
                {profile.isKids && (
                  <span className="gate-kids-badge">KIDS</span>
                )}
              </div>
              <span className="gate-profile-name">{profile.name}</span>
            </div>
          ))}

          {/* Add Profile Card */}
          {!isManaging && (
            <div 
              className="gate-profile-card add-profile-card"
              onClick={handleStartAdd}
              title="Add a new profile"
            >
              <div className="gate-avatar-box add-box">
                <Plus size={44} color="#808080" />
              </div>
              <span className="gate-profile-name">Add Profile</span>
            </div>
          )}
        </div>

        {/* Manage / Done Button */}
        <button 
          className={`manage-profiles-btn ${isManaging ? 'active-done' : ''}`}
          onClick={() => setIsManaging(!isManaging)}
        >
          {isManaging ? 'Done' : 'Manage Profiles'}
        </button>
      </div>

      {/* Add Profile Modal */}
      {isAdding && (
        <div className="profile-modal-backdrop" onClick={() => setIsAdding(false)}>
          <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Add Profile</h2>
              <p>Add a profile for another person watching Netflix.</p>
            </div>

            <form onSubmit={handleSaveAdd} className="dialog-form">
              <div className="dialog-avatar-preview">
                <div 
                  className="dialog-avatar-box"
                  style={{ background: AVATAR_OPTIONS[formAvatarIdx].bgGradient }}
                >
                  <img src={AVATAR_OPTIONS[formAvatarIdx].avatar} alt="Preview" />
                </div>

                <div className="avatar-picker-row">
                  {AVATAR_OPTIONS.map((opt, i) => (
                    <button
                      type="button"
                      key={opt.avatar}
                      className={`avatar-pick-thumb ${formAvatarIdx === i ? 'selected' : ''}`}
                      style={{ background: opt.bgGradient }}
                      onClick={() => setFormAvatarIdx(i)}
                    >
                      <img src={opt.avatar} alt={`Avatar ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  maxLength={20}
                  required
                />
              </div>

              <label className="kids-checkbox-label">
                <input
                  type="checkbox"
                  checked={formIsKids}
                  onChange={(e) => setFormIsKids(e.target.checked)}
                />
                <span className="custom-check-box">{formIsKids && <Check size={14} />}</span>
                <span>Kid? Only see TV shows and movies for children.</span>
              </label>

              <div className="dialog-actions">
                <button type="submit" className="dialog-btn-save">
                  Continue
                </button>
                <button 
                  type="button" 
                  className="dialog-btn-cancel"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="profile-modal-backdrop" onClick={() => setEditingProfile(null)}>
          <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Edit Profile</h2>
              <p>Change name, avatar, or viewing permissions.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="dialog-form">
              <div className="dialog-avatar-preview">
                <div 
                  className="dialog-avatar-box"
                  style={{ background: AVATAR_OPTIONS[formAvatarIdx].bgGradient }}
                >
                  <img src={AVATAR_OPTIONS[formAvatarIdx].avatar} alt="Preview" />
                </div>

                <div className="avatar-picker-row">
                  {AVATAR_OPTIONS.map((opt, i) => (
                    <button
                      type="button"
                      key={opt.avatar}
                      className={`avatar-pick-thumb ${formAvatarIdx === i ? 'selected' : ''}`}
                      style={{ background: opt.bgGradient }}
                      onClick={() => setFormAvatarIdx(i)}
                    >
                      <img src={opt.avatar} alt={`Avatar ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>

              <label className="kids-checkbox-label">
                <input
                  type="checkbox"
                  checked={formIsKids}
                  onChange={(e) => setFormIsKids(e.target.checked)}
                />
                <span className="custom-check-box">{formIsKids && <Check size={14} />}</span>
                <span>Kid? Only see TV shows and movies for children.</span>
              </label>

              <div className="dialog-actions">
                <button type="submit" className="dialog-btn-save">
                  Save
                </button>
                <button 
                  type="button" 
                  className="dialog-btn-cancel"
                  onClick={() => setEditingProfile(null)}
                >
                  Cancel
                </button>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    className="dialog-btn-delete"
                    onClick={() => handleDelete(editingProfile.id)}
                    title="Delete profile"
                  >
                    <Trash2 size={16} /> Delete Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
