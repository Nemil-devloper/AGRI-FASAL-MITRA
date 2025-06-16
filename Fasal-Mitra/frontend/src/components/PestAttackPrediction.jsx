import React, { useState } from "react";
import axios from "axios";
import "../styles/PestAttackPrediction.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Import images for each pest
import AphidsImg from "../images/aphide.jpeg";
import WhitefliesImg from "../images/whiteflies.jpeg";
import SpiderMitesImg from "../images/spidermites.jpeg";
import FungalDiseasesImg from "../images/fungal.jpg";
import RootKnotNematodesImg from "../images/nematodes.jpeg";
import LeafMinersImg from "../images/leafminers.jpeg";
import CutwormsImg from "../images/cutworms.jpeg";
import ThripsImg from "../images/thrips.jpeg";
import StemBorersImg from "../images/stemborers.png";
import ArmywormsImg from "../images/armyworms.jpg";
import FruitFliesImg from "../images/fruitflies.webp";
import GrasshoppersImg from "../images/grasshoppers.jpeg";
import BollwormsImg from "../images/bollworms.jpg";
import BrownPlanthopperImg from "../images/planthopper.jpeg";
import RiceBlastImg from "../images/riceblast.jpeg";

function PestPrediction() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [predictions, setPredictions] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const BASE_URL = import.meta.env.VITE_WEATHER_API_URL; // Changed to WeatherAPI instead of OpenWeatherMap

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert("Please enter a city name");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/current.json`, {
        params: {
          key: API_KEY,
          q: city,
        },
      });

      if (response.data) {
        const formattedData = {
          main: {
            temp: response.data.current.temp_c,
            humidity: response.data.current.humidity,
          },
          wind: {
            speed: response.data.current.wind_kph / 3.6, // Convert km/h to m/s
          },
          weather: [
            {
              main: response.data.current.condition.text,
            },
          ],
        };

        setWeatherData(formattedData);
        predictPests(formattedData); // Pass formatted data
      }
    } catch (error) {
      console.error("Weather API Error:", error);
      alert("Failed to fetch weather data. Please check the city name.");
    }
  };

  const predictPests = (data) => {
    try {
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const weatherCondition = data.weather[0].main;

      console.log("Weather data received:", {
        temp,
        humidity,
        windSpeed,
        weatherCondition,
      });

      let predictions = {
        Aphids: 0,
        Whiteflies: 0,
        SpiderMites: 0,
        FungalDiseases: 0,
        RootKnotNematodes: 0,
        LeafMiners: 0,
        Cutworms: 0,
        Thrips: 0,
        StemBorers: 0,
        Armyworms: 0,
        FruitFlies: 0,
        Grasshoppers: 0,
        Bollworms: 0,
        BrownPlanthopper: 0,
        RiceBlast: 0,
      };

      // Enhanced prediction logic for real-life scenarios
      if (temp > 20 && temp < 30 && humidity > 65) {
        predictions.Aphids = 0.85;
        predictions.FungalDiseases = 0.75;
      }
      if (temp > 30 && humidity < 50 && windSpeed > 5) {
        predictions.SpiderMites = 0.95;
      }
      if (humidity > 80 && temp < 25) {
        predictions.RootKnotNematodes = 0.65;
      }
      if (temp > 25 && windSpeed > 10) {
        predictions.LeafMiners = 0.8;
      }
      if (humidity > 85 && temp < 20 && weatherCondition === "Rain") {
        predictions.Cutworms = 0.7;
        predictions.Thrips = 0.6;
      }
      if (temp > 25 && temp < 35 && humidity > 70) {
        predictions.StemBorers = 0.8;
      }
      if (temp > 20 && temp < 30 && humidity > 60) {
        predictions.Armyworms = 0.75;
      }
      if (temp > 25 && humidity > 65) {
        predictions.FruitFlies = 0.7;
      }
      if (temp > 30 && humidity < 40) {
        predictions.Grasshoppers = 0.85;
      }
      if (temp > 25 && humidity > 60) {
        predictions.Bollworms = 0.9;
      }
      if (temp > 28 && humidity > 70) {
        predictions.BrownPlanthopper = 0.85;
      }
      if (temp > 20 && humidity > 80 && weatherCondition === "Rain") {
        predictions.RiceBlast = 0.9;
      }

      setPredictions(predictions);
    } catch (error) {
      console.error("Error in prediction:", error);
      alert("Error processing weather data");
    }
  };

  const getSolutions = (pest) => {
    const solutions = {
      Aphids: {
        organic:
          "Use neem oil or insecticidal soap. Introduce natural predators like ladybugs.",
        synthetic: "Apply systemic insecticides like imidacloprid.",
        image: AphidsImg,
      },
      Whiteflies: {
        organic: "Spray with insecticidal soap. Use yellow sticky traps.",
        synthetic: "Apply insecticides like pyrethroids.",
        image: WhitefliesImg,
      },
      SpiderMites: {
        organic:
          "Increase humidity around plants and spray with horticultural oil.",
        synthetic: "Use miticides like abamectin.",
        image: SpiderMitesImg,
      },
      FungalDiseases: {
        organic:
          "Ensure proper drainage. Apply organic fungicides like copper-based solutions.",
        synthetic: "Apply synthetic fungicides like azoxystrobin.",
        image: FungalDiseasesImg,
      },
      RootKnotNematodes: {
        organic: "Use soil amendments like neem cake. Practice crop rotation.",
        synthetic: "Apply nematicides like carbofuran.",
        image: RootKnotNematodesImg,
      },
      LeafMiners: {
        organic:
          "Remove affected leaves. Use sticky traps to monitor adult flies.",
        synthetic: "Apply systemic insecticides like cyromazine.",
        image: LeafMinersImg,
      },
      Cutworms: {
        organic:
          "Use physical barriers around plants. Hand-pick larvae during the evening.",
        synthetic: "Apply insecticides like chlorpyrifos.",
        image: CutwormsImg,
      },
      Thrips: {
        organic:
          "Introduce beneficial insects like lacewings. Apply blue sticky traps.",
        synthetic: "Use insecticides like spinosad.",
        image: ThripsImg,
      },
      StemBorers: {
        organic:
          "Use pheromone traps to monitor. Apply neem-based insecticides.",
        synthetic: "Apply synthetic insecticides like fipronil.",
        image: StemBorersImg,
      },
      Armyworms: {
        organic:
          "Regularly inspect crops. Use biological control agents like Bacillus thuringiensis.",
        synthetic: "Apply insecticides like lambda-cyhalothrin.",
        image: ArmywormsImg,
      },
      FruitFlies: {
        organic:
          "Use bait traps. Destroy infested fruits to prevent larvae from maturing.",
        synthetic: "Apply insecticides like malathion.",
        image: FruitFliesImg,
      },
      Grasshoppers: {
        organic:
          "Implement biological control using natural predators. Apply neem oil.",
        synthetic: "Apply insecticides like carbaryl.",
        image: GrasshoppersImg,
      },
      Bollworms: {
        organic: "Plant resistant crop varieties. Use pheromone traps.",
        synthetic: "Apply insecticides like emamectin benzoate.",
        image: BollwormsImg,
      },
      BrownPlanthopper: {
        organic:
          "Maintain proper water management. Use resistant rice varieties.",
        synthetic: "Apply insecticides like imidacloprid.",
        image: BrownPlanthopperImg,
      },
      RiceBlast: {
        organic:
          "Use certified disease-free seeds. Apply organic fungicides like copper-based solutions.",
        synthetic: "Apply synthetic fungicides like tricyclazole.",
        image: RiceBlastImg,
      },
    };
    return solutions[pest] || {
      organic: "No solution available.",
      synthetic: "No solution available.",
      image: null,
    };
  };

  return (
    <div className="pest-prediction-container">
      <h1 className="title">Advanced Pest Attack Prediction</h1>

      <div className="input-section">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="input-field"
        />
        <button onClick={fetchWeather} className="btn-fetch">
          Get Prediction
        </button>
      </div>

      {weatherData && (
        <div className="weather-card">
          <h2>Weather Data for {city}</h2>
          <p>🌡️ Temperature: {weatherData.main.temp}°C</p>
          <p>💧 Humidity: {weatherData.main.humidity}%</p>
          <p>🌬️ Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}

      {predictions && (
        <div className="results-card">
          <h2>Prediction Results</h2>
          <div className="chart-container" style={{ overflowX: "auto" }}>
            <ResponsiveContainer width={1500} height={300}>
              <BarChart
                data={Object.entries(predictions).map(([pest, probability]) => ({
                  pest,
                  probability,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="pest"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="probability" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="solutions-section">
            <h3>Solutions for Predicted Pests</h3>
            <ul>
              {Object.entries(predictions).map(
                ([pest, probability]) =>
                  probability > 0.5 && (
                    <li key={pest}>
                      <strong>{pest}:</strong>
                      <div className="solution-details">
                        <img
                          src={getSolutions(pest).image}
                          alt={pest}
                          className="pest-image"
                        />
                        <div>
                          <p>
                            <strong>Organic Solution:</strong>{" "}
                            {getSolutions(pest).organic}
                          </p>
                          <p>
                            <strong>Synthetic Solution:</strong>{" "}
                            {getSolutions(pest).synthetic}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PestPrediction;