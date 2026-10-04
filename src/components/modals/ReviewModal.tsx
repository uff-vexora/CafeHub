import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ReviewModalProps {
  cafeId: string;
  cafeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  cafeId,
  cafeName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { addReview } = useData();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.full_name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      cafe_id: cafeId,
      rating,
      comment: comment.trim(),
      user_avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    });

    onClose();
    setComment('');
    setRating(5);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Review" maxWidth="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <span className="text-xs text-coffee-500 uppercase tracking-wider font-semibold">
            Rating for
          </span>
          <h4 className="font-serif font-bold text-lg text-espresso-950 mt-0.5">
            {cafeName}
          </h4>
        </div>

        {/* Star Rating Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-espresso-900">Your Overall Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      active ? 'fill-amber-400 text-amber-500' : 'text-cream-300'
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-sm font-bold text-espresso-800 ml-2">
              {rating === 5 ? 'Exceptional! 🌟' : rating === 4 ? 'Very Good! 👍' : rating === 3 ? 'Average' : 'Could be better'}
            </span>
          </div>
        </div>

        {/* Reviewer Name */}
        <div>
          <label className="text-xs font-bold text-espresso-900">Your Name</label>
          <input
            type="text"
            required
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="e.g. Aravind Sharma"
            className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-espresso-900 outline-none"
          />
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="text-xs font-bold text-espresso-900">Your Experience</label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what you ordered, the coffee brew quality, vibes, service, or seating..."
            className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl p-3.5 text-xs text-espresso-900 outline-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>Post Review</span>
        </button>
      </form>
    </Modal>
  );
};
