import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import '../styles/WaterLevelAndWasteManagementPlanner.css';
import { Chart } from 'chart.js/auto';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  

const WaterLevelAndWasteManagementPlanner = () => {
  const [weather, setWeather] = useState(null);
  const [weeklyWaterUsage, setWeeklyWaterUsage] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(50);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [city, setCity] = useState('');
  const [landArea, setLandArea] = useState(0);
  const [plantType, setPlantType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Base water requirements per square meter per week (in liters)
  const plantWaterRequirements = {
    Tomatoes: 25, // Approx. 25 liters/m²/week
    Lettuce: 20,  // Approx. 20 liters/m²/week
    Cucumbers: 30, // Approx. 30 liters/m²/week
    Potatoes: 35, // Approx. 35 liters/m²/week
    Cabbage: 25,  // Approx. 25 liters/m²/week
    'Drought Resistant': 10, // Approx. 10 liters/m²/week
  };

  const fetchWeather = () => {
    if (!city) {
      alert('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`)
      .then((response) => (response.ok ? response.json() : Promise.reject('Failed to fetch')))
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error.message);
          setWeather(null);
        } else {
          setWeather(data);
          calculateWeeklyWaterUsage(
            data.current.temp_c,
            data.current.humidity,
            data.current.precip_mm,
            data.current.wind_kph,
            soilMoisture
          );
          adjustWasteManagement(data.current.temp_c);
        }
      })
      .catch((error) => {
        setLoading(false);
        setWeather(null);
        setError('Failed to fetch weather data. Please try again.');
        console.error('Error fetching weather:', error);
      });
  };

  const calculateWeeklyWaterUsage = (temperature, humidity, precipitation, windSpeed, soilMoisture) => {
    let baseWaterUsage = plantWaterRequirements[plantType] || 25; // Default to 25 liters/m²/week
    let totalWaterRequired = baseWaterUsage * landArea;

    // Adjustments based on temperature and humidity
    if (temperature > 30 && humidity < 50) {
      totalWaterRequired += totalWaterRequired * 0.2; // Increase by 20%
    } else if (temperature < 20 && humidity > 70) {
      totalWaterRequired -= totalWaterRequired * 0.1; // Decrease by 10%
    }

    // Adjustments based on precipitation
    if (precipitation > 5) {
      totalWaterRequired -= totalWaterRequired * 0.3; // Decrease by 30%
    }

    // Adjustments based on soil moisture
    if (soilMoisture > 70) {
      totalWaterRequired -= totalWaterRequired * 0.5; // Decrease by 50%
    } else if (soilMoisture < 30) {
      totalWaterRequired += totalWaterRequired * 0.3; // Increase by 30%
    }

    // Adjustments based on wind speed
    if (windSpeed > 20) {
      totalWaterRequired += totalWaterRequired * 0.15; // Increase by 15%
    }

    setWeeklyWaterUsage(Math.max(0, totalWaterRequired.toFixed(2)));
  };

  const adjustWasteManagement = (temperature) => {
    let wasteRecommendation = '';
    if (temperature > 35) {
      wasteRecommendation = 'Very high temperature: Avoid disposing of organic waste outdoors to prevent odor and rapid decomposition.';
    } else if (temperature > 30) {
      wasteRecommendation = 'High temperature: Be cautious with organic waste disposal; consider composting in shaded areas.';
    } else if (temperature > 20) {
      wasteRecommendation = 'Moderate temperature: Suitable for composting organic waste.';
    } else {
      wasteRecommendation = 'Cool temperature: Composting may slow down; consider insulating compost bins.';
    }
    setWasteLogs((prevLogs) => [...prevLogs, wasteRecommendation]);
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Water Usage'],
        datasets: [
          {
            label: 'Weekly Water Usage (liters)',
            data: weeklyWaterUsage ? [weeklyWaterUsage] : [],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Usage Type' } },
          y: { title: { display: true, text: 'Liters' } },
        },
      },
    });
  }, [weeklyWaterUsage]);

  return (
    <div>
      <Header />
      <div className="smart-irrigation">
        <h2>Smart Irrigation & Waste Management</h2>
        <p>Plan your irrigation schedule efficiently and manage waste effectively.</p>

        <div className="input-section">
          <div className="input-group">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="city"
              className="input-field"
            />
            <button onClick={fetchWeather} className="btn-fetch">Get</button>
          </div>

          <div className="input-group">
            <input
              type="number"
              value={landArea}
              onChange={(e) => setLandArea(Number(e.target.value))}
              placeholder="Enter land area (m²)"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <select onChange={(e) => setPlantType(e.target.value)} value={plantType} className="input-field">
              <option value="">Select Plant Type</option>
              {Object.keys(plantWaterRequirements).map((plant) => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Soil Moisture Level: {soilMoisture}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="slider"
            />
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading weather data...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : weather ? (
          <div className="weather">
            <h3>Weather in {weather.location.name}, {weather.location.country}</h3>
            <p>Temperature: {weather.current.temp_c}°C</p>
            <p>Humidity: {weather.current.humidity}%</p>
            <p>Precipitation: {weather.current.precip_mm}mm</p>
            <p>Condition: {weather.current.condition.text}</p>
          </div>
        ) : (
          <p>No weather data available. Please enter a city name.</p>
        )}

        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>

        <div className="waste-management">
          <h3>Waste Management Recommendations:</h3>
          <ul>
            {wasteLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelAndWasteManagementPlanner;
