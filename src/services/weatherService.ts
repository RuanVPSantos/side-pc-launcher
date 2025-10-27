import type { WeatherData } from '../data/models/types';

export interface CreateWeatherData {
    location: string;
    temperature: number;
    humidity: number;
    condition: string;
    icon?: string;
}

class WeatherService {
    // Salvar dados meteorológicos
    async saveWeatherData(data: CreateWeatherData): Promise<WeatherData> {
        console.log('Saving weather data:', data);
        return {
            id: Date.now(),
            location: data.location,
            temperature: data.temperature,
            humidity: data.humidity,
            condition: data.condition,
            icon: data.icon,
            timestamp: new Date()
        };
    }

    // Buscar dados meteorológicos mais recentes por localização
    async getLatestWeatherByLocation(location: string): Promise<WeatherData | null> {
        console.log(`Getting latest weather for: ${location}`);
        return {
            id: 1,
            location,
            temperature: 25,
            humidity: 60,
            condition: 'Ensolarado',
            icon: 'sunny',
            timestamp: new Date()
        };
    }

    // Buscar histórico meteorológico
    async getWeatherHistory(location: string, limit: number = 24): Promise<WeatherData[]> {
        console.log(`Getting weather history for: ${location}, limit: ${limit}`);
        return [];
    }

    // Buscar dados meteorológicos em um período
    async getWeatherInRange(
        location: string,
        startDate: Date,
        endDate: Date
    ): Promise<WeatherData[]> {
        console.log(`Getting weather for: ${location} from ${startDate} to ${endDate}`);
        return [];
    }

    // Limpar dados meteorológicos antigos
    async cleanOldWeatherData(daysOld: number = 30): Promise<number> {
        console.log(`Cleaning weather data older than ${daysOld} days`);
        return 0;
    }

    // Simular dados meteorológicos (para desenvolvimento)
    async simulateWeatherData(location: string = 'São Paulo'): Promise<WeatherData> {
        const conditions = ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado'];
        const icons = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];

        const randomCondition = Math.floor(Math.random() * conditions.length);

        const weatherData = {
            location,
            temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
            humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
            condition: conditions[randomCondition],
            icon: icons[randomCondition]
        };

        return await this.saveWeatherData(weatherData);
    }
}

export const weatherService = new WeatherService();