import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { FaCar, FaMoneyBillWave, FaMapMarkerAlt, FaInfoCircle, FaCalendarAlt, FaIdCard, FaCloudUploadAlt, FaKey, FaTrash } from 'react-icons/fa';
import { carData } from '../data/carData';
import '../App.css'; 
import '../form-styles.css';

import API_URL from '../api';

const HireVehicle = () => {
  console.log('HireVehicle component mounted');
  const navigate = useNavigate();
  const activeTab = 'hire'; // Set active tab for this page
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    price_per_day: '',
    location: '',
    description: '',
    list_availability: ''
  });
  
  // Suggestion State
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${API_URL}/api/vehicles/my-vehicles/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, make: value, model: '' }); // Clear model when make changes
    
    if (value.length > 0) {
      const filteredMakes = Object.keys(carData).filter(make => 
        make.toLowerCase().includes(value.toLowerCase())
      );
      setMakeSuggestions(filteredMakes);
      setShowMakeSuggestions(true);
    } else {
      setShowMakeSuggestions(false);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, model: value });
    
    // Find the make key case-insensitively
    const makeKey = Object.keys(carData).find(key => key.toLowerCase() === formData.make.toLowerCase());
    
    if (makeKey && value.length > 0) {
      const models = carData[makeKey];
      const filteredModels = models.filter(model => 
        model.toLowerCase().includes(value.toLowerCase())
      );
      setModelSuggestions(filteredModels);
      setShowModelSuggestions(true);
    } else {
      setShowModelSuggestions(false);
    }
  };

  const selectMake = (make: string) => {
    setFormData({ ...formData, make: make, model: '' });
    setShowMakeSuggestions(false);
  };

  const selectModel = (model: string) => {
    setFormData({ ...formData, model: model });
    setShowModelSuggestions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddDate = () => {
    if (dateInput && !selectedDates.includes(dateInput)) {
      setSelectedDates([...selectedDates, dateInput].sort());
      setDateInput('');
    }
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(date => date !== dateToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User not authenticated');
      const user = JSON.parse(userStr);

      const data = new FormData();
      data.append('owner_id', user.id);
      data.append('make', formData.make);
      data.append('model', formData.model);
      data.append('year', formData.year);
      data.append('license_plate', formData.license_plate);
      data.append('price_per_day', formData.price_per_day);
      data.append('location', formData.location);
      data.append('description', formData.description);
      
      // Append availability
      if (selectedDates.length > 0) {
        data.append('list_availability', selectedDates.join(', '));
      } else if (formData.list_availability) {
         data.append('list_availability', formData.list_availability);
      }

      if (imageFile) {
        data.append('image', imageFile);
      }

      const response = await fetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        body: data, // FormData handles headers automatically
      });

      const result = await response.json();

      if (response.ok) {
        alert('Vehicle listed successfully!');
        // Reset form
        setFormData({
            make: '',
            model: '',
            year: '',
            license_plate: '',
            price_per_day: '',
            location: '',
            description: '',
            list_availability: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setSelectedDates([]);
        // fetchMyVehicles(); // Not needed as we are navigating away
        navigate('/rent-vehicle');
      } else {
        alert(`Failed to list vehicle: ${result.error || result.message}`);
      }
    } catch (error: any) {
      console.error('Error listing vehicle:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="full-height-page">
        {/* Top Toggle Switch */}
        <div className="dashboard-header">
          <div className="toggle-switch">
            <div 
              className="toggle-option"
              onClick={() => navigate('/dashboard')}
            >
              <FaCar /> Rent a Vehicle
            </div>
            <div 
              className={`toggle-option ${activeTab === 'hire' ? 'active' : ''}`}
              onClick={() => {}}
            >
              <FaKey /> Hire Out Vehicle
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="scroll-content">
            <div className="form-section">
                <div className="page-header-inside">
                    <h1>List Your Vehicle</h1>
                    <p>Turn your car into an earning asset.</p>
                </div>

                <form onSubmit={handleSubmit} className="vehicle-form compact-form">
                    {/* ... form grid ... */}
                    <div className="form-grid">
                        {/* Make */}
                        <div className="form-group floating-label span-2">
                        <input 
                            type="text" 
                            name="make" 
                            id="make"
                            placeholder=" " 
                            value={formData.make} 
                            onChange={handleMakeChange} 
                            onFocus={() => { if(formData.make) setShowMakeSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 200)}
                            autoComplete="off"
                            required 
                        />
                        <label htmlFor="make"><FaCar /> Make</label>
                        {showMakeSuggestions && makeSuggestions.length > 0 && (
                            <ul className="suggestions-list">
                            {makeSuggestions.map(make => (
                                <li key={make} className="suggestion-item" onMouseDown={() => selectMake(make)}>
                                {make}
                                </li>
                            ))}
                            </ul>
                        )}
                        </div>

                        {/* Model */}
                        <div className="form-group floating-label span-2">
                        <input 
                            type="text" 
                            name="model" 
                            id="model"
                            placeholder=" " 
                            value={formData.model} 
                            onChange={handleModelChange} 
                            onFocus={() => { if(formData.model) setShowModelSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
                            autoComplete="off"
                            required 
                        />
                        <label htmlFor="model"><FaCar /> Model</label>
                        {showModelSuggestions && modelSuggestions.length > 0 && (
                            <ul className="suggestions-list">
                            {modelSuggestions.map(model => (
                                <li key={model} className="suggestion-item" onMouseDown={() => selectModel(model)}>
                                {model}
                                </li>
                            ))}
                            </ul>
                        )}
                        </div>

                        {/* Year */}
                        <div className="form-group floating-label">
                        <input 
                            type="number" 
                            name="year" 
                            id="year"
                            placeholder=" " 
                            value={formData.year} 
                            onChange={handleChange} 
                            required 
                        />
                        <label htmlFor="year"><FaCalendarAlt /> Year</label>
                        </div>

                        {/* License Plate */}
                        <div className="form-group floating-label">
                        <input 
                            type="text" 
                            name="license_plate" 
                            id="license_plate"
                            placeholder=" " 
                            value={formData.license_plate} 
                            onChange={handleChange} 
                            required 
                        />
                        <label htmlFor="license_plate"><FaIdCard /> Plate</label>
                        </div>

                        {/* Price */}
                        <div className="form-group floating-label">
                        <input 
                            type="number" 
                            name="price_per_day" 
                            id="price_per_day"
                            placeholder=" " 
                            value={formData.price_per_day} 
                            onChange={handleChange} 
                            required 
                        />
                        <label htmlFor="price_per_day"><FaMoneyBillWave /> Price/Day</label>
                        </div>

                        {/* Location */}
                        <div className="form-group floating-label">
                        <input 
                            type="text" 
                            name="location" 
                            id="location"
                            placeholder=" " 
                            value={formData.location} 
                            onChange={handleChange} 
                            required 
                        />
                        <label htmlFor="location"><FaMapMarkerAlt /> Location</label>
                        </div>

                        {/* Image Upload - Modern Dropzone */}
                        <div className="form-group span-2 upload-group">
                        <div className="file-upload-wrapper">
                            <input 
                            type="file" 
                            name="image" 
                            id="image-upload"
                            accept="image/*"
                            onChange={handleFileChange} 
                            />
                            {imagePreview ? (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                            </div>
                            ) : (
                            <div className="upload-placeholder">
                                <FaCloudUploadAlt className="upload-icon" />
                                <span>Upload Image</span>
                            </div>
                            )}
                        </div>
                        </div>

                        {/* Description */}
                        <div className="form-group floating-label span-2">
                        <textarea 
                            name="description" 
                            id="description"
                            placeholder=" " 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="compact-textarea"
                        />
                        <label htmlFor="description"><FaInfoCircle /> Description</label>
                        </div>

                        {/* List Availability - Date Picker */}
                        <div className="form-group span-2 availability-group">
                            <label className="static-label"><FaCalendarAlt /> List Availability</label>
                            <div className="date-picker-container">
                                <div className="date-input-group">
                                    <input 
                                        type="date" 
                                        value={dateInput}
                                        onChange={(e) => setDateInput(e.target.value)}
                                        className="date-input"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddDate}
                                        className="add-date-btn"
                                        disabled={!dateInput}
                                    >
                                        Add Date
                                    </button>
                                </div>
                                
                                {selectedDates.length > 0 && (
                                    <div className="selected-dates-list">
                                        <p className="dates-label">Selected Dates:</p>
                                        <div className="dates-chips">
                                            {selectedDates.map(date => (
                                                <div key={date} className="date-chip">
                                                    <span>{date}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveDate(date)}
                                                        className="remove-date-btn"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Listing...' : 'List Vehicle'}
                    </button>
                </form>
            </div>

            {/* Listed Vehicles Section */}
            <div className="listed-vehicles-section">
                <h2>Your Listed Vehicles</h2>
                {myVehicles.length === 0 ? (
                    <p className="no-vehicles">You haven't listed any vehicles yet.</p>
                ) : (
                    <div className="vehicles-grid">
                        {myVehicles.map(vehicle => (
                            <div key={vehicle.id} className="vehicle-card-mini">
                                <div className="vehicle-image-mini">
                                    <img 
                                        src={vehicle.image_url ? `http://localhost:3000${vehicle.image_url}` : 'https://via.placeholder.com/150'} 
                                        alt={`${vehicle.make} ${vehicle.model}`} 
                                    />
                                </div>
                                <div className="vehicle-info-mini">
                                    <h3>{vehicle.make} {vehicle.model} <span className="year-badge">{vehicle.year}</span></h3>
                                    <div className="vehicle-details-row">
                                        <span><FaMoneyBillWave /> ${vehicle.price_per_day}/day</span>
                                        <span><FaMapMarkerAlt /> {vehicle.location}</span>
                                    </div>
                                    <div className="status-badge active">Active</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default HireVehicle;
