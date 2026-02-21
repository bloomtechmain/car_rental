import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import API_URL from '../api';

interface BookingModalProps {
  vehicle: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ vehicle, onClose, onSuccess }: BookingModalProps) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse available dates from vehicle data
  const availableDates = vehicle.list_availability 
    ? vehicle.list_availability.split(',').map((d: string) => d.trim()) 
    : [];

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const calculateTotal = () => {
    return selectedDates.length * parseFloat(vehicle.price_per_day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedDates.length === 0) {
        setError('Please select at least one date');
        setLoading(false);
        return;
    }

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
          booking_dates: selectedDates,
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
            <label>Select Dates</label>
            {availableDates.length > 0 ? (
                <div className="dates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.25rem', maxHeight: '120px', overflowY: 'auto', padding: '0.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    {availableDates.map(date => (
                        <button
                            key={date}
                            type="button"
                            onClick={() => toggleDate(date)}
                            className={`date-chip ${selectedDates.includes(date) ? 'selected' : ''}`}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '4px',
                                background: selectedDates.includes(date) ? 'var(--primary-yellow)' : 'transparent',
                                color: selectedDates.includes(date) ? 'var(--primary-black)' : 'var(--text-white)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {date}
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{ color: 'var(--text-gray)', fontStyle: 'italic' }}>
                    No specific dates listed by owner. Please contact owner directly.
                </div>
            )}
          </div>

          <div className="total-price-display">
            <span>Total Price:</span>
            <span className="amount">
                <FaMoneyBillWave /> ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading || selectedDates.length === 0}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
