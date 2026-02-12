import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { FaUser, FaCheck, FaTimes, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import API_URL from '../api';
import '../rent-styles.css';

interface HireRequest {
  id: number;
  vehicle_id: number;
  make: string;
  model: string;
  image_url: string;
  renter_name: string;
  renter_email: string;
  renter_avatar: string;
  start_date: string;
  end_date: string;
  total_price: string;
  status: string;
  created_at: string;
}

const HireOuts = () => {
  const [requests, setRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`${API_URL}/api/bookings/hire-outs/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching hire requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh list
        fetchRequests();
        alert(`Booking ${newStatus} successfully!`);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="rent-page-container">
        <div className="rent-header">
          <div className="header-content">
            <h1>Hire Out Requests</h1>
            <p>Manage incoming booking requests for your vehicles</p>
          </div>
        </div>

        <div className="vehicles-scroll-container">
          {loading ? (
            <div className="loading-spinner">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="no-results">
              <FaCalendarAlt size={40} />
              <h3>No booking requests yet</h3>
              <p>When someone wants to hire your vehicle, it will appear here.</p>
            </div>
          ) : (
            <div className="bookings-grid">
              {requests.map((request) => (
                <div key={request.id} className="booking-card">
                  <div className="booking-header">
                    <span className={`status-badge ${request.status}`}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className="booking-date">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="booking-vehicle-info">
                    <img 
                      src={request.image_url ? `${API_URL}${request.image_url}` : 'https://via.placeholder.com/150'} 
                      alt={`${request.make} ${request.model}`} 
                      className="booking-vehicle-img"
                    />
                    <div>
                      <h3>{request.make} {request.model}</h3>
                      <div className="renter-info">
                        <img 
                          src={request.renter_avatar || 'https://via.placeholder.com/30'} 
                          alt="Renter" 
                          className="renter-avatar"
                        />
                        <span>{request.renter_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <FaCalendarAlt />
                      <span>
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <FaMoneyBillWave />
                      <span className="price-tag">${request.total_price} Total</span>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="booking-actions">
                      <button 
                        className="action-btn reject-btn"
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      >
                        <FaTimes /> Reject
                      </button>
                      <button 
                        className="action-btn confirm-btn"
                        onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                      >
                        <FaCheck /> Confirm
                      </button>
                    </div>
                  )}
                  
                  {request.status === 'confirmed' && (
                     <div className="booking-actions">
                        <button 
                            className="action-btn complete-btn"
                            onClick={() => handleStatusUpdate(request.id, 'completed')}
                        >
                            <FaCheck /> Mark Completed
                        </button>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default HireOuts;
