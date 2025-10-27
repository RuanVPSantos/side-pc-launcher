import type { AppSettings } from '../data/models/types';

class SettingsService {
    private settings: Record<string, string> = {};

    // Buscar configuração por chave
    async getSetting(key: string): Promise<string | null> {
        return this.settings[key] || null;
    }

    // Definir configuração
    async setSetting(key: string, value: string): Promise<AppSettings> {
        this.settings[key] = value;
        console.log(`Setting ${key} = ${value}`);
        return {
            id: Date.now(),
            key,
            value,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    // Buscar todas as configurações
    async getAllSettings(): Promise<Record<string, string>> {
        return { ...this.settings };
    }

    // Definir múltiplas configurações
    async setMultipleSettings(settings: Record<string, string>): Promise<void> {
        Object.assign(this.settings, settings);
        console.log('Setting multiple settings:', settings);
    }

    // Deletar configuração
    async deleteSetting(key: string): Promise<void> {
        delete this.settings[key];
        console.log(`Deleted setting: ${key}`);
    }

    // Configurações padrão do sistema
    async initializeDefaultSettings(): Promise<void> {
        const defaultSettings = {
            'theme': 'dark',
            'language': 'pt-BR',
            'weather_location': 'São Paulo',
            'weather_update_interval': '300000', // 5 minutos
            'system_metrics_interval': '5000', // 5 segundos
            'notification_cleanup_days': '30',
            'metrics_cleanup_days': '7',
            'weather_cleanup_days': '30'
        };

        for (const [key, value] of Object.entries(defaultSettings)) {
            const existing = await this.getSetting(key);
            if (!existing) {
                await this.setSetting(key, value);
            }
        }
    }

    // Helpers para configurações específicas
    async getWeatherLocation(): Promise<string> {
        return await this.getSetting('weather_location') || 'São Paulo';
    }

    async setWeatherLocation(location: string): Promise<void> {
        await this.setSetting('weather_location', location);
    }

    async getWeatherUpdateInterval(): Promise<number> {
        const interval = await this.getSetting('weather_update_interval');
        return parseInt(interval || '300000');
    }

    async getSystemMetricsInterval(): Promise<number> {
        const interval = await this.getSetting('system_metrics_interval');
        return parseInt(interval || '5000');
    }
}

export const settingsService = new SettingsService();