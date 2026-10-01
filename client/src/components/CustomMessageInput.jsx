import React, { useState, useEffect } from 'react';
import { Type, Send, Sparkles, RefreshCw } from 'lucide-react';

export default function CustomMessageInput({ currentText = 'MULTISCREEN CYBER MATRIX', onUpdateText }) {
  const [inputVal, setInputVal] = useState(currentText);

  useEffect(() => {
    setInputVal(currentText);
  }, [currentText]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputVal.trim()) {
      onUpdateText(inputVal.trim());
    }
  };

  const handlePreset = (preset) => {
    setInputVal(preset);
    onUpdateText(preset);
  };

  return (
    <div className="custom-message-card">
      <div className="custom-message-header">
        <div className="message-header-left">
          <div className="message-icon-box">
            <Type size={16} />
          </div>
          <div>
            <h4 className="message-card-title">Display Message</h4>
            <p className="message-card-sub">Stream your custom animated text live across all screens</p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="message-presets-wrap">
          {['PARTY TIME', 'WELCOME ALL', 'MULTISCREEN'].map((txt) => (
            <button
              key={txt}
              type="button"
              onClick={() => handlePreset(txt)}
              className="message-preset-chip"
            >
              {txt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="custom-message-form">
        <div className="message-input-wrapper">
          <input
            type="text"
            maxLength={48}
            placeholder="Enter your custom message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="custom-text-input"
          />
          <button
            type="submit"
            className="message-send-btn btn-primary"
            aria-label="Broadcast text"
          >
            <Send size={15} />
            <span>Broadcast</span>
          </button>
        </div>
      </form>

      {/* Live Animated Text Preview Strip */}
      <div className="message-preview-strip">
        <div className="preview-ticker-track">
          <span className="preview-animated-text">
            ✦ {inputVal.toUpperCase() || 'ENTER MESSAGE'} ✦ {inputVal.toUpperCase() || 'ENTER MESSAGE'} ✦
          </span>
        </div>
      </div>
    </div>
  );
}
