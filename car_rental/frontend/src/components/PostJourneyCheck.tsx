import { useState } from 'react';
import API_URL from '../api';

interface PostJourneyCheckProps {
  bookingId: string;
  onSuccess: () => void;
}

const PostJourneyCheck = ({ bookingId, onSuccess }: PostJourneyCheckProps) => {
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('mileage_after', mileage);
    formData.append('notes_after', notes);
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await fetch(`${API_URL}/api/post-journey-checks`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit post-journey check');
      }

      alert('Post-journey check submitted successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pre-journey-form-container">
      <h3>Post-Journey Check</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mileage After</label>
          <input 
            type="number" 
            value={mileage} 
            onChange={(e) => setMileage(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., any new scratches, fuel level, etc."
          />
        </div>
        <div className="form-group">
          <label>Upload Images</label>
          <input 
            type="file" 
            multiple 
            onChange={handleImageChange} 
            accept="image/*" 
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Finishing...' : 'Finish Journey'}
        </button>
      </form>
    </div>
  );
};

export default PostJourneyCheck;
