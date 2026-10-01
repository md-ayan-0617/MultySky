import React, { useRef, useEffect } from 'react';

export default function CanvasDisplay({
  media,
  row = 0,
  col = 0,
  totalRows = 2,
  totalCols = 2,
  bezel = {},
  isPlaying = false,
  currentTime = 0,
  onLoadedMetadata
}) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const animFrameRef = useRef(null);

  const isVideo = media?.type === 'video';

  // Calculate crop rectangle with bezel gap compensation
  const renderFrame = (source) => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const sourceW = source.videoWidth || source.naturalWidth || source.width || 1920;
    const sourceH = source.videoHeight || source.naturalHeight || source.height || 1080;

    // Bezel gap adjustment percentages
    const gapXPct = (bezel?.gapX || 0) / 100;
    const gapYPct = (bezel?.gapY || 0) / 100;
    const scaleFactor = Math.max(0.2, (bezel?.scale || 100) / 100);
    const offX = bezel?.offsetX || 0;
    const offY = bezel?.offsetY || 0;

    // Calculate crop coordinates based on technical architecture formula
    // Base width & height per cell
    const cols = Math.max(1, totalCols);
    const rows = Math.max(1, totalRows);
    const baseW = sourceW / cols;
    const baseH = sourceH / rows;

    // Apply scale / zoom factor to crop window
    let cropW = Math.min(sourceW, baseW / scaleFactor);
    let cropH = Math.min(sourceH, baseH / scaleFactor);

    // Center scaled crop inside the cell
    let cropX = (col / cols) * sourceW + (baseW - cropW) / 2;
    let cropY = (row / rows) * sourceH + (baseH - cropH) / 2;

    // Apply bezel compensation: shift inner crop to compensate for physical phone borders
    const bezelShiftX = baseW * gapXPct * (col - (cols - 1) / 2);
    const bezelShiftY = baseH * gapYPct * (row - (rows - 1) / 2);

    const maxCropX = Math.max(0, sourceW - cropW);
    const maxCropY = Math.max(0, sourceH - cropH);
    cropX = Math.max(0, Math.min(maxCropX, cropX + bezelShiftX + offX));
    cropY = Math.max(0, Math.min(maxCropY, cropY + bezelShiftY + offY));

    // Clear and draw the cropped region onto canvas to fit display
    ctx.drawImage(
      source,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  // Video render loop
  useEffect(() => {
    if (!isVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;
      if (video.readyState >= 2) {
        renderFrame(video);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVideo, row, col, totalRows, totalCols, bezel]);

  // Sync video play/pause and currentTime to master commands
  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // Correct drift if more than 0.5s off
      if (typeof currentTime === 'number' && Math.abs(video.currentTime - currentTime) > 0.5) {
        video.currentTime = currentTime;
      }
      video.play().catch(err => {
        // Autoplay policy — will play on next user interaction
        console.log('[CanvasDisplay] Autoplay blocked, waiting for user gesture:', err.message);
      });
    } else {
      video.pause();
      if (typeof currentTime === 'number' && Math.abs(video.currentTime - currentTime) > 0.5) {
        video.currentTime = currentTime;
      }
    }
  }, [isPlaying, currentTime, isVideo]);

  // Image load & render
  useEffect(() => {
    if (isVideo || !media?.url) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = media.url;
    img.onload = () => {
      imageRef.current = img;
      renderFrame(img);
      if (onLoadedMetadata) {
        onLoadedMetadata({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      }
    };
  }, [isVideo, media?.url, row, col, totalRows, totalCols, bezel]);

  // Window resize observer to keep canvas full pixel resolution
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = Math.max(rect.width || canvas.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 300) || 300, 1);
      const H = Math.max(rect.height || canvas.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 200) || 200, 1);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);

      if (!isVideo && imageRef.current) {
        renderFrame(imageRef.current);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVideo]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      {/* Hidden video element used as source */}
      {isVideo && (
        <video
          ref={videoRef}
          src={media.url}
          playsInline
          muted // Muted on display screen so all screens don't echo sound simultaneously!
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            if (onLoadedMetadata && videoRef.current) {
              onLoadedMetadata({
                duration: videoRef.current.duration,
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight
              });
            }
          }}
          style={{ display: 'none' }}
        />
      )}

      {/* High performance 60fps HTML5 Canvas display */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}
