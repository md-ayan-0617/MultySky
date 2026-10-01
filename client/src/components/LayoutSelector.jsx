import React, { useState } from 'react';
import { Grid, Layers, Monitor, Sliders, Hash, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { STANDARD_LAYOUTS, POPULAR_LARGE_PRESETS, calculateOptimalGrid, createCustomGrid } from '../utils/layoutUtils';

export default function LayoutSelector({ currentLayout, onSelectLayout }) {
  const activeId = currentLayout?.id || '2x2';
  const currentTotal = currentLayout?.total || (currentLayout?.rows * currentLayout?.cols) || 4;

  const [phoneCountInput, setPhoneCountInput] = useState(currentTotal >= 10 ? currentTotal : 20);
  const [customRows, setCustomRows] = useState(currentLayout?.rows || 4);
  const [customCols, setCustomCols] = useState(currentLayout?.cols || 5);
  const [showAllPills, setShowAllPills] = useState(false);
  const [activeTab, setActiveTab] = useState(currentTotal > 9 ? 'more' : 'standard');

  const handleSelectCount = (count) => {
    const valid = Math.max(1, Math.min(100, parseInt(count, 10) || 1));
    setPhoneCountInput(valid);
    const layout = calculateOptimalGrid(valid);
    onSelectLayout(layout);
  };

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    const r = Math.max(1, Math.min(10, parseInt(customRows, 10) || 1));
    const c = Math.max(1, Math.min(10, parseInt(customCols, 10) || 1));
    const total = r * c;
    if (total > 100) {
      alert(`Custom grid total (${total}) exceeds 100 phones limit.`);
      return;
    }
    const layout = createCustomGrid(r, c);
    onSelectLayout(layout);
  };

  return (
    <div className="clay-card" style={{ padding: '24px', background: 'var(--clay-surface)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            color: '#271E47',
            background: 'var(--clay-lavender)',
            boxShadow: 'var(--clay-shadow-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Grid size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>Screen Grid Configuration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Configure 1 to 100 smartphone screens in a synchronized visual wall
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-ready" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            Active: {currentLayout?.rows || 2} × {currentLayout?.cols || 2} ({currentLayout?.total || 4} Phones)
          </span>
        </div>
      </div>

      {/* Tabs: Standard vs More Grids (10-100) vs Custom */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '6px',
        background: 'var(--clay-surface-warm)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px',
        border: '2px solid rgba(48, 45, 61, 0.05)'
      }}>
        <button
          onClick={() => setActiveTab('standard')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: activeTab === 'standard' ? 'var(--clay-coral)' : 'transparent',
            color: activeTab === 'standard' ? '#ffffff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'standard' ? 'var(--clay-shadow-coral)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Standard (1–9)
        </button>

        <button
          onClick={() => setActiveTab('more')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: activeTab === 'more' ? 'var(--clay-coral)' : 'transparent',
            color: activeTab === 'more' ? '#ffffff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'more' ? 'var(--clay-shadow-coral)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={16} /> MORE GRIDS (10–100)
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 800,
            background: activeTab === 'custom' ? 'var(--clay-coral)' : 'transparent',
            color: activeTab === 'custom' ? '#ffffff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'custom' ? 'var(--clay-shadow-coral)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Sliders size={16} /> Custom Grid
        </button>
      </div>

      {/* ── 1. STANDARD LAYOUTS ────────────────────────────────────────────── */}
      {activeTab === 'standard' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
          gap: '12px'
        }}>
          {STANDARD_LAYOUTS.map((item) => {
            const isSelected = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectLayout(item)}
                style={{
                  background: 'var(--clay-surface)',
                  border: isSelected ? '2px solid var(--clay-coral)' : '2px solid rgba(48, 45, 61, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? 'var(--clay-shadow-coral)' : 'var(--shadow-sm)',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Visual Mini Layout Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${item.rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${item.cols}, 1fr)`,
                  gap: '3px',
                  width: '56px',
                  height: '42px',
                  background: 'var(--clay-surface-warm)',
                  padding: '4px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '1.5px solid rgba(48, 45, 61, 0.05)'
                }}>
                  {Array.from({ length: item.rows * item.cols }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: isSelected ? 'var(--clay-coral)' : 'var(--text-muted)',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: '#fff',
                        opacity: isSelected ? 1 : 0.4
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>

                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? 'var(--clay-coral)' : 'var(--text-heading)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. MORE GRIDS (10 TO 100 PHONES) ───────────────────────────────── */}
      {activeTab === 'more' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Preset Buttons */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Popular Grid Presets (Automatic Balanced Layout)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_LARGE_PRESETS.map((count) => {
                const opt = calculateOptimalGrid(count);
                const isSelected = activeId === opt.id && currentTotal === count;
                return (
                  <button
                    key={count}
                    onClick={() => handleSelectCount(count)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--btn-primary-bg)' : 'var(--nm-surface-light)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: isSelected ? '1px solid transparent' : 'var(--border-subtle)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isSelected ? '0 2px 10px var(--btn-primary-glow)' : 'var(--shadow-sm)'
                    }}
                  >
                    <span>{count}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>({opt.rows}×{opt.cols})</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Range Slider & Number Search Picker */}
          <div style={{
            background: 'var(--nm-surface-light)',
            border: 'var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                  Smart Grid Generator: {phoneCountInput} Phones
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Arrangement: {calculateOptimalGrid(phoneCountInput).rows} rows × {calculateOptimalGrid(phoneCountInput).cols} columns = {calculateOptimalGrid(phoneCountInput).total} screen slots
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Select:</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={phoneCountInput}
                  onChange={(e) => handleSelectCount(e.target.value)}
                  style={{
                    width: '70px',
                    padding: '6px 10px',
                    background: 'var(--input-bg)',
                    border: 'var(--border-input)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--input-text)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
                <button
                  onClick={() => handleSelectCount(phoneCountInput)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Apply
                </button>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={phoneCountInput}
              onChange={(e) => handleSelectCount(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Full 10 to 100 Phone Grid Pill Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All Phone Numbers (10 to 100)
              </div>
              <button
                onClick={() => setShowAllPills(!showAllPills)}
                style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {showAllPills ? <>Show Fewer <ChevronUp size={14} /></> : <>Expand All 10–100 <ChevronDown size={14} /></>}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))',
              gap: '6px',
              maxHeight: showAllPills ? '320px' : '90px',
              overflowY: 'auto',
              padding: '6px',
              background: 'var(--nm-surface-dark)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-subtle)',
              transition: 'max-height 0.3s ease'
            }}>
              {Array.from({ length: 91 }, (_, i) => i + 10).map((n) => {
                const opt = calculateOptimalGrid(n);
                const isSelected = activeId === opt.id && currentTotal === opt.total;
                return (
                  <button
                    key={n}
                    onClick={() => handleSelectCount(n)}
                    style={{
                      height: '34px',
                      borderRadius: '6px',
                      background: isSelected ? 'var(--accent-primary)' : 'var(--nm-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: isSelected ? 'none' : 'var(--border-subtle)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CUSTOM GRID CONFIGURATION ───────────────────────────────────── */}
      {activeTab === 'custom' && (
        <form onSubmit={handleApplyCustom} style={{
          background: 'var(--nm-surface-light)',
          border: 'var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Set custom rows and columns up to 100 total screens (e.g. 7×7, 8×10, 10×10).
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-label)', marginBottom: '6px' }}>
                Rows (1 – 10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={customRows}
                onChange={(e) => setCustomRows(e.target.value)}
                className="input-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-label)', marginBottom: '6px' }}>
                Columns (1 – 10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={customCols}
                onChange={(e) => setCustomCols(e.target.value)}
                className="input-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-label)', marginBottom: '6px' }}>
                Total Phones
              </label>
              <div style={{
                padding: '10px 14px',
                background: 'var(--input-bg)',
                border: 'var(--border-input)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: (customRows * customCols > 100) ? 'var(--accent-rose)' : 'var(--accent-primary)'
              }}>
                {customRows * customCols} Screens {(customRows * customCols > 100) && '(Max 100)'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={customRows * customCols > 100 || customRows * customCols < 1}
              className="btn-primary"
            >
              <Check size={16} /> Apply Custom {customRows}×{customCols} Grid
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
