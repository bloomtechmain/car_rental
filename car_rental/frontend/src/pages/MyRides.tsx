import { useState, useEffect } from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import PostJourneyCheck from '../components/PostJourneyCheck';
import PreJourneyCheck from '../components/PreJourneyCheck';
import PreJourneyCheckDetails from '../components/PreJourneyCheckDetails';
import API_URL from '../api';
import { FaCar, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

interface Booking {
  id: string;
  make: string;
  model: string;
  image_url: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
}

interface PreJourneyCheckData {
  id: string;
  booking_id: string;
  mileage_before: number;
  notes_before: string;
  images: string[];
  post_images: string[];
  created_at: string;
}

const MyRides = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostJourneyForm, setShowPostJourneyForm] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [preJourneyData, setPreJourneyData] = useState<PreJourneyCheckData | null>(null);

  const handleToggleDetails = async (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
      setPreJourneyData(null);
    } else {
      try {
        const response = await fetch(`${API_URL}/api/pre-journey-checks/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setPreJourneyData(data);
        } else {
          setPreJourneyData(null); // No data found, show the form
        }
      } catch (error) {
        console.error('Failed to fetch pre-journey data', error);
        setPreJourneyData(null);
      }
      setExpandedBooking(bookingId);
    }
  };

  useEffect(() => {
    const fetchMyRides = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('You must be logged in to view your rides');
        }
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_URL}/api/bookings/my-bookings/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Filter for confirmed bookings
          const confirmedBookings = data.filter((booking: Booking) => booking.status === 'confirmed');
          setBookings(confirmedBookings);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch your rides');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRides();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="rent-page-container">
        <div className="rent-header">
          <div className="header-content">
            <h1>My Rides</h1>
            <p>Your upcoming and past trips</p>
          </div>
        </div>

        <div className="vehicles-scroll-container">
          {loading ? (
            <div className="loading-spinner">Loading your rides...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="no-results">
              <FaCar size={40} />
              <h3>You have no upcoming rides</h3>
              <p>When you book a vehicle, it will appear here.</p>
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="booking-vehicle-info">
                    <img 
                        src={booking.image_url ? `${API_URL}${booking.image_url}` : '/car-placeholder.png'} 
                        alt={`${booking.make} ${booking.model}`} 
                        className="booking-vehicle-img"
                    />
                    <div className="vehicle-details">
                      <h3>{booking.make} {booking.model}</h3>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <FaMoneyBillWave />
                      <span>Total: ${booking.total_price}</span>
                    </div>
                  </div>

                  <button onClick={() => handleToggleDetails(booking.id)} className="btn btn-secondary">
                      {expandedBooking === booking.id ? 'Collapse' : 'Journey Details'}
                    </button>

                    {expandedBooking === booking.id && (
                      preJourneyData ? (
                        showPostJourneyForm ? (
                          <PostJourneyCheck
                            bookingId={booking.id}
                            onSuccess={() => {
                              setShowPostJourneyForm(false);
                              handleToggleDetails(booking.id);
                            }}
                          />
                        ) : (
                          <PreJourneyCheckDetails 
                            data={preJourneyData} 
                            onFinishJourney={() => setShowPostJourneyForm(true)} 
                          />
                        )
                      ) : (
                        <PreJourneyCheck 
                          bookingId={booking.id} 
                          onSuccess={() => handleToggleDetails(booking.id)} 
                        />
                      )
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

export default MyRides;
