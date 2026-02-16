import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaThLarge, 
  FaCar, 
  FaKey, 
  FaHistory, 
  FaClipboardList, 
  FaSignOutAlt,
  FaCarSide,
  FaBars,
  FaTimes,
  FaComments
} from 'react-icons/fa';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; picture: string; email: string; avatar_url?: string; full_name?: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { icon: <FaThLarge />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FaCar />, label: 'Rent a Vehicle', path: '/rent-vehicle' },
    { icon: <FaKey />, label: 'Hire Out Vehicle', path: '/hire-vehicle' },
    { icon: <FaHistory />, label: 'My Rides', path: '/my-rides' },
    { icon: <FaClipboardList />, label: 'Hire Outs', path: '/hire-outs' },
    { icon: <FaComments />, label: 'Chat', path: '/chat' },
  ];

  return (
    <div className="auth-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand-section">
          <FaCarSide className="brand-icon" />
          <span className="brand-name">BloomGo</span>
        </div>
        <button 
          className="menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FaCarSide className="brand-icon" />
          <span className="brand-name">BloomGo</span>
        </div>

        {/* User Profile Card */}
        <div className="user-profile-card">
          <img 
            src={user?.avatar_url || user?.picture || "https://ui-avatars.com/api/?name=User&background=FFD700&color=000"} 
            alt="Profile" 
            className="user-avatar" 
          />
          <div className="user-info">
            <h4 className="user-name">{user?.full_name || user?.name || 'Guest User'}</h4>
            <div className="user-meta">
              <span className="user-status-badge">
                <span className="status-dot"></span> Online
              </span>
              <span className="user-role">Renter</span>
            </div>
          </div>
          <div className="profile-arrow">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
