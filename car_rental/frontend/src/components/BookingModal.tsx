import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import API_URL from '../api';

interface BookingModalProps {
  vehicle: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ vehicle, onClose, onSuccess }: BookingModalProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays + 1) * parseFloat(vehicle.price_per_day); // +1 to include start date
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('You must be logged in to book a vehicle');
      }
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          renter_id: user.id,
          start_date: startDate,
          end_date: endDate,
          total_price: calculateTotal(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      alert('Booking request sent successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Book {vehicle.make} {vehicle.model}</h2>
        <div className="vehicle-summary">
            <img 
                src={vehicle.image_url ? `${API_URL}${vehicle.image_url}` : '/car-placeholder.png'} 
                alt={vehicle.model} 
                className="modal-vehicle-img"
            />
            <div className="vehicle-info">
                <p className="price">${vehicle.price_per_day} / day</p>
                <p className="location">{vehicle.location}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Start Date</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                required
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>End Date</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                required
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="total-price-display">
            <span>Total Price:</span>
            <span className="amount">
                <FaMoneyBillWave /> ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
