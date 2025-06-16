import React, { useEffect } from "react";
import "../styles/Home.css";
import farm from "../assets/farm.jpg";
import tractor from "../assets/tractor.jpg";
import agricultural from "../assets/agriculture.jpg";

const Home = ({ isAuthenticated, onLogout }) => {
  useEffect(() => {
    // Prevent body scrolling when home component is mounted
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="home-body">
      <div className="home">
        {isAuthenticated ? (
          <div className="content">
            <h1>Welcome to Our React Website</h1>
            <p>Explore Potato and Bell Pepper pages to upload your images and interact with our app.</p>
            <button onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div className="home-content">
            {/* Section 1: Image Left, Description Right */}
            <section className="section section-1">
              <div className="section-content">
                <div className="section-image">
                  <img src={farm} alt="Farm" loading="lazy" />
                </div>
                <div className="section-text">
                  <h2>About Fasal Mitra</h2>
                  <p>
                    Fasal Mitra is a platform that connects farmers to share and rent agricultural equipment. Our goal is to promote resource-sharing and reduce farming costs.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Image Right, Description Left */}
            <section className="section section-2">
              <div className="section-content reverse">
                <div className="section-text">
                  <h2>Why Choose Us?</h2>
                  <p>
                    We provide verified equipment listings, secure rentals, and affordable solutions. Access the tools you need without making large investments and grow your farm sustainably.
                  </p>
                </div>
                <div className="section-image">
                  <img src={tractor} alt="Tractor" loading="lazy" />
                </div>
              </div>
            </section>

            {/* Section 3: Image Left, Description Right */}
            <section className="section section-3">
              <div className="section-content">
                <div className="section-image">
                  <img src={agricultural} alt="Agriculture Field" loading="lazy" />
                </div>
                <div className="section-text">
                  <h2>Our Mission</h2>
                  <p>
                    Our mission is to build a connected farming community through technology. We believe in empowering farmers with affordable resources and sustainable practices.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="footer">
              <div className="footer-content">
                <div className="footer-left">
                  <h3>Quick Links</h3>
                  <a href="#about">About Us</a>
                  <a href="#products">Products</a>
                  <a href="#awards">Awards</a>
                  <a href="#help">Help</a>
                  <a href="#contact">Contact</a>
                </div>
                <div className="footer-right">
                  <h3>Contact Us</h3>
                  <p>Email: <a href="mailto:support@fasalmitra.com">support@fasalmitra.com</a> | Phone: +91-1234567890</p>
                  <p>Need Help? <a href="/help">Click Here</a></p>
                  <p>© 2025 FasalMitra. All Rights Reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
