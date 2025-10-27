import { useEffect, useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [detectedLocation, setDetectedLocation] = useState({
    city: 'Unknown',
    country: 'Unknown',
    lat: 0,
    lon: 0
  });

  const [manualLocation, setManualLocation] = useState({
    lat: '',
    lon: '',
    city: ''
  });

  const loadLocationData = async () => {
    if (!window.electronAPI) return;

    try {
      const location = await window.electronAPI.location.get();
      if (location.success) {
        setDetectedLocation({
          city: location.city || 'Unknown',
          country: location.country || 'Unknown',
          lat: location.lat || 0,
          lon: location.lon || 0
        });
      }

      const manual = localStorage.getItem('manualLocation');
      if (manual) {
        const data = JSON.parse(manual);
        setManualLocation({
          lat: data.lat,
          lon: data.lon,
          city: data.city
        });
      } else {
        // Load from config
        if (window.electronAPI?.config?.get) {
          const result = await window.electronAPI.config.get();
          if (result.success && result.config) {
            setManualLocation({
              lat: result.config.latitude,
              lon: result.config.longitude,
              city: result.config.city || ''
            });
          }
        }
      }
    } catch (error) {
      console.error('[ERROR] Failed to load location data:', error);
    }
  };

  const handleSave = async () => {
    if (manualLocation.lat && manualLocation.lon && manualLocation.city) {
      try {
        // Save to config.txt via IPC
        if (window.electronAPI?.config?.set) {
          const result = await window.electronAPI.config.set({
            latitude: manualLocation.lat,
            longitude: manualLocation.lon,
            city: manualLocation.city,
            country: detectedLocation.country || 'Brazil'
          });
          
          if (result.success) {
            console.log('[SETTINGS] ✅ Location saved to config.txt');
            // Also save to localStorage for immediate use
            localStorage.setItem('manualLocation', JSON.stringify({
              lat: manualLocation.lat,
              lon: manualLocation.lon,
              city: manualLocation.city,
              country: detectedLocation.country || 'Brazil'
            }));
            onSave();
            onClose();
          } else {
            alert('Failed to save configuration');
          }
        }
      } catch (error) {
        console.error('[SETTINGS] Error saving location:', error);
        alert('Error saving configuration');
      }
    } else {
      alert('Please fill all fields');
    }
  };

  const handleReset = async () => {
    try {
      // First, get fresh auto-detected location
      const location = await window.electronAPI.location.get();
      
      if (location.success && window.electronAPI?.config?.set) {
        const result = await window.electronAPI.config.set({
          latitude: String(location.lat),
          longitude: String(location.lon),
          city: location.city || 'Unknown',
          country: location.country || 'Unknown'
        });
        
        if (result.success) {
          console.log('[SETTINGS] ✅ Reset to auto location:', location);
          localStorage.removeItem('manualLocation');
          setManualLocation({ lat: '', lon: '', city: '' });
          onSave();
          onClose();
        } else {
          alert('Failed to reset configuration');
        }
      }
    } catch (error) {
      console.error('[SETTINGS] Error resetting location:', error);
      alert('Error resetting location');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLocationData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>SETTINGS</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="settings-section">
            <h3>Auto-Detected Location</h3>
            <div className="location-info">
              <p><strong>City:</strong> {detectedLocation.city}</p>
              <p><strong>Country:</strong> {detectedLocation.country}</p>
              <p><strong>Latitude:</strong> {detectedLocation.lat.toFixed(4)}</p>
              <p><strong>Longitude:</strong> {detectedLocation.lon.toFixed(4)}</p>
            </div>
          </div>

          <div className="settings-section">
            <h3>Manual Location Override</h3>
            <div className="form-group">
              <label>Latitude:</label>
              <input
                type="text"
                value={manualLocation.lat}
                onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
                placeholder="-15.8288597"
              />
            </div>
            <div className="form-group">
              <label>Longitude:</label>
              <input
                type="text"
                value={manualLocation.lon}
                onChange={(e) => setManualLocation({ ...manualLocation, lon: e.target.value })}
                placeholder="-48.1306207"
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                value={manualLocation.city}
                onChange={(e) => setManualLocation({ ...manualLocation, city: e.target.value })}
                placeholder="Ceilândia"
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>Save Location</button>
          <button className="btn btn-secondary" onClick={handleReset}>Reset to Auto</button>
        </div>
      </div>
    </div>
  );
}
