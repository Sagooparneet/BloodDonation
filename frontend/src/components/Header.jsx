import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        🩸 <strong>Blood Donation Platform</strong>
      </div>
      <nav>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-buttons">
          <Link to="/signup">
            <button className="btn-red">
              <strong>Sign Up</strong>
            </button>
          </Link>
          <Link to="/login">
            <button className="btn-red">
              <strong>Log In</strong>
            </button>
          </Link>
          <Link to="/admin-login">
            <button className="btn-red">
              <strong>Admin Login</strong>
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
