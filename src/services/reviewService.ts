import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Review } from '../types';
import { SEED_REVIEWS } from '../data/seedData';

// Fallback in-memory storage for offline / mock testing
const localMockReviews: Review[] = [...SEED_REVIEWS];

export interface AddReviewParams {
  userId: string;
  cafeId: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
}

export const reviewService = {
  /**
   * 1. Add or Update Review
   * Prevents duplicates per user-cafe pair; updates cafe rating aggregates
   */
  async addReview(params: AddReviewParams): Promise<{ success: boolean; review?: Review; error?: string }> {
    const { userId, cafeId, rating, comment, userName, userAvatar } = params;

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5 stars.' };
    }

    if (!comment || !comment.trim()) {
      return { success: false, error: 'Please enter a review description.' };
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      user_id: userId,
      cafe_id: cafeId,
      rating: Math.round(rating),
      comment: comment.trim(),
      user_name: userName,
      user_avatar: userAvatar,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        // Check if user already reviewed this cafe (UNIQUE constraint enforcement)
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', userId)
          .eq('cafe_id', cafeId)
          .maybeSingle();

        if (existingReview) {
          // Update existing review
          const { data: updated, error: updateErr } = await supabase
            .from('reviews')
            .update({
              rating: newReview.rating,
              comment: newReview.comment,
              user_name: newReview.user_name,
              user_avatar: newReview.user_avatar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingReview.id)
            .select()
            .single();

          if (updateErr) {
            return { success: false, error: updateErr.message };
          }
          newReview.id = updated.id;
        } else {
          // Insert new review
          const { data: inserted, error: insertErr } = await supabase
            .from('reviews')
            .insert({
              user_id: newReview.user_id,
              cafe_id: newReview.cafe_id,
              rating: newReview.rating,
              comment: newReview.comment,
              user_name: newReview.user_name,
              user_avatar: newReview.user_avatar,
            })
            .select()
            .single();

          if (insertErr) {
            return { success: false, error: insertErr.message };
          }
          newReview.id = inserted.id;
        }

        // Recompute cafe rating in Supabase
        const { data: allCafeReviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('cafe_id', cafeId);

        if (allCafeReviews && allCafeReviews.length > 0) {
          const avg = allCafeReviews.reduce((sum, r) => sum + r.rating, 0) / allCafeReviews.length;
          await supabase
            .from('cafes')
            .update({
              rating: Number(avg.toFixed(1)),
              review_count: allCafeReviews.length,
            })
            .eq('id', cafeId);
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to persist review.' };
      }
    }

    // Local fallback update
    const existingIdx = localMockReviews.findIndex(
      (r) => r.user_id === userId && r.cafe_id === cafeId
    );
    if (existingIdx > -1) {
      localMockReviews[existingIdx] = {
        ...localMockReviews[existingIdx],
        rating: newReview.rating,
        comment: newReview.comment,
      };
    } else {
      localMockReviews.unshift(newReview);
    }

    return { success: true, review: newReview };
  },

  /**
   * 2. Merchant Reply to Review
   */
  async replyToReview(
    reviewId: string,
    replyText: string,
    operator: { userId: string; role: string; ownedCafeIds: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    if (!replyText.trim()) {
      return { success: false, error: 'Reply text cannot be empty.' };
    }

    let targetRev: Review | undefined;

    if (isSupabaseConfigured) {
      const { data: dbRev, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error || !dbRev) {
        return { success: false, error: 'Review not found.' };
      }
      targetRev = dbRev as Review;
    } else {
      targetRev = localMockReviews.find((r) => r.id === reviewId);
      if (!targetRev) {
        return { success: false, error: 'Review not found.' };
      }
    }

    // Security: Only cafe owner of that cafe or admin can reply
    if (operator.role !== 'admin' && !operator.ownedCafeIds.includes(targetRev.cafe_id)) {
      return { success: false, error: 'Access Denied: You cannot reply to reviews for another cafe.' };
    }

    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const { error: updateErr } = await supabase
        .from('reviews')
        .update({
          owner_response: replyText.trim(),
          owner_responded_at: now,
          updated_at: now,
        })
        .eq('id', reviewId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
    }

    const idx = localMockReviews.findIndex((r) => r.id === reviewId);
    if (idx > -1) {
      localMockReviews[idx].owner_response = replyText.trim();
      localMockReviews[idx].owner_responded_at = now;
    }

    return { success: true };
  },

  /**
   * 3. Admin Delete / Moderate Review
   */
  async deleteReview(
    reviewId: string,
    operator: { role: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (operator.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can moderate reviews.' };
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) {
        return { success: false, error: error.message };
      }
    }

    const idx = localMockReviews.findIndex((r) => r.id === reviewId);
    if (idx > -1) {
      localMockReviews.splice(idx, 1);
    }

    return { success: true };
  },

  /**
   * 4. Get Reviews
   */
  async getReviews(cafeId?: string): Promise<{ success: boolean; reviews: Review[]; error?: string }> {
    if (!isSupabaseConfigured) {
      if (cafeId) {
        return { success: true, reviews: localMockReviews.filter((r) => r.cafe_id === cafeId) };
      }
      return { success: true, reviews: [...localMockReviews] };
    }

    try {
      let query = supabase.from('reviews').select('*');
      if (cafeId) {
        query = query.eq('cafe_id', cafeId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        return { success: false, reviews: [], error: error.message };
      }
      return { success: true, reviews: (data || []) as Review[] };
    } catch (err: any) {
      return { success: false, reviews: [], error: err?.message };
    }
  },
};
