import { useState } from 'react';
import { Header, SettingsModal } from '../../components/common';
import { WeatherWidget } from '../../components/widgets/weather';
import { MusicWidget } from '../../components/widgets/music';
import { ShortcutsWidget, MapWidget, MatrixWidget, NotificationWidget } from '../../components/widgets';
import { ScheduleWidget } from '../../components/widgets/schedule';

interface HomePageProps {
    refreshKey: number;
    onRefresh: () => void;
}

export function HomePage({ refreshKey, onRefresh }: HomePageProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleSettingsOpen = () => {
        setIsSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    const handleSettingsSave = () => {
        onRefresh();
    };

    return (
        <div className="home-page">
            <Header onSettingsClick={handleSettingsOpen} />

            <div className="grid-container" id="widgetsContainer">
                <ShortcutsWidget />
                <MusicWidget />
                <WeatherWidget key={`weather-${refreshKey}`} />
                <ScheduleWidget />
                <NotificationWidget />
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