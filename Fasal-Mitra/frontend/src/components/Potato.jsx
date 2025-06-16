import React, { useState } from 'react';
import '../styles/Potato.css';
import axios from 'axios';

export default function Potato() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const diseaseDetails = {
    "Early Blight": {
      solution: "Apply fungicides containing chlorothalonil or copper-based compounds.",
      suggestion: "Remove infected leaves and maintain good air circulation.",
      precaution: "Use disease-free seeds and practice crop rotation."
    },
    "Late Blight": {
      solution: "Use fungicides like mancozeb or metalaxyl for control.",
      suggestion: "Avoid overhead irrigation and destroy infected plants.",
      precaution: "Plant resistant varieties and ensure proper drainage."
    },
    "Healthy": {
      solution: "No action required. Keep providing optimal care.",
      suggestion: "Maintain regular watering and nutrient balance.",
      precaution: "Continue monitoring for early signs of disease."
    }
  };

  const handleImageChange = (event) => {
    setImage(URL.createObjectURL(event.target.files[0]));
    setPrediction(null); // Reset prediction for new image
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_DISEASE_PREDICTION_API_URL;
      const response = await axios.post(`${API_URL}/predict/potato`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.class && response.data.confidence) {
        setPrediction({
          disease: response.data.class,
          confidence: (response.data.confidence * 100).toFixed(2)
        });
      } else {
        setPrediction(null);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setImage(null);
    setPrediction(null);
  };

  return (
    <div className="potato-main">
      <div className="potato">
        <div className="description-section">
          <h2>Potato Disease Detection</h2>
          <div className="description-content">
            <p className="main-description">
              Our advanced AI system helps farmers identify and manage potato plant diseases effectively. 
              Using state-of-the-art machine learning algorithms, we can detect various diseases that commonly 
              affect potato crops, providing instant diagnosis and treatment recommendations.
            </p>
            <div className="features-list">
              <h3>Key Features:</h3>
              <ul>
                <li>Instant disease identification</li>
                <li>Detailed disease information</li>
                <li>Recommended solutions</li>
                <li>Preventive measures</li>
                <li>Expert suggestions</li>
              </ul>
            </div>
            <div className="how-to-use">
              <h3>How to Use:</h3>
              <ol>
                <li>Take a clear photo of the affected potato plant</li>
                <li>Upload the image using the button below</li>
                <li>Get instant results and recommendations</li>
                <li>Follow the suggested solutions</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="detection-section">
          <h3>Try Our Disease Detection</h3>
          <p>Upload an image of a potato plant to detect diseases:</p>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={(event) => {
              handleImageChange(event);
              handleUpload(event);
            }}
          />
          <label htmlFor="fileUpload" className="file-label">Choose an Image</label>

          {image && <img src={image} alt="potato preview" className="preview-image" />}

          {isLoading && (
            <div>
              <p>Detecting Disease...</p>
              <div className="progress-bar">
                <div></div>
              </div>
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h3>Prediction:</h3>
              <p><strong>Predicted Disease:</strong> {prediction.disease}</p>
              <p><strong>Confidence:</strong> {prediction.confidence}%</p>
              <p><strong>Solution:</strong> {diseaseDetails[prediction.disease]?.solution || "No information available."}</p>
              <p><strong>Suggestion:</strong> {diseaseDetails[prediction.disease]?.suggestion || "No information available."}</p>
              <p><strong>Precaution:</strong> {diseaseDetails[prediction.disease]?.precaution || "No information available."}</p>
              <button className="retry-button" onClick={handleRetry}>Retry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
