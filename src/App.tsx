import { useState } from 'react';
import { Header } from './components/Header';
import { WeatherWidget } from './components/WeatherWidget';
import { MusicWidget } from './components/MusicWidget';
import { ShortcutsWidget } from './components/ShortcutsWidget';
import { MapWidget } from './components/MapWidget';
import { MatrixWidget } from './components/MatrixWidget';
import { SettingsModal } from './components/SettingsModal';

import './index.css';
import './modal.css';
import './widgets.css';
import './header.css';

export function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = () => {
    // Force refresh of weather and map widgets
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <Header onSettingsClick={handleSettingsOpen} />
      
      <div className="grid-container" id="widgetsContainer">
        <WeatherWidget key={`weather-${refreshKey}`} />
        <MusicWidget />
        <ShortcutsWidget />
        <MapWidget key={`map-${refreshKey}`} />
        <MatrixWidget />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
