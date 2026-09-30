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
    const scaleFactor = (bezel?.scale || 100) / 100;
    const offX = bezel?.offsetX || 0;
    const offY = bezel?.offsetY || 0;

    // Calculate crop coordinates based on technical architecture formula
    // Base width & height per cell
    const baseW = sourceW / totalCols;
    const baseH = sourceH / totalRows;

    // Adjust crop origin and dimensions taking bezel and scale into account
    let cropX = (col / totalCols) * sourceW;
    let cropY = (row / totalRows) * sourceH;
    let cropW = baseW;
    let cropH = baseH;

    // Apply bezel compensation: shrink the inner crop slightly so outer parts bridge across the physical phone border
    const bezelShiftX = baseW * gapXPct * (col - (totalCols - 1) / 2);
    const bezelShiftY = baseH * gapYPct * (row - (totalRows - 1) / 2);

    cropX = Math.max(0, Math.min(sourceW - cropW, cropX + bezelShiftX + offX));
    cropY = Math.max(0, Math.min(sourceH - cropH, cropY + bezelShiftY + offY));

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
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

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
