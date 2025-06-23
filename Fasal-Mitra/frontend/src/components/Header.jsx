import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = async () => {
    await logout();  // Call the logout function from context
    navigate("/login");  // Redirect to the login page
  };

  const navLinks = [
    ['/home', 'Home'],
    ['/chatbot', 'ChatBot'],
    ['/smart-irrigation', 'Smart Irrigation'],
    ['/ai-pest-detection', 'AI Pest Detection'],
    ['/climate-prediction', 'Climate'],
    ['/machine-rental', 'Rental'],
    ['/plant-disease-detection', 'Plant Disease'],
    ['/policy', 'Policies'],
  ];

  return (
    <header className={`header${location.pathname === "/auth" ? " no-padding" : ""}`}>
      <div className="header-container">
        <Link to="/" onClick={handleNavClick}>
          <img src={logo} alt="Fasal Mitra Logo" className="logo" />
        </Link>
      </div>
      
      <nav className={`nav-links ${isMenuOpen ? "nav-open" : ""}`}>
        {navLinks.map(([path, label]) => (
          <Link
            key={path}
            to={path}
            onClick={handleNavClick}
            className={location.pathname === path || location.pathname.startsWith(path + "/") ? "active" : ""}
            aria-current={location.pathname === path ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
        
        {isAuthenticated ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={handleNavClick} className="login-button">
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