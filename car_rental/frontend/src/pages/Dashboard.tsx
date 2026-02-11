import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { FaCar, FaKey, FaArrowRight } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rent' | 'hire'>('rent');

  const handleAction = () => {
    if (activeTab === 'rent') {
      navigate('/rent-vehicle');
    } else {
      navigate('/hire-vehicle');
    }
  };

  return (
    <AuthenticatedLayout>
      {/* Top Toggle Switch */}
      <div className="dashboard-header">
        <div className="toggle-switch">
          <div 
            className={`toggle-option ${activeTab === 'rent' ? 'active' : ''}`}
            onClick={() => setActiveTab('rent')}
          >
            <FaCar /> Rent a Vehicle
          </div>
          <div 
            className={`toggle-option ${activeTab === 'hire' ? 'active' : ''}`}
            onClick={() => setActiveTab('hire')}
          >
            <FaKey /> Hire Out Vehicle
          </div>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="dashboard-hero">
        <div className="hero-text-content">
          <h2>
            {activeTab === 'rent' ? 'Find Your Perfect Drive' : 'Earn With Your Vehicle'}
          </h2>
          <p>
            {activeTab === 'rent' 
              ? 'Choose from our wide range of premium vehicles for any occasion. Whether it\'s a weekend getaway or a business trip, we have the right car for you.'
              : 'Turn your idle car into a money-making machine. List your vehicle with us and start earning safely and securely.'}
          </p>
          
          <button className="browse-btn" onClick={handleAction}>
            {activeTab === 'rent' ? 'Browse Vehicles' : 'List Your Vehicle'} <FaArrowRight />
          </button>
        </div>

        <div className="hero-visual-content">
           <img src="/car2.png" alt="Premium Car" className="hero-car-image" />
        </div>

        <FaCar className="hero-bg-icon" />
      </div>

    </AuthenticatedLayout>
  );
};

export default Dashboard;
