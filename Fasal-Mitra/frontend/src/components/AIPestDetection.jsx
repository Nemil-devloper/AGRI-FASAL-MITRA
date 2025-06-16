import React, { useState } from "react";
import "../styles/AIPestDetection.css";
import axios from "axios";

export default function AIPestDetection() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const diseaseDetails = {
    "ants": {
      solution: "Use bait stations containing boric acid near ant trails to effectively reduce ant populations.",
      suggestion: "Maintain cleanliness by promptly cleaning up food spills and storing food in sealed containers to prevent attracting ants.",
      precaution: "Avoid using sprays that can scatter the colony; focus on targeted treatments."
    },
    "bees": {
      solution: "Relocate the hive safely with the help of a professional beekeeper.",
      suggestion: "Avoid using chemicals; consider planting bee-friendly crops away from sensitive areas.",
      precaution: "Wear protective clothing and avoid sudden movements near hives."
    },
    "beetle": {
      solution: "Introduce natural predators like birds and beneficial nematodes to control beetle populations.",
      suggestion: "Regularly inspect crops for signs of beetles and remove them manually when possible.",
      precaution: "Use crop rotation to prevent beetle infestations."
    },
    "catterpillar": {
      solution: "Use Bacillus thuringiensis (Bt) sprays to target caterpillars without harming beneficial insects.",
      suggestion: "Introduce natural predators like parasitic wasps or birds.",
      precaution: "Avoid overwatering plants, as this can create favorable conditions for caterpillars."
    },
    "earthworms": {
      solution: "No action required; earthworms are beneficial for soil health and nutrient cycling.",
      suggestion: "Encourage their presence by adding organic matter to the soil.",
      precaution: "Avoid using chemical pesticides that can harm earthworms."
    },
    "earwig": {
      solution: "Use traps filled with soy sauce and vegetable oil to capture earwigs.",
      suggestion: "Remove plant debris and mulch near crops to reduce earwig hiding spots.",
      precaution: "Avoid overwatering, as damp conditions attract earwigs."
    },
    "grasshopper": {
      solution: "Apply neem oil or use natural predators like birds and spiders.",
      suggestion: "Plant trap crops like clover to divert grasshoppers from main crops.",
      precaution: "Monitor fields regularly to detect early infestations."
    },
    "moth": {
      solution: "Use pheromone traps to disrupt mating and reduce moth populations.",
      suggestion: "Apply Bt-based sprays for targeted control of moth larvae.",
      precaution: "Cover crops with row covers to prevent moths from laying eggs."
    },
    "slug": {
      solution: "Use iron phosphate-based baits to control slugs safely.",
      suggestion: "Remove hiding spots like stones and boards near crops.",
      precaution: "Water plants in the morning to reduce slug activity."
    },
    "snail": {
      solution: "Apply copper tape around plant beds to deter snails.",
      suggestion: "Introduce natural predators like ducks or toads.",
      precaution: "Avoid excessive watering, which creates a favorable environment for snails."
    },
    "wasp": {
      solution: "Use traps or call a professional for safe nest removal.",
      suggestion: "Seal openings around buildings to prevent wasps from nesting.",
      precaution: "Avoid swatting wasps; it can provoke them."
    },
    "weevil": {
      solution: "Apply diatomaceous earth around the base of plants to deter weevils.",
      suggestion: "Use crop rotation to reduce weevil populations.",
      precaution: "Store harvested crops in weevil-proof containers."
    }
  };

  const handleImageChange = (event) => {
    setImage(URL.createObjectURL(event.target.files[0]));
    setPrediction(null);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8002/predict/pest", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data && response.data.class && response.data.confidence) {
        setPrediction({
          pest: response.data.class,
          confidence: (response.data.confidence * 100).toFixed(2)
        });
      } else {
        setPrediction(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
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
    <div className="pest-main">
      <div className="pest">
        <div className="description-section">
          <h2>AI-Powered Pest Detection</h2>
          <div className="description-content">
            <p className="main-description">
              Our advanced AI system helps farmers identify and manage crop pests effectively. 
              Using state-of-the-art machine learning algorithms, we can detect various pests 
              that commonly affect agricultural crops.
            </p>
            <div className="features-list">
              <h3>Key Features:</h3>
              <ul>
                <li>Instant pest identification</li>
                <li>Detailed pest information</li>
                <li>Recommended solutions</li>
                <li>Preventive measures</li>
                <li>Expert suggestions</li>
              </ul>
            </div>
            <div className="how-to-use">
              <h3>How to Use:</h3>
              <ol>
                <li>Take a clear photo of the pest or affected area</li>
                <li>Upload the image using the button below</li>
                <li>Get instant results and recommendations</li>
                <li>Follow the suggested solutions</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="detection-section">
          <h3>Try Our Pest Detection</h3>
          <p>Upload an image of a crop to detect common pests:</p>
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

          {image && <img src={image} alt="pest preview" className="preview-image" />}

          {isLoading && (
            <div>
              <p>Detecting pest...</p>
              <div className="progress-bar">
                <div></div>
              </div>
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h3>Prediction:</h3>
              <p><strong>Pest Detected:</strong> {prediction.pest}</p>
              <p><strong>Confidence:</strong> {prediction.confidence}%</p>
              <p><strong>Solution:</strong> {diseaseDetails[prediction.pest]?.solution || "No information available."}</p>
              <p><strong>Suggestion:</strong> {diseaseDetails[prediction.pest]?.suggestion || "No information available."}</p>
              <p><strong>Precaution:</strong> {diseaseDetails[prediction.pest]?.precaution || "No information available."}</p>
              <button className="retry-button" onClick={handleRetry}>Retry</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
