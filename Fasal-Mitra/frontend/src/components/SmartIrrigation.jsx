import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import WaterLevelAndWasteManagementPlanner from './WaterLevelAndWasteManagementPlanner';
import PestAttackPrediction from './PestAttackPrediction';
import FarmProfitability from './FarmProfitability';
import '../styles/SmartIrrigation.css'; // Ensure to add styles for the new layout

import waterLevelImg from '../assets/waterlevel.jpg'; // Add your images to the assets folder
import pestAttackImg from '../assets/pestattack.jpg';
import farmProfitImg from '../assets/farmprofit.jpg';

const SmartIrrigation = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Water Level & Waste Management Planner',
      description: 'Plan water levels and manage farm waste efficiently.',
      image: waterLevelImg,
      route: 'water-level-and-waste-management-planner',
    },
    {
      title: 'Pest Attack Prediction',
      description: 'Predict pest attacks and protect your crops.',
      image: pestAttackImg,
      route: 'pest-attack-prediction',
    },
    {
      title: 'Farm Profit Calculator',
      description: 'Calculate your farm profitability with ease.',
      image: farmProfitImg,
      route: 'farm-profit',
    },
  ];

  return (
    <div className="smart-irrigation-container">
      <div className="sections-grid">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`section-item ${index % 2 === 0 ? 'left' : 'right'}`} // Criss-cross layout
            onClick={() => navigate(section.route)}
          >
            <img src={section.image} alt={section.title} />
            <div className="section-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Routes>
        <Route path="water-level-and-waste-management-planner" element={<WaterLevelAndWasteManagementPlanner />} />
        <Route path="pest-attack-prediction" element={<PestAttackPrediction />} />
        <Route path="farm-profit" element={<FarmProfitability />} />
      </Routes>
    </div>
  );
};

export default SmartIrrigation;
