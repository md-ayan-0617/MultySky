import React, { useRef, useEffect, useCallback } from 'react';

/**
 * CyberWave — Neon Cyber Pulse Wave Matrix
 * Renders a seamless scrolling neon wave across the virtual multi-screen wall.
 * Each device renders only its own cropped slice of the global canvas.
 */
export default function CyberWave({
  row = 0,
  col = 0,
  totalRows = 2,
  totalCols = 2,
  bezel = {},
  interactiveState = {},
  onTriggerAction,
  isSimulator = false
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const ripplesRef = useRef([]);

  const {
    waveColor = '#00ffff',
    waveSpeed = 1.0,
    glitchActive = false,
    ripples = []
  } = interactiveState;

  // Sync ripples from interactiveState into local ref for animation loop
  useEffect(() => {
    ripplesRef.current = ripples.map(r => ({ ...r }));
  }, [ripples]);

  // Hex color to rgb array helper
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 255, 255];
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isRunning = true;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const W = Math.max(1, Math.floor(rect.width || canvas.clientWidth || window.innerWidth || 300));
      const H = Math.max(1, Math.floor(rect.height || canvas.clientHeight || window.innerHeight || 200));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { W, H };
    };

    let dims = setupCanvas();

    const handleResize = () => {
      dims = setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    const drawFrame = (timestamp) => {
      if (!isRunning) return;
      if (!dims || dims.W <= 1 || dims.H <= 1) {
        dims = setupCanvas();
      }
      const { W, H } = dims;
      if (W <= 1 || H <= 1) {
        animRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const t = timestamp / 1000;
      const speed = Math.max(0.1, waveSpeed);
      const [r, g, b] = hexToRgb(waveColor);

      // Bezel-aware offset into global virtual canvas
      const gapX = (bezel?.gapX || 0) / 100;
      const gapY = (bezel?.gapY || 0) / 100;
      const offsetX = col * W * (1 + gapX);
      const offsetY = row * H * (1 + gapY);
      const GLOBAL_W = Math.max(100, W * Math.max(1, totalCols) * (1 + gapX));
      const GLOBAL_H = Math.max(100, H * Math.max(1, totalRows) * (1 + gapY));

      // ── Background ──────────────────────────────────────────────────────────
      ctx.fillStyle = '#000510';
      ctx.fillRect(0, 0, W, H);

      // Scanline grid (subtle cyber grid)
      ctx.lineWidth = 0.5;
      const gridSize = Math.max(25, Math.floor(W / 12));
      ctx.strokeStyle = `rgba(${r},${g},${b},0.05)`;
      for (let gx = -(offsetX % gridSize); gx <= W + gridSize; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = -(offsetY % gridSize); gy <= H + gridSize; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // ── Multi-layer neon wave bands ──────────────────────────────────────────
      const NUM_WAVES = 6;
      for (let wi = 0; wi < NUM_WAVES; wi++) {
        const phase = (wi / NUM_WAVES) * Math.PI * 2;
        const amplitude = H * (0.07 + wi * 0.022);
        const frequency = 0.0025 + wi * 0.0008;
        const waveOffsetY = H * (0.12 + (wi / NUM_WAVES) * 0.76);
        const scrollOffset = (t * speed * (70 + wi * 25)) % GLOBAL_W;
        const alpha = 0.12 + (NUM_WAVES - wi) * 0.075;
        const lineWidth = 1.2 + (NUM_WAVES - wi) * 0.5;

        const gradient = ctx.createLinearGradient(0, 0, W, 0);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(0.25, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(0.75, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = gradient;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        ctx.shadowBlur = 6 + wi * 2;

        for (let px = 0; px <= W; px += 2) {
          const globalX = px + offsetX + scrollOffset;
          const y = waveOffsetY
            + Math.sin(globalX * frequency + phase) * amplitude
            + Math.sin(globalX * frequency * 2.1 - phase * 0.6) * (amplitude * 0.28);
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // ── Vertical neon data streams ───────────────────────────────────────────
      const STREAM_SPACING = Math.max(50, Math.floor(W / 10));
      const numStreams = Math.ceil(W / STREAM_SPACING) + 2;
      for (let si = 0; si < numStreams; si++) {
        const baseX = si * STREAM_SPACING - (offsetX * 0.4 % STREAM_SPACING);
        const streamX = ((baseX % W) + W) % W;
        const streamPhase = (Math.floor(offsetX / STREAM_SPACING) + si) * 1.618;
        const streamT = ((t * speed * 0.6 + streamPhase) % 1 + 1) % 1;
        const streamY = streamT * (H * 1.3) - H * 0.15;
        const streamLen = H * 0.18;

        const sg = ctx.createLinearGradient(0, streamY - streamLen, 0, streamY);
        sg.addColorStop(0, `rgba(${r},${g},${b},0)`);
        sg.addColorStop(0.6, `rgba(${r},${g},${b},0.3)`);
        sg.addColorStop(1, `rgba(${r},${g},${b},0.7)`);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(streamX, streamY - streamLen);
        ctx.lineTo(streamX, streamY);
        ctx.stroke();
      }

      // ── Touch Ripples ────────────────────────────────────────────────────────
      const now = Date.now();
      ripplesRef.current = ripplesRef.current.filter(rp => (now - rp.t) < 2500);
      ripplesRef.current.forEach(rp => {
        const elapsed = (now - rp.t) / 1000;
        const maxRadius = Math.sqrt(W * W + H * H) * 0.7;
        const alpha = Math.max(0, 1 - elapsed * 0.4);
        // Convert global ripple coords to local screen coordinates
        const localX = rp.globalX - offsetX;
        const localY = rp.globalY - offsetY;

        for (let ring = 0; ring < 3; ring++) {
          const radius = (elapsed * maxRadius * 0.55) * (1 - ring * 0.12);
          if (radius <= 0) continue;
          ctx.beginPath();
          ctx.arc(localX, localY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * (0.7 - ring * 0.2)})`;
          ctx.lineWidth = (2 - ring * 0.5);
          ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.5})`;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      });

      // ── Clean Typing Animation for User-Controlled Text (Requirement 3) ─────
      const rawText = (interactiveState?.customText && typeof interactiveState.customText === 'string') 
        ? interactiveState.customText.trim() 
        : '';

      if (rawText) {
        ctx.save();
        const baseFontSize = Math.max(16, Math.min(52, interactiveState?.textSize || 32));
        ctx.font = `800 ${baseFontSize}px "Nunito", "Outfit", -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Typing effect: characters appear one by one with a blinking cursor
        const charsCount = rawText.length;
        const typeSpeed = 6; // characters per second
        const holdTime = 2.5; // hold completed text for 2.5s before restarting
        const cycleDuration = (charsCount / typeSpeed) + holdTime;
        const cycleTime = t % cycleDuration;
        const visibleChars = Math.min(charsCount, Math.floor(cycleTime * typeSpeed));
        const typedPart = rawText.substring(0, visibleChars);
        const cursorBlink = Math.floor(t * 2) % 2 === 0;
        const textToDraw = typedPart + (cursorBlink ? '|' : ' ');

        // Centered across the whole display matrix
        const globalCenterX = GLOBAL_W / 2;
        const globalCenterY = GLOBAL_H / 2;
        const localX = globalCenterX - offsetX;
        const localY = globalCenterY - offsetY;

        // Subtle blue glow
        ctx.shadowColor = 'rgba(59, 130, 246, 0.75)';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(textToDraw, localX, localY);

        ctx.restore();
      }

      // ── Glitch Effect ────────────────────────────────────────────────────────
      if (glitchActive && W > 10 && H > 10) {
        const numSlices = Math.floor(Math.random() * 4) + 2;
        for (let si = 0; si < numSlices; si++) {
          const sliceH = Math.max(2, Math.floor(Math.random() * 10 + 2));
          const sliceY = Math.floor(Math.random() * Math.max(1, H - sliceH));
          const shiftX = Math.round((Math.random() - 0.5) * 20);
          try {
            const imageData = ctx.getImageData(0, sliceY, Math.floor(W), sliceH);
            ctx.putImageData(imageData, shiftX, sliceY);
          } catch(e) { /* ignore cross-origin/bounds errors */ }
        }
        // Color fringe
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = `rgba(255, 0, 80, 1)`;
        ctx.fillRect(-3, 0, W, H);
        ctx.fillStyle = `rgba(0, 80, 255, 1)`;
        ctx.fillRect(3, 0, W, H);
        ctx.restore();
      }

      // ── Vignette overlay ─────────────────────────────────────────────────────
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // ── Corner neon brackets (phone display screens only) ────────────────────
      if (!isSimulator) {
        const bLen = 22;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx.shadowBlur = 6;
        [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(([cx, cy, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(cx + dx * bLen, cy);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + dy * bLen);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(drawFrame);
    };

    animRef.current = requestAnimationFrame(drawFrame);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [row, col, totalRows, totalCols, bezel, waveColor, waveSpeed, glitchActive, isSimulator, interactiveState]);

  // Touch / Click → emit CYBER_RIPPLE event
  const handlePointerDown = useCallback((e) => {
    if (!onTriggerAction) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const gapX = (bezel?.gapX || 0) / 100;
    const gapY = (bezel?.gapY || 0) / 100;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const globalX = localX + col * rect.width * (1 + gapX);
    const globalY = localY + row * rect.height * (1 + gapY);

    onTriggerAction('CYBER_RIPPLE', {
      globalX,
      globalY,
      t: Date.now()
    });
  }, [onTriggerAction, row, col, bezel]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000510',
        cursor: isSimulator ? 'default' : 'crosshair',
        touchAction: 'none',
        userSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
