import { useEffect, useState, useCallback } from 'react';

interface MusicData {
  artist: string;
  track: string;
  album: string;
}

interface MusicWidgetProps {
  onUpdate?: () => void;
}

export function MusicWidget({ onUpdate }: MusicWidgetProps) {
  const [data, setData] = useState<MusicData>({
    artist: 'No artist',
    track: 'No track',
    album: 'No album'
  });

  const [carouselImages] = useState<string[]>([
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.24 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.24 (2).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.24.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (2).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (3).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.26 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.26.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.27.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.28.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.30.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (2).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (3).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.32 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.34 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.34.jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.35 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (1).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (2).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (3).jpeg',
    'carroussel/WhatsApp Image 2025-10-17 at 22.23.36.jpeg'
  ].sort(() => Math.random() - 0.5)); // Shuffle

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState<string>('');

  const loadStaticImage = async (filePath: string): Promise<string> => {
    if (window.electronAPI?.static) {
      try {
        const result = await window.electronAPI.static.get(filePath);
        if (result.success && result.data && result.mimeType) {
          return `data:${result.mimeType};base64,${result.data}`;
        }
      } catch (error) {
        console.error('[CAROUSEL] Error loading image via IPC:', filePath, error);
      }
    }
    return `/${filePath}`;
  };

  const updateCarouselImage = useCallback(async () => {
    if (carouselImages.length > 0) {
      const imagePath = carouselImages[currentImageIndex];
      const src = await loadStaticImage(imagePath);
      setImageSrc(src);
    }
  }, [currentImageIndex, carouselImages]);

  const updateMusicPlayer = async () => {
    if (!window.electronAPI) {
      console.log('[DEBUG] electronAPI not available');
      return;
    }

    try {
      const metadata = await window.electronAPI.player.getMetadata();
      console.log('[DEBUG] Music metadata:', metadata);

      setData({
        artist: metadata.artist || 'No artist',
        track: metadata.title || 'No track',
        album: metadata.album || 'No album'
      });

      onUpdate?.();
    } catch (error) {
      console.error('[ERROR] Failed to update music player:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.player.playPause();
      setTimeout(updateMusicPlayer, 500);
    } catch (error) {
      console.error('[ERROR] Play/Pause failed:', error);
    }
  };

  const handleNext = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.player.next();
      setTimeout(updateMusicPlayer, 500);
    } catch (error) {
      console.error('[ERROR] Next failed:', error);
    }
  };

  const handlePrevious = async () => {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.player.previous();
      setTimeout(updateMusicPlayer, 500);
    } catch (error) {
      console.error('[ERROR] Previous failed:', error);
    }
  };

  useEffect(() => {
    updateMusicPlayer();
    const interval = setInterval(updateMusicPlayer, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateCarouselImage();
  }, [updateCarouselImage]);

  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 10000); // 10 seconds

    return () => clearInterval(carouselInterval);
  }, [carouselImages.length]);

  return (
    <div className="widget music-widget">
      <div className="widget-title">MUSIC PLAYER</div>
      <div className="music-content">
        {carouselImages.length > 0 && (
          <div className="carousel-container">
            <img 
              className="carousel-image" 
              src={imageSrc} 
              alt="Album Art"
              onLoad={() => console.log('[CAROUSEL] ✅ Image loaded')}
              onError={() => console.error('[CAROUSEL] ❌ Image load error')}
            />
          </div>
        )}
        <div className="track-info">
          <div className="artist" title={data.artist}>{data.artist}</div>
          <div className="track-name" title={data.track}>{data.track}</div>
          <div className="album" title={data.album}>{data.album}</div>
        </div>
      </div>
      <div className="music-controls">
        <button className="control-btn" onClick={handlePrevious}>⏮</button>
        <button className="control-btn play-btn" onClick={handlePlayPause}>▶/⏸</button>
        <button className="control-btn" onClick={handleNext}>⏭</button>
      </div>
    </div>
  );
}
