import { useState, useEffect } from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import API_URL from '../api';

import JourneyDetailsModal from '../components/JourneyDetailsModal';

interface Notification {
  id: string;
  booking_id: number;
  make: string;
  model: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    throw new Error('You must be logged in to view notifications');
                }
                const user = JSON.parse(userStr);

                const response = await fetch(`${API_URL}/api/notifications/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch notifications');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);



  return (
    <AuthenticatedLayout>
      <div className="rent-page-container">
        <div className="rent-header">
          <div className="header-content">
            <h1>Notifications</h1>
            <p>Your recent account activity</p>
          </div>
        </div>

        <div className="notifications-container">
          {loading ? (
            <div className="loading-spinner">Loading notifications...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="no-results">
              <h3>You have no new notifications</h3>
              <p>When you have new activity, it will appear here.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.is_read ? 'read' : 'unread'}`} onClick={() => setSelectedBookingId(notification.booking_id)}>
                  <div className="notification-header">
                    <span className="notification-title">Journey Completed</span>
                    <span className="notification-time">{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                  <div className="notification-body">
                    <p>Your <strong>{notification.make} {notification.model}</strong> has completed its journey.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBookingId && (
          <JourneyDetailsModal bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Notifications;
