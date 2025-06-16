"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import potatoImage from '../assets/potato.jpg';
import bellpepperImage from '../assets/bell-pepper.jpg';
import tomatoImage from '../assets/tomato.jpg';
import '../styles/PlantDiseaseDetection.css';

export default function PlantDiseaseDetection() {
  return (
    <div className='plant-disease-detection-main'>
    <div className="plant-disease-detection">
      <h2 className="title">Plant Disease Detection</h2>
      <p className="description">Click on a plant image to detect diseases:</p>
      <div className="plant-grid">
        <Link to="/plant-disease-detection/potato" className="plant-card">
          <img src={potatoImage} alt="Potato" />
          <div className="overlay">
            <span>Potato Disease Detection</span>
          </div>
        </Link>
        <Link to="/plant-disease-detection/bellpepper" className="plant-card">
          <img src={bellpepperImage} alt="Bell Pepper" />
          <div className="overlay">
            <span>Bell Pepper Disease Detection</span>
          </div>
        </Link>
        <Link to="/plant-disease-detection/tomato" className="plant-card">
          <img src={tomatoImage} alt="Tomato" />
          <div className="overlay">
            <span>Tomato Disease Detection</span>
          </div>
        </Link>
      </div>
    </div>
    </div>
  );
}
