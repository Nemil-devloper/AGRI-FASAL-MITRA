import React from 'react';
import "../styles/MachineRental.css";

export default function MachineRental() {
  return (
    <div className="machine-rental-page">
      <div className="rental-content">
        <h1 className="page-title">Welcome to Fasal Mitra Machine Rental</h1>
        
        <div className="description-section">
          <h2>About Our Platform</h2>
          <p>
            Fasal Mitra is a revolutionary agricultural equipment rental platform designed to empower farmers 
            and agricultural businesses. Our platform bridges the gap between equipment owners and those who 
            need them, creating a sustainable and cost-effective solution for the farming community.
          </p>
        </div>

        <div className="features-section">
          <h2>Our Rental Products</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Tractors</h3>
              <p>Modern tractors for various farming operations, from small-scale to large-scale farming.</p>
            </div>
            <div className="feature-card">
              <h3>Harvesting Equipment</h3>
              <p>Specialized machines for efficient crop harvesting and processing.</p>
            </div>
            <div className="feature-card">
              <h3>Irrigation Systems</h3>
              <p>Advanced irrigation equipment for optimal water management.</p>
            </div>
            <div className="feature-card">
              <h3>Planting Equipment</h3>
              <p>Precision planting machines for better crop establishment.</p>
            </div>
          </div>
        </div>

        <div className="benefits-section">
          <h2>Why Choose Our Platform?</h2>
          <ul>
            <li>Cost-effective rental solutions</li>
            <li>Verified and well-maintained equipment</li>
            <li>Flexible rental periods</li>
            <li>24/7 customer support</li>
            <li>Secure payment system</li>
            <li>Easy booking process</li>
          </ul>
        </div>

        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Visit our rental marketplace to browse available equipment and start renting today!</p>
          <a 
            href={import.meta.env.VITE_RENTAL_MARKETPLACE_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="rental-link-button"
          >
            Visit Rental Marketplace
          </a>
        </div>
      </div>
    </div>
  );
}
