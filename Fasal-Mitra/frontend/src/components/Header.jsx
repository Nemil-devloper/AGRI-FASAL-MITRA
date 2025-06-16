import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png"; // Make sure to replace this with the correct path to your logo file

function Header({ isAuthenticated, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      if (isMenuOpen && !e.target.closest('.header')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    return () => setIsMenuOpen(false);
  }, [navigate]);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();  // Call the logout function passed as a prop
    navigate("/auth");  // Redirect to the login page
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" onClick={handleNavClick}>
          <img src={logo} alt="Fasal Mitra Logo" className="logo" />
        </Link>
      </div>
      
      <nav className={`nav-links ${isMenuOpen ? "nav-open" : ""}`}>
        {[
          ['/', 'Home'],
          ['/chatbot', 'ChatBot'],
          ['/smart-irrigation', 'Smart Irrigation'],
          ['/ai-pest-detection', 'AI Pest Detection'],
          ['/climate-prediction', 'Climate'],
          ['/machine-rental', 'Rental'],
          ['/plant-disease-detection', 'Plant Disease'],
          ['/policy', 'Policies'],
        ].map(([path, label]) => (
          <Link key={path} to={path} onClick={handleNavClick}>
            {label}
          </Link>
        ))}
        
        {isAuthenticated ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/auth" onClick={handleNavClick} className="login-button">
            Login
          </Link>
        )}
      </nav>

      <button 
        className="menu-toggle" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}></span>
      </button>
    </header>
  );
}

export default Header;