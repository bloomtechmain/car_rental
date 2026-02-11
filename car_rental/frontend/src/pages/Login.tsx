import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FaCarSide, FaCheck, FaShieldAlt, FaBolt, FaStar, FaTimes } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
    if (credentialResponse.credential) {
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const { email, name, picture, sub } = decoded;

        console.log('Sending login request to backend...');
        const res = await fetch('http://localhost:3000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, name, picture, sub }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log('Login successful, navigating...');
          localStorage.setItem('token', credentialResponse.credential);
          localStorage.setItem('user', JSON.stringify(data));
          localStorage.setItem('isAuthenticated', 'true');
          setShowLoginModal(false); // Close modal
          navigate('/dashboard');
        } else {
          console.error('Login failed:', data.message || data.error);
          alert(`Login failed: ${data.message || data.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.error('Error logging in:', error);
        alert(`Network or System Error: ${error.message}`);
      }
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000' }}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <FaCarSide /> BloomGo
        </div>
        <button className="nav-cta" onClick={() => setShowLoginModal(true)}>
          Try BloomGo
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Left Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            BloomGo<br />
            <span className="highlight-text">Rent. Earn. Go.</span>
          </h1>
          <p className="hero-description">
            BloomGo lets you rent vehicles or earn by renting out yours. We manage the process—you just drive or earn. Simple, secure, and feature-rich.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <FaCheck /> Verified Renters
            </div>
            <div className="feature-item">
              <FaShieldAlt /> Full Insurance
            </div>
            <div className="feature-item">
              <FaBolt /> Instant Payouts
            </div>
          </div>

          <button className="cta-button" onClick={() => setShowLoginModal(true)}>
            Get Started Now
          </button>
        </div>

        {/* Right Visual */}
        <div className="hero-visual">
          <div className="map-grid"></div>
          
          <img src="/car2.png" alt="Premium Vehicles" className="hero-car" />

          {/* Floating Cards */}
          <div className="floating-stat stat-premium">
            <div className="stat-icon">
              <FaShieldAlt />
            </div>
            <div className="stat-info">
              <h4>Premium</h4>
              <p>Selection</p>
            </div>
          </div>

          <div className="floating-stat stat-rating">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-info">
              <h4>4.9</h4>
              <p>Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) setShowLoginModal(false);
        }}>
          <div className="login-modal">
            <button className="close-modal" onClick={() => setShowLoginModal(false)}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <h2>Welcome Back</h2>
              <p>Sign in to start your journey</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                theme="filled_black"
                shape="pill"
                size="large"
                width="300"
                logo_alignment="center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
