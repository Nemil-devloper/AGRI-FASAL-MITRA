import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ClimatePrediction.css';
import clearImage from '../assets/clear.jpg';
import rainImage from '../assets/rain.jpg';
import cloudsImage from '../assets/clouds.jpg';
import snowImage from '../assets/snow.jpg';
import thunderstormImage from '../assets/thunderstorm.jpg';
import smokeImage from '../assets/smoke.jpg';
import mistImage from '../assets/mist.jpg';
import hazeImage from '../assets/haze.jpg';

const ClimatePrediction = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError('Unable to retrieve your location.');
          console.error(error);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: `${lat},${lon}`,
          days: 7,  // Increased to 7 days
          aqi: 'no'
        }
      });

      setCurrentWeather({
        name: response.data.location.name,
        sys: { country: response.data.location.country },
        main: {
          temp: response.data.current.temp_c,
          humidity: response.data.current.humidity,
          pressure: response.data.current.pressure_mb
        },
        wind: { speed: response.data.current.wind_kph / 3.6 }, // Convert km/h to m/s
        weather: [{
          main: response.data.current.condition.text,
          description: response.data.current.condition.text
        }]
      });

      // Get full forecast data
      setForecastData(
        response.data.forecast.forecastday.map(day => ({
          dt_txt: day.date,
          main: {
            temp: day.day.avgtemp_c,
            humidity: day.day.avghumidity
          },
          weather: [{
            main: day.day.condition.text,
            description: day.day.condition.text
          }]
        }))
      );
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/forecast.json`, {
        params: {
          key: API_KEY,
          q: city,
          days: 7, // Also set to 7 days for city search
          aqi: 'no'
        }
      });

      // Use the same data structure as above
      setCurrentWeather({
        name: response.data.location.name,
        sys: { country: response.data.location.country },
        main: {
          temp: response.data.current.temp_c,
          humidity: response.data.current.humidity,
          pressure: response.data.current.pressure_mb
        },
        wind: { speed: response.data.current.wind_kph / 3.6 },
        weather: [{
          main: response.data.current.condition.text,
          description: response.data.current.condition.text
        }]
      });

      setForecastData(
        response.data.forecast.forecastday.map(day => ({
          dt_txt: day.date,
          main: {
            temp: day.day.avgtemp_c,
            humidity: day.day.avghumidity
          },
          weather: [{
            main: day.day.condition.text,
            description: day.day.condition.text
          }]
        }))
      );
    } catch (err) {
      setError('City not found. Please enter a valid city name.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      fetchWeatherByCity(searchQuery);
      setSearchQuery('');
    }
  };

  const getWeatherImage = (condition) => {
    // Convert to lowercase for case-insensitive comparison
    const weather = condition.toLowerCase();
    
    // More specific matching for weather conditions
    switch (true) {
      case weather.includes('rain') || weather.includes('drizzle'):
        return rainImage;
      case weather.includes('cloud') || weather.includes('overcast'):
        return cloudsImage;
      case weather.includes('snow') || weather.includes('sleet'):
        return snowImage;
      case weather.includes('thunder') || weather.includes('storm'):
        return thunderstormImage;
      case weather.includes('smoke'):
        return smokeImage;
      case weather.includes('mist'):
        return mistImage;
      case weather.includes('haze') || weather.includes('fog'):
        return hazeImage;
      case weather.includes('clear') || weather.includes('sunny'):
        return clearImage;
      default:
        return clearImage; // Default background
    }
  };

  const generatePrediction = (weather) => {
    if (!weather) return "Weather data not available.";
    const { main, description } = weather.weather[0];

    if (main === 'Rain') {
      return "It's likely to rain. Avoid irrigation and protect crops.";
    } else if (main === 'Clear') {
      return "Weather is clear. Ideal for outdoor farming activities.";
    } else if (main === 'Thunderstorm') {
      return "Severe thunderstorm expected. Take safety precautions.";
    } else if (main === 'Snow') {
      return "Snowfall predicted. Ensure crop protection.";
    } else if (main === 'Mist' || main === 'Haze') {
      return "Low visibility due to mist/haze. Monitor closely.";
    } else {
      return `Current weather is ${description}. Proceed with caution.`;
    }
  };

  const weatherImage = currentWeather ? getWeatherImage(currentWeather.weather[0].main) : null;

  return (
    <div
      className="climate-prediction-page"
      style={{
        background: weatherImage 
          ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${weatherImage})`
          : 'linear-gradient(to right, #2c5364, #203a43, #0f2027)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="weather-header">
        <h1>Climate Prediction Dashboard</h1>
        <p>Accurate and real-time weather updates for your location or any city</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter city name..."
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading && <p className="loading">Fetching weather data...</p>}
      {error && <p className="error">{error}</p>}

      <div className="weather-content">
        <div className="left-section">
          {currentWeather && (
            <div className="current-weather-section">
              <h2>Today, {currentWeather.name}, {currentWeather.sys.country}</h2>
              <div className="current-weather-info">
                <div>
                  <h1>{currentWeather.main.temp}°C</h1>
                  <p>{currentWeather.weather[0].description}</p>
                  <p>Humidity: {currentWeather.main.humidity}%</p>
                  <p>Wind Speed: {currentWeather.wind.speed} m/s</p>
                  <p>Pressure: {currentWeather.main.pressure} hPa</p>
                </div>
              </div>
              <div className="prediction-section">
                <h2>Prediction & Recommendation</h2>
                <p>{generatePrediction(currentWeather)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="right-section">
          {forecastData.length > 0 && (
            <div className="forecast-section">
              <h2>3-Day Weather Forecast</h2>
              <div className="forecast-grid">
                {forecastData.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p className="day">
                      {index === 0 ? 'Today' : new Date(day.dt_txt).toLocaleDateString('en-US', {
                        weekday: 'long',
                      })}
                    </p>
                    <div className="weather-details">
                      <p>{day.main.temp}°C</p>
                      <p>{day.weather[0].description}</p>
                      <p>Humidity: {day.main.humidity}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimatePrediction;
