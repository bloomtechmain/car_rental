import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCar, FaCalendarAlt, FaStar } from 'react-icons/fa';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import '../rent-styles.css';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price_per_day: number;
  location: string;
  image_url: string | null;
  description: string;
  owner_id: string;
  list_availability?: string;
}

const AvailabilityDisplay = ({ datesStr }: { datesStr?: string }) => {
  if (!datesStr) return <span><FaCalendarAlt /> Available</span>;
  
  const dates = datesStr.split(', ');
  if (dates.length <= 2) {
      return <span><FaCalendarAlt /> {datesStr}</span>;
  }
  
  return (
    <span title={datesStr} style={{ cursor: 'help' }}>
        <FaCalendarAlt /> {dates.length} dates available
    </span>
  );
};

const RentVehicle = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMake = selectedMake === 'All' || vehicle.make === selectedMake;
    const matchesPrice = vehicle.price_per_day >= priceRange[0] && vehicle.price_per_day <= priceRange[1];

    return matchesSearch && matchesMake && matchesPrice;
  });

  const uniqueMakes = ['All', ...Array.from(new Set(vehicles.map(v => v.make)))];

  return (
    <AuthenticatedLayout>
      <div className="rent-page-container">
        {/* Header & Search Section */}
        <div className="rent-header">
          <div className="header-content">
            <h1>Find Your Perfect Ride</h1>
            <p>Choose from our premium collection of vehicles for your next journey.</p>
          </div>
          
          <div className="search-bar-container">
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by make, model, or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={selectedMake} 
                onChange={(e) => setSelectedMake(e.target.value)}
                className="filter-select"
              >
                {uniqueMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              
              <div className="price-filter">
                 {/* Simple price filter for now */}
                 <span className="price-label">Max Price: ${priceRange[1]}</span>
                 <input 
                   type="range" 
                   min="0" 
                   max={Math.max(50000, ...vehicles.map(v => Number(v.price_per_day) || 0))} 
                   value={priceRange[1]} 
                   onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="vehicles-scroll-container">
          {loading ? (
            <div className="loading-state">Loading vehicles...</div>
          ) : filteredVehicles.length > 0 ? (
            <div className="rent-grid">
              {filteredVehicles.map(vehicle => (
                <div key={vehicle.id} className="rent-card">
                  <div className="card-image-wrapper">
                    <img 
                      src={vehicle.image_url ? `http://localhost:3000${vehicle.image_url}` : '/car-placeholder.png'} 
                      alt={`${vehicle.make} ${vehicle.model}`} 
                      className="card-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=60';
                      }}
                    />
                    <div className="card-badge">
                      <FaStar /> 4.9
                    </div>
                  </div>
                  
                  <div className="card-details">
                    <div className="card-header-row">
                      <h3>{vehicle.make} {vehicle.model}</h3>
                      <span className="year-tag">{vehicle.year}</span>
                    </div>
                    
                    <div className="location-row">
                      <FaMapMarkerAlt /> {vehicle.location}
                    </div>
                    
                    <div className="features-row">
                      <span><FaCar /> Automatic</span>
                      <AvailabilityDisplay datesStr={vehicle.list_availability} />
                    </div>
                    
                    <div className="card-footer">
                      <div className="price-info">
                        <span className="price-amount">${vehicle.price_per_day}</span>
                        <span className="price-period">/day</span>
                      </div>
                      <button className="rent-now-btn">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaCar className="empty-icon" />
              <h3>No vehicles found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default RentVehicle;
