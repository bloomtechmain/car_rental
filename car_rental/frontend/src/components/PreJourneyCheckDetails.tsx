import React from 'react';
import API_URL from '../api';

interface PreJourneyCheckDetailsProps {
  data: {
    mileage_before: number;
    mileage_after: number;
    notes_before: string;
    notes_after: string;
    images: string[];
    post_images: string[];
  };
  onFinishJourney: () => void;
}

const PreJourneyCheckDetails: React.FC<PreJourneyCheckDetailsProps> = ({ data, onFinishJourney }) => {
  return (
    <div className="pre-journey-details-container">
      <h4>Pre-Journey Details</h4>
      <div className="details-group">
        <strong>Mileage Before:</strong>
        <p>{data.mileage_before} km</p>
      </div>
      <div className="details-group">
        <strong>Notes:</strong>
        <p>{data.notes_before || 'No notes provided.'}</p>
      </div>
      <div className="details-group">
        <strong>Images:</strong>
        <div className="image-gallery">
          {data.images && data.images.length > 0 ? (
            data.images.map((imageUrl, index) => (
              <a key={index} href={`${API_URL}${imageUrl}`} target="_blank" rel="noopener noreferrer">
                <img src={`${API_URL}${imageUrl}`} alt={`Pre-journey image ${index + 1}`} />
              </a>
            ))
          ) : (
            <p>No images were uploaded.</p>
          )}
        </div>
      </div>

      {data.mileage_after ? (
        <>
          <h4>Post-Journey Details</h4>
          <div className="details-group">
            <strong>Mileage After:</strong>
            <p>{data.mileage_after} km</p>
          </div>
          <div className="details-group">
            <strong>Notes:</strong>
            <p>{data.notes_after || 'No notes provided.'}</p>
          </div>

          <div className="details-group">
            <strong>Images:</strong>
            <div className="image-gallery">
              {data.post_images && data.post_images.length > 0 ? (
                data.post_images.map((imageUrl, index) => (
                  <a key={index} href={`${API_URL}${imageUrl}`} target="_blank" rel="noopener noreferrer">
                    <img src={`${API_URL}${imageUrl}`} alt={`Post-journey image ${index + 1}`} />
                  </a>
                ))
              ) : (
                <p>No images were uploaded.</p>
              )}
            </div>
          </div>

          <div className="trip-summary">
            <h4>Trip Summary</h4>
            <div className="summary-item">
              <span>Total Distance:</span>
              <strong>{data.mileage_after - data.mileage_before} km</strong>
            </div>
          </div>
        </>
      ) : (
        <button onClick={onFinishJourney} className="btn">
          Finish Journey
        </button>
      )}
    </div>
  );
};

export default PreJourneyCheckDetails;
