import React, { useState } from 'react';
import { Layers, ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { createSession } from '../services/api';

const LAYOUTS = [
  { id: '1x2', name: '1 × 2', rows: 1, cols: 2, desc: '2 Phones Side-by-Side' },
  { id: '2x2', name: '2 × 2', rows: 2, cols: 2, desc: '4 Phones Quad Wall (Recommended)' },
  { id: '2x3', name: '2 × 3', rows: 2, cols: 3, desc: '6 Phones Wide Display' },
  { id: '3x3', name: '3 × 3', rows: 3, cols: 3, desc: '9 Phones Mega Screen' },
  { id: '1x1', name: '1 × 1', rows: 1, cols: 1, desc: '1 Phone Test Mode' }
];

export default function CreateSession({ onNavigate, onCreated }) {
  const [selectedLayout, setSelectedLayout] = useState('2x2');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await createSession({
        layoutId: selectedLayout
      });

      if (res?.success && res.session) {
        if (onCreated) {
          onCreated(res.session);
        } else {
          onNavigate('master', { sessionId: res.session.id });
        }
      } else {
        setError(res?.message || 'Could not create session');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error creating session');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <button
        onClick={() => onNavigate('home')}
        className="btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: '#a5b4fc',
            marginBottom: '12px'
          }}>
            <Sparkles size={16} /> Step 1: Session Setup
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>
            Create MultiScreen Session
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Choose your desired smartphone screen layout. You can also adjust this later in the dashboard.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Layout Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}>
          {LAYOUTS.map(layout => {
            const isSelected = selectedLayout === layout.id;
            return (
              <div
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 0 25px rgba(99, 102, 241, 0.35)' : 'none',
                  transform: isSelected ? 'scale(1.03)' : 'none'
                }}
              >
                {/* Visual Grid Representation */}
                <div style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                  gap: '4px',
                  width: '80px',
                  height: '56px',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '6px',
                  borderRadius: '8px',
                  marginBottom: '14px'
                }}>
                  {Array.from({ length: layout.rows * layout.cols }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.2)',
                        borderRadius: '3px'
                      }}
                    />
                  ))}
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: isSelected ? '#fff' : '#cbd5e1' }}>
                  {layout.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: isSelected ? '#a5b4fc' : 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
                  {layout.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="btn-primary"
            style={{ padding: '16px 48px', fontSize: '1.1rem' }}
          >
            {isCreating ? 'Creating Session...' : <>Launch Master Dashboard <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
