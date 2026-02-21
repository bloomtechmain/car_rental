import { useState, useEffect } from 'react';
import API_URL from '../api';

interface JourneyDetails {
  mileage_before: number;
  notes_before: string;
  images: string[];
  mileage_after: number;
  notes_after: string;
  post_images: string[];
}

interface JourneyDetailsModalProps {
  bookingId: number;
  onClose: () => void;
}

const JourneyDetailsModal = ({ bookingId, onClose }: JourneyDetailsModalProps) => {
  const [details, setDetails] = useState<JourneyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pre-journey-checks/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch journey details');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Journey Details</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-spinner">Loading details...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : details ? (
            <div className="journey-details-grid">
              <div className="journey-details-section">
                <h3>Before Journey</h3>
                <p><strong>Mileage:</strong> {details.mileage_before} km</p>
                <p><strong>Notes:</strong> {details.notes_before}</p>
                <div className="image-gallery">
                  {details.images && details.images.map((img, index) => (
                    <img key={index} src={`${API_URL}/${img}`} alt={`Before journey ${index + 1}`} />
                  ))}
                </div>
              </div>
              <div className="journey-details-section">
                <h3>After Journey</h3>
                <p><strong>Mileage:</strong> {details.mileage_after} km</p>
                <p><strong>Notes:</strong> {details.notes_after}</p>
                <div className="image-gallery">
                  {details.post_images && details.post_images.map((img, index) => (
                    <img key={index} src={`${API_URL}/${img}`} alt={`After journey ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No journey details found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyDetailsModal;
