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
    if (!window.electronAPI) {
      console.log('[DEBUG] electronAPI not available');
      return;
    }

    try {
      const loc = await getLocation();
      const weatherQuery = `${loc.lat},${loc.lon}`;
      console.log('[DEBUG] Weather query:', weatherQuery);

      const result = await window.electronAPI.weather.getData(weatherQuery);
      console.log('[DEBUG] Weather result:', result);

      if (result.success && result.data) {
        const current = result.data.current_condition[0];
        const forecast = result.data.weather;
        const location = result.data.nearest_area[0];

        const cityName = loc.city || (location ? location.areaName[0].value : 'Unknown');
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validForecast = forecast.filter((day: any) => {
          const forecastDate = new Date(day.date);
          forecastDate.setHours(0, 0, 0, 0);
          return forecastDate >= today;
        });

        const forecastData = validForecast.slice(0, 5).map((day: any) => {
          const date = new Date(day.date);
          const dayName = days[date.getDay()];
          const weatherCondition = day.hourly[0]?.weatherDesc[0]?.value || day.weatherDesc[0]?.value || 'Clear';
          const icon = getWeatherIcon(weatherCondition);

          return {
            day: dayName,
            icon: icon,
            minTemp: parseInt(day.mintempC),
            maxTemp: parseInt(day.maxtempC)
          };
        });

        setData({
          location: cityName.toUpperCase(),
          currentTemp: parseInt(current.temp_C),
          minTemp: parseInt(forecast[0].mintempC),
          maxTemp: parseInt(forecast[0].maxtempC),
          status: current.weatherDesc[0].value.toUpperCase(),
          forecast: forecastData
        });

        onUpdate?.();
      }
    } catch (error) {
      console.error('[ERROR] Failed to update weather:', error);
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
