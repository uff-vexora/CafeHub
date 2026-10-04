import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Cafe } from '../../types';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface TableBookingModalProps {
  cafe: Cafe | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '08:30 AM',
  '09:30 AM',
  '11:00 AM',
  '12:30 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
  '08:30 PM',
  '09:30 PM',
];

export const TableBookingModal: React.FC<TableBookingModalProps> = ({
  cafe,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { createReservation } = useData();

  // Generate next 10 days for selection
  const today = new Date();
  const dateOptions = Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].iso);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[3]); // 12:30 PM
  const [guestCount, setGuestCount] = useState(2);
  const [guestName, setGuestName] = useState(user?.full_name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedReservationCode, setConfirmedReservationCode] = useState('');

  if (!cafe) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) return;

    const res = createReservation({
      cafe_id: cafe.id,
      cafe_name: cafe.name,
      cafe_image: cafe.cover_image,
      cafe_address: cafe.address,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      guest_count: guestCount,
      reservation_date: selectedDate,
      reservation_time: selectedTime,
      special_requests: specialRequests.trim() || undefined,
    });

    if (res.success && res.reservation) {
      setConfirmedReservationCode(res.reservation.reservation_code);
      setIsSuccess(true);
    } else {
      setConfirmedReservationCode(`RES-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSuccess(true);
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DE6441', '#8C6543', '#E2971B', '#FDFBF7'],
    });
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} title={isSuccess ? undefined : 'Book a Table'} maxWidth="lg">
      {isSuccess ? (
        <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-warm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Booking Confirmed
            </span>
            <h3 className="text-2xl font-serif font-bold text-espresso-950 mt-3">
              Table Reserved at {cafe.name}
            </h3>
            <p className="text-xs text-coffee-600 mt-1 max-w-sm mx-auto">
              Your table is guaranteed. A confirmation SMS & email have been simulated and sent to {guestEmail}.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-cream-50 p-5 rounded-2xl border border-cream-200 text-left space-y-3 max-w-md mx-auto text-xs">
            <div className="flex justify-between pb-2 border-b border-cream-200">
              <span className="text-coffee-500">Booking Code:</span>
              <span className="font-mono font-bold text-espresso-900">{confirmedReservationCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Date & Time:</span>
              <span className="font-bold text-espresso-900">{selectedDate} at {selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Guests:</span>
              <span className="font-bold text-espresso-900">{guestCount} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Reserved For:</span>
              <span className="font-bold text-espresso-900">{guestName} ({guestPhone})</span>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-full max-w-md mx-auto py-3 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-sm rounded-2xl shadow-warm transition-all"
          >
            Done & Return to Cafe
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cafe Mini Banner */}
          <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200">
            <img
              src={cafe.cover_image}
              alt={cafe.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-serif font-bold text-sm text-espresso-950">{cafe.name}</h4>
              <p className="text-[11px] text-coffee-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-terracotta-500" />
                {cafe.address}
              </p>
            </div>
          </div>

          {/* Date Picker (Horizontal pill carousel) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-coffee-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-terracotta-500" />
              1. Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dateOptions.map((opt) => {
                const isSelected = selectedDate === opt.iso;
                return (
                  <button
                    key={opt.iso}
                    type="button"
                    onClick={() => setSelectedDate(opt.iso)}
                    className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-espresso-900 text-white border-espresso-900 shadow-warm'
                        : 'bg-cream-50 hover:bg-cream-100 text-espresso-800 border-cream-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold opacity-75">{opt.dayName}</div>
                    <div className="text-xs font-bold mt-0.5">{opt.dateFormatted}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-coffee-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-terracotta-500" />
              2. Available Time Slot
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                      isSelected
                        ? 'bg-terracotta-600 text-white border-terracotta-600 shadow-sm'
                        : 'bg-white hover:bg-cream-100 text-espresso-800 border-cream-200'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-coffee-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-terracotta-500" />
              3. Number of Guests
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => {
                const isSelected = guestCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuestCount(num)}
                    className={`w-10 h-10 rounded-xl font-bold text-xs border transition-all ${
                      isSelected
                        ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                        : 'bg-white hover:bg-cream-100 text-espresso-800 border-cream-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-2 border-t border-cream-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-coffee-500">
              4. Guest Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-coffee-600">Full Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Aravind Sharma"
                  className="w-full mt-1 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-espresso-900 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-coffee-600">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full mt-1 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-espresso-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-600">Email Address *</label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="e.g. aravind@example.com"
                className="w-full mt-1 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-espresso-900 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-600">
                Special Requests (Optional)
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet corner, anniversary decor, high chair..."
                className="w-full mt-1 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-espresso-900 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm rounded-2xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Free Table Reservation</span>
            </button>
            <p className="text-[11px] text-center text-coffee-400 mt-2">
              No deposit required. Instant confirmation with SMS & in-app updates.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
