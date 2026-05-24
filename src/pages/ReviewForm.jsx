import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Upload, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_BASE_URL } from '../config/constants';
import Testimonials from '../components/Testimonials';

const MySwal = withReactContent(Swal);

export default function ReviewForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchReviewContext = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/testimonials/review/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Invalid or expired token.');
        } else {
          setBookingData(data);
        }
      } catch (err) {
        setError('Failed to load review context.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviewContext();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        MySwal.fire('Too Large', 'Image must be under 5MB', 'error');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('rating', rating);
      formData.append('review', review);
      formData.append('client_name', bookingData.client_name);
      formData.append('role', bookingData.booking_event); // Use event name as role context
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`${API_BASE_URL}/api/testimonials/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        MySwal.fire({
          icon: 'success',
          title: 'Thank You!',
          text: 'Your review has been submitted successfully.',
          confirmButtonColor: '#0f172a'
        }).then(() => {
          navigate('/');
        });
      } else {
        MySwal.fire('Error', data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-slate-800 opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-slate-800 opacity-50"></div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 relative z-10">How did we do?</h1>
          <p className="text-slate-300 relative z-10">
            Hi {bookingData?.client_name}, we'd love to hear about your experience with Falguni!
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Star Rating */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Rate Your Experience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-all hover:scale-110 focus:outline-none ${star <= rating ? 'text-amber-400 drop-shadow-md' : 'text-slate-200'}`}
                  >
                    <Star size={40} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Your Review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none resize-none h-32"
                placeholder="Tell us what you liked (or what we can improve)..."
              ></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Share a Photo (Optional)</label>
              <div 
                className={`border-2 border-dashed rounded-2xl transition-colors relative overflow-hidden group ${preview ? 'border-slate-300 bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <div className="relative aspect-video w-full flex items-center justify-center p-2">
                    <img src={preview} alt="Preview" className="max-h-[200px] rounded-xl shadow-md object-contain z-0" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-sm flex items-center gap-2">
                        <Upload size={16} /> Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon size={40} className="text-slate-300 mb-3" />
                    <p className="font-medium">Click or drag a photo here</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !review.trim()}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Review <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Show existing testimonials below the form as requested */}
      <div className="mt-16 w-full">
        <Testimonials theme="wedding" />
      </div>
    </div>
  );
}
