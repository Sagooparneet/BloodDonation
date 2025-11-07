import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import bloodBagImage from "./bloodbagimg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleRedirectSignup = () => {
    navigate("/signup");
  };
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <img src={bloodBagImage} alt="Blood bag" className="hero-img" />
        <div className="hero-content">
          <h1>Donate Blood, Save Lives</h1>
          <p>Be the reason someone lives today. Connect. Donate. Impact.</p>
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="about">
        <h2>What We Offer</h2>
        <div className="features-cards">
          <div className="feature-card">
            <h3>Easy Donation Booking</h3>
            <p>Schedule donations effortlessly through our platform.</p>
          </div>
          <div className="feature-card">
            <h3>Instant Blood Requests</h3>
            <p>Quickly request specific blood types in emergencies.</p>
          </div>
          <div className="feature-card">
            <h3>Trusted by Hospitals</h3>
            <p>Partnered with top healthcare providers nationwide.</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="red" onClick={handleRedirectSignup}>Donate Blood</button>
        <button onClick={handleRedirectSignup}>Request Blood</button>
        <button onClick={handleRedirectSignup}>Join Our Community</button>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h4>Donors Registered</h4>
          <h2>12,500+</h2>
        </div>
        <div className="stat-card">
          <h4>Units Matched</h4>
          <h2>8,750+</h2>
        </div>
        <div className="stat-card">
          <h4>Lives Impacted</h4>
          <h2>5,200+</h2>
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="why-section">
        <h2>Why Donate Blood?</h2>
        <p>
          Every drop counts. Your blood can save mothers in labor, accident
          victims, and patients with life-threatening diseases. Join the
          life-saving mission today.
        </p>
        <div className="action-buttons">
        <button onClick={handleRedirectSignup}>Join Our Community</button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <h2>Contact Us</h2>
        <p>Email: support@lifeblood.com</p>
        <p>Phone: +254 700 123 456</p>
        <p>Location: Nairobi, Kenya</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <p>© 2024 LifeBlood. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
