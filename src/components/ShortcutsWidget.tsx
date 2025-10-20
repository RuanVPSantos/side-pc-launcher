import { useEffect, useState } from 'react';

interface ShortcutItem {
  name: string;
  icon: string;
  label: string;
}

const shortcuts: ShortcutItem[] = [
  { name: 'google', icon: 'google.svg', label: 'GOOGLE' },
  { name: 'youtube', icon: 'youtube.svg', label: 'YOUTUBE' },
  { name: 'whatsapp', icon: 'whatsapp.svg', label: 'WHATSAPP' },
  { name: 'spotify', icon: 'spotify.svg', label: 'SPOTIFY' }
];

export function ShortcutsWidget() {
  const [iconSources, setIconSources] = useState<Record<string, string>>({});

  const loadStaticImage = async (filePath: string): Promise<string> => {
    if (window.electronAPI?.static) {
      try {
        const result = await window.electronAPI.static.get(filePath);
        if (result.success && result.data && result.mimeType) {
          return `data:${result.mimeType};base64,${result.data}`;
        }
      } catch (error) {
        console.error('[SHORTCUTS] Error loading icon:', filePath, error);
      }
    }
    return `/${filePath}`;
  };

  const handleAppOpen = async (appName: string) => {
    if (!window.electronAPI) {
      console.log('[DEBUG] electronAPI not available');
      return;
    }

    console.log('[DEBUG] Opening app:', appName);

    try {
      const result = await window.electronAPI.app.open(appName);
      console.log('[DEBUG] App open result:', result);

      if (!result.success) {
        console.error('[ERROR] Failed to open app:', result.error);
      }
    } catch (error) {
      console.error('[ERROR] Exception opening app:', error);
    }
  };

  useEffect(() => {
    const loadIcons = async () => {
      const sources: Record<string, string> = {};
      for (const shortcut of shortcuts) {
        sources[shortcut.name] = await loadStaticImage(shortcut.icon);
      }
      setIconSources(sources);
    };

    loadIcons();
  }, []);

  return (
    <div className="widget shortcuts-widget">
      <div className="widget-title">QUICK LAUNCH</div>
      <div className="app-shortcuts">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.name}
            className="shortcut-item"
            onClick={() => handleAppOpen(shortcut.name)}
          >
            <img
              src={iconSources[shortcut.name] || ''}
              className="shortcut-icon"
              alt={shortcut.label}
            />
            <span className="shortcut-label">{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
