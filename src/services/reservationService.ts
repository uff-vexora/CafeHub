import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Reservation, ReservationStatus, Cafe } from '../types';
import { SEED_RESERVATIONS, SEED_CAFES } from '../data/seedData';

// Fallback in-memory storage for offline / mock testing
const localMockReservations: Reservation[] = [...SEED_RESERVATIONS];
const localSeedCafes = [...SEED_CAFES];

export interface CreateReservationParams {
  userId: string;
  cafeId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
}

export const reservationService = {
  /**
   * 1. Create Reservation
   * Persists to Supabase with strict validation
   */
  async createReservation(params: CreateReservationParams): Promise<{
    success: boolean;
    reservation?: Reservation;
    error?: string;
  }> {
    const {
      userId,
      cafeId,
      guestName,
      guestEmail,
      guestPhone,
      guestCount,
      reservationDate,
      reservationTime,
      specialRequests,
    } = params;

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      return { success: false, error: 'Please provide full guest details (name, email, phone).' };
    }

    if (!guestCount || guestCount < 1 || guestCount > 20) {
      return { success: false, error: 'Guest count must be between 1 and 20 guests.' };
    }

    if (!reservationDate) {
      return { success: false, error: 'Please select a valid reservation date.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (reservationDate < todayStr) {
      return { success: false, error: 'Reservations cannot be booked for past dates.' };
    }

    if (!reservationTime) {
      return { success: false, error: 'Please choose an available dining time slot.' };
    }

    // Step A: Validate Cafe exists and is approved
    let cafeData: Cafe | null = null;

    if (isSupabaseConfigured) {
      const { data: cafe, error: cafeErr } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (cafeErr || !cafe) {
        return { success: false, error: 'Target cafe does not exist.' };
      }

      if (!cafe.is_approved || (cafe.status && cafe.status !== 'approved')) {
        return { success: false, error: 'This cafe is not currently taking public reservations.' };
      }

      cafeData = cafe as Cafe;
    } else {
      const cafe = localSeedCafes.find((c) => c.id === cafeId);
      if (!cafe) {
        return { success: false, error: 'Target cafe does not exist.' };
      }
      if (!cafe.is_approved || (cafe.status && cafe.status !== 'approved')) {
        return { success: false, error: 'This cafe is not currently taking public reservations.' };
      }
      cafeData = cafe;
    }

    const reservationCode = `RES-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservation_code: reservationCode,
      user_id: userId,
      cafe_id: cafeId,
      cafe_name: cafeData.name,
      cafe_image: cafeData.cover_image,
      cafe_address: cafeData.address,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim(),
      guest_count: guestCount,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      special_requests: specialRequests?.trim() || undefined,
      status: 'pending', // Starts in pending review by cafe owner
      created_at: new Date().toISOString(),
    };

    // Step B: Persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: dbRes, error: dbErr } = await supabase
          .from('reservations')
          .insert({
            reservation_code: newRes.reservation_code,
            user_id: newRes.user_id,
            cafe_id: newRes.cafe_id,
            guest_name: newRes.guest_name,
            guest_email: newRes.guest_email,
            guest_phone: newRes.guest_phone,
            guest_count: newRes.guest_count,
            reservation_date: newRes.reservation_date,
            reservation_time: newRes.reservation_time,
            special_requests: newRes.special_requests,
            status: newRes.status,
          })
          .select()
          .single();

        if (dbErr || !dbRes) {
          console.error('Reservation creation DB error:', dbErr);
          return { success: false, error: dbErr?.message || 'Failed to save reservation to database.' };
        }

        newRes.id = dbRes.id;
      } catch (err: any) {
        console.error('Reservation exception:', err);
        return { success: false, error: err?.message || 'Failed to record reservation.' };
      }
    }

    localMockReservations.unshift(newRes);
    return { success: true, reservation: newRes };
  },

  /**
   * 2. Update Reservation Status
   * Customers can cancel their own; Owners can accept, reject, seat/complete, cancel
   */
  async updateReservationStatus(
    reservationId: string,
    newStatus: ReservationStatus,
    operator: { userId: string; role: string; ownedCafeIds: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    let targetRes: Reservation | undefined;

    if (isSupabaseConfigured) {
      const { data: dbRes, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (error || !dbRes) {
        return { success: false, error: 'Reservation record not found.' };
      }
      targetRes = dbRes as Reservation;
    } else {
      targetRes = localMockReservations.find((r) => r.id === reservationId);
      if (!targetRes) {
        return { success: false, error: 'Reservation not found.' };
      }
    }

    // Authorization checks
    if (operator.role === 'customer') {
      if (targetRes.user_id !== operator.userId) {
        return { success: false, error: 'Access Denied: You cannot modify another customer’s reservation.' };
      }
      if (newStatus !== 'cancelled') {
        return { success: false, error: 'Customers are only permitted to cancel their reservation.' };
      }
    } else if (operator.role === 'cafe_owner') {
      if (!operator.ownedCafeIds.includes(targetRes.cafe_id)) {
        return { success: false, error: 'Access Denied: You do not own the cafe associated with this reservation.' };
      }
    }

    // Persist to Supabase
    if (isSupabaseConfigured) {
      const { error: updateErr } = await supabase
        .from('reservations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
    }

    // Local fallback update
    const idx = localMockReservations.findIndex((r) => r.id === reservationId);
    if (idx > -1) {
      localMockReservations[idx].status = newStatus;
    }

    return { success: true };
  },

  /**
   * 3. Fetch Reservations
   */
  async getReservations(operator: {
    userId?: string;
    role?: string;
    ownedCafeIds?: string[];
  }): Promise<{ success: boolean; reservations: Reservation[]; error?: string }> {
    if (!operator.userId) {
      return { success: true, reservations: [] };
    }

    if (!isSupabaseConfigured) {
      if (operator.role === 'admin') {
        return { success: true, reservations: [...localMockReservations] };
      }
      if (operator.role === 'cafe_owner') {
        const owned = operator.ownedCafeIds || [];
        return {
          success: true,
          reservations: localMockReservations.filter((r) => owned.includes(r.cafe_id)),
        };
      }
      return {
        success: true,
        reservations: localMockReservations.filter((r) => r.user_id === operator.userId),
      };
    }

    try {
      let query = supabase.from('reservations').select('*');

      if (operator.role === 'admin') {
        // Admin sees all
      } else if (operator.role === 'cafe_owner') {
        const owned = operator.ownedCafeIds || [];
        if (owned.length === 0) return { success: true, reservations: [] };
        query = query.in('cafe_id', owned);
      } else {
        query = query.eq('user_id', operator.userId);
      }

      const { data, error } = await query.order('reservation_date', { ascending: false });

      if (error) {
        return { success: false, reservations: [], error: error.message };
      }

      return { success: true, reservations: (data || []) as Reservation[] };
    } catch (err: any) {
      return { success: false, reservations: [], error: err?.message };
    }
  },
};
