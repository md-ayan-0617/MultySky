import React from 'react';
import { Zap, Sparkles, Activity, Waves, Cake } from 'lucide-react';

export const ANIMATION_MODES = [
  {
    id: 'cyber-wave',
    name: 'Cyber Wave Matrix',
    shortName: 'Cyber Wave',
    icon: Zap,
    desc: 'Neon cyber pulses & data streams across displays',
    accent: '#3B82F6'
  },
  {
    id: 'particle-cosmos',
    name: 'Particle Cosmos',
    shortName: 'Cosmos',
    icon: Sparkles,
    desc: 'Synchronized floating neon stardust vortex',
    accent: '#60A5FA'
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    shortName: 'Neon Pulse',
    icon: Activity,
    desc: 'High-energy rhythmic digital beat visualizer',
    accent: '#38BDF8'
  },
  {
    id: 'aurora-flow',
    name: 'Aurora Flow',
    shortName: 'Aurora',
    icon: Waves,
    desc: 'Fluid organic ribbons flowing across screens',
    accent: '#818CF8'
  },
  {
    id: 'cake',
    name: 'Birthday Cake Party',
    shortName: 'Cake Party',
    icon: Cake,
    desc: 'Interactive 3D cake cutting, candles & confetti',
    accent: '#F472B6'
  }
];

export default function AnimationModeSelector({ activeMode = 'cyber-wave', onSelectMode }) {
  return (
    <div className="animation-mode-container">
      <div className="animation-mode-header">
        <div className="animation-mode-title-wrap">
          <div className="mode-badge-icon">
            <Zap size={16} />
          </div>
          <div>
            <h4 className="mode-section-title">Display & Animation Mode</h4>
            <p className="mode-section-sub">Select synchronized multi-screen visual experience</p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Mode Selector for Mobile */}
      <div className="animation-mode-scroll-bar" role="tablist">
        {ANIMATION_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectMode(mode.id)}
              className={`mode-card-chip ${isSelected ? 'active-mode' : ''}`}
            >
              <div className="mode-chip-icon">
                <Icon size={18} />
              </div>
              <div className="mode-chip-info">
                <span className="mode-chip-name">{mode.name}</span>
                <span className="mode-chip-desc">{mode.desc}</span>
              </div>
              {isSelected && <span className="mode-active-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
