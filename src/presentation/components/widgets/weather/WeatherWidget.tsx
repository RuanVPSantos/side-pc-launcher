import { useEffect, useState } from 'react';

interface ForecastDay {
  day: string;
  icon: string;
  minTemp: number;
  maxTemp: number;
}

interface WeatherData {
  location: string;
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  status: string;
  forecast: ForecastDay[];
}

interface WeatherWidgetProps {
  onUpdate?: () => void;
}

export function WeatherWidget({ onUpdate }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData>({
    location: 'LOADING...',
    currentTemp: 0,
    minTemp: 0,
    maxTemp: 0,
    status: 'LOADING...',
    forecast: []
  });

  const getWeatherIcon = (condition: string): string => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return '☀️';
    } else if (conditionLower.includes('partly cloudy') || conditionLower.includes('partly')) {
      return '⛅';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
      return '☁️';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return '🌧️';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return '⛈️';
    } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
      return '❄️';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return '🌫️';
    } else if (conditionLower.includes('wind')) {
      return '💨';
    }

    return '🌡️';
  };

  const getLocation = async () => {
    const manual = localStorage.getItem('manualLocation');
    if (manual) {
      return JSON.parse(manual);
    }

    if (window.electronAPI?.config?.get) {
      try {
        const result = await window.electronAPI.config.get();
        if (result.success && result.config) {
          return {
            lat: result.config.latitude,
            lon: result.config.longitude,
            city: result.config.city || 'Ceilândia',
            country: result.config.country || 'Brazil'
          };
        }
      } catch (error) {
        console.error('[ERROR] Failed to get location from config.txt:', error);
      }
    }

    return {
      lat: '-15.8288597',
      lon: '-48.1306207',
      city: 'Ceilândia',
      country: 'Brazil'
    };
  };

  const updateWeather = async () => {
    try {
      const loc = await getLocation();

      // Usando Open-Meteo API - completamente gratuita, sem chave necessária
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&current=temperature_2m,weather_code&timezone=America/Sao_Paulo&forecast_days=7`;

      const response = await fetch(url);
      const result = await response.json();

      if (result && result.daily) {
        const current = result.current;
        const daily = result.daily;
        const cityName = loc.city || 'Unknown';
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

        // Mapear códigos de clima da Open-Meteo para condições legíveis
        const getWeatherCondition = (code: number): string => {
          if (code === 0) return 'Clear sky';
          if (code <= 3) return 'Partly cloudy';
          if (code <= 48) return 'Fog';
          if (code <= 67) return 'Rain';
          if (code <= 77) return 'Snow';
          if (code <= 82) return 'Rain showers';
          if (code <= 86) return 'Snow showers';
          if (code <= 99) return 'Thunderstorm';
          return 'Unknown';
        };

        const forecastData = daily.time.slice(1, 8).map((dateStr: string, index: number) => {
          const date = new Date(dateStr);
          const dayName = days[date.getDay()];
          const condition = getWeatherCondition(daily.weather_code[index + 1]);
          const icon = getWeatherIcon(condition);

          return {
            day: dayName,
            icon: icon,
            minTemp: Math.round(daily.temperature_2m_min[index + 1]),
            maxTemp: Math.round(daily.temperature_2m_max[index + 1])
          };
        });

        const currentCondition = getWeatherCondition(current.weather_code);

        setData({
          location: cityName.toUpperCase(),
          currentTemp: Math.round(current.temperature_2m),
          minTemp: Math.round(daily.temperature_2m_min[0]),
          maxTemp: Math.round(daily.temperature_2m_max[0]),
          status: currentCondition.toUpperCase(),
          forecast: forecastData
        });

        onUpdate?.();
      }
    } catch (error) {
      console.error('[ERROR] Failed to update weather:', error);

      // Fallback para dados mock se a API falhar
      const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
      const mockForecast = Array.from({ length: 7 }, (_, i) => ({
        day: days[(new Date().getDay() + i + 1) % 7], // +1 para começar do próximo dia
        icon: ['☀️', '⛅', '🌧️', '☁️', '⛈️', '🌤️', '🌦️'][i],
        minTemp: 18 + Math.floor(Math.random() * 5),
        maxTemp: 25 + Math.floor(Math.random() * 8)
      }));

      setData({
        location: 'CEILÂNDIA',
        currentTemp: 23,
        minTemp: 18,
        maxTemp: 28,
        status: 'ENSOLARADO',
        forecast: mockForecast
      });
    }
  };

  useEffect(() => {
    updateWeather();
    const interval = setInterval(updateWeather, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget weather-widget">
      <div className="widget-title">WEATHER - {data.location}</div>
      <div className="weather-current">
        <div className="temp-item temp-min">
          <div className="temp-label">MIN</div>
          <div className="temp-value">{data.minTemp}°</div>
        </div>
        <div className="temp-item temp-current">
          <div className="temp-label">NOW</div>
          <div className="temp-value">{data.currentTemp}°</div>
        </div>
        <div className="temp-item temp-max">
          <div className="temp-label">MAX</div>
          <div className="temp-value">{data.maxTemp}°</div>
        </div>
      </div>
      <div className="weather-status">{data.status}</div>
      <div className="forecast-table">
        {data.forecast.map((day, index) => (
          <div key={index} className="forecast-row">
            <span>{day.day}</span>
            <span>{day.icon}</span>
            <span>{day.minTemp}°</span>
            <span>{day.maxTemp}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
