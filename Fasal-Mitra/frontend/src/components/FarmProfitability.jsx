import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FarmProfitability.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const FarmProfitability = () => {
  const [cropData, setCropData] = useState([]);
  const [form, setForm] = useState({
    crop: '',
    area: '',
    expenses: '',
  });
  const [profitability, setProfitability] = useState(null);
  const [weatherSuggestion, setWeatherSuggestion] = useState('');

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const BASE_URL = import.meta.env.VITE_WEATHER_API_URL; // Replace with your OpenWeatherMap API key

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateProfit = () => {
    const area = parseFloat(form.area);
    const expenses = parseFloat(form.expenses);
    const crop = form.crop.toLowerCase();

    if (isNaN(area) || isNaN(expenses) || !crop) {
      alert('Please fill in all fields with valid data.');
      return;
    }

    const cropYields = {
      wheat: 3600,
      rice: 2500,
      maize: 3000,
      barley: 2000,
    };

    const marketPrices = {
      wheat: 20,
      rice: 25,
      maize: 15,
      barley: 18,
    };

    const yieldPerHectare = cropYields[crop];
    const marketPrice = marketPrices[crop];

    if (!yieldPerHectare || !marketPrice) {
      alert('Invalid crop name or data not available.');
      return;
    }

    const totalYield = yieldPerHectare * area;
    const totalRevenue = totalYield * marketPrice;
    const netProfit = totalRevenue - expenses;
    const profitMargin = ((netProfit / expenses) * 100).toFixed(2);

    const newCropData = [
      ...cropData,
      {
        crop: form.crop,
        area,
        expenses,
        marketPrice,
        netProfit,
        profitMargin: parseFloat(profitMargin),
      },
    ];

    setCropData(newCropData);
    setProfitability({ netProfit, profitMargin });
    setForm({ crop: '', area: '', expenses: '' });
  };

  const fetchWeatherSuggestion = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const temp = response.data.main.temp;

      let suggestion = 'Wheat';
      if (temp > 30) suggestion = 'Maize';
      else if (temp > 20 && temp <= 30) suggestion = 'Rice';
      else if (temp <= 20) suggestion = 'Barley';

      setWeatherSuggestion(
        `Based on current weather conditions, ${suggestion} is recommended.`
      );
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="farm-profitability-container">
      <h1 className="title">Farm Profitability Calculator</h1>

      <div className="form-section">
        <h2>Input Crop Data</h2>
        <div className="form-grid">
          <input
            type="text"
            name="crop"
            value={form.crop}
            onChange={handleInputChange}
            placeholder="Crop Name (Wheat, Rice, Maize, Barley)"
            className="input-field"
          />
          <input
            type="text"
            name="area"
            value={form.area}
            onChange={handleInputChange}
            placeholder="Area (in hectares)"
            className="input-field"
          />
          <input
            type="text"
            name="expenses"
            value={form.expenses}
            onChange={handleInputChange}
            placeholder="Total Expenses (in ₹)"
            className="input-field"
          />
        </div>
        <button onClick={calculateProfit} className="calculate-btn">
          Calculate Profitability
        </button>
      </div>

      {profitability && (
        <div className="profit-summary">
          <h2>Profitability Summary</h2>
          <p>💰 Net Profit: ₹{profitability.netProfit.toFixed(2)}</p>
          <p>📊 Profit Margin: {profitability.profitMargin}%</p>
        </div>
      )}

      {cropData.length > 0 && (
        <div className="chart-section">
          <h2>Profitability Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cropData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="netProfit" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      
    </div>
  );
};

export default FarmProfitability;
