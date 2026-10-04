import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TableBookingModal } from '../components/modals/TableBookingModal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Cafe, Reservation } from '../types';

export const ReservationsPage: React.FC = () => {
  const { reservations, cancelReservation, cafes } = useData();
  const { user } = useAuth();
  const [selectedCafeForBooking, setSelectedCafeForBooking] = useState<Cafe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date().toISOString().split('T')[0];

  const userReservations = reservations.filter((r) => r.user_id === user?.id);

  const upcomingReservations = userReservations.filter(
    (r) => r.reservation_date >= now && r.status !== 'cancelled'
  );
  const pastReservations = userReservations.filter(
    (r) => r.reservation_date < now || r.status === 'cancelled' || r.status === 'completed'
  );

  const displayedList = activeTab === 'upcoming' ? upcomingReservations : pastReservations;

  const handleOpenBooking = (cafe?: Cafe) => {
    setSelectedCafeForBooking(cafe || cafes[0]);
    setIsModalOpen(true);
  };

  const handleCancel = (resId: string) => {
    const confirm = window.confirm('Are you sure you want to cancel this table reservation?');
    if (confirm) {
      cancelReservation(resId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            Table Reservations
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
            Your Cafe Bookings
          </h1>
          <p className="text-xs text-coffee-600 mt-1">
            Zero-wait table reservations across India's top specialty cafes.
          </p>
        </div>

        <button
          onClick={() => handleOpenBooking()}
          className="px-5 py-3 rounded-2xl bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs sm:text-sm shadow-warm flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book a New Table</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cream-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'upcoming' ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          Upcoming Bookings ({upcomingReservations.length})
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'past' ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          Past & Cancelled ({pastReservations.length})
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Reservations List */}
      {displayedList.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} reservations`}
          description={
            activeTab === 'upcoming'
              ? 'You have no upcoming table reservations. Book a cozy table at your favorite cafe today.'
              : 'You have no past reservation history.'
          }
          actionText="Browse Cafes & Book Table"
          onAction={() => handleOpenBooking()}
          icon={<Calendar className="w-8 h-8 text-terracotta-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedList.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl border border-cream-200 p-6 shadow-warm hover:shadow-warm-lg transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={res.cafe_image}
                    alt={res.cafe_name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-cream-100"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base text-espresso-950">
                      {res.cafe_name}
                    </h3>
                    <p className="text-xs text-coffee-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                      {res.cafe_address}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    res.status === 'confirmed'
                      ? 'success'
                      : res.status === 'completed'
                      ? 'primary'
                      : res.status === 'cancelled'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {res.status.toUpperCase()}
                </Badge>
              </div>

              {/* Grid of info pills */}
              <div className="grid grid-cols-3 gap-2 bg-cream-50 p-3.5 rounded-2xl border border-cream-200 text-xs text-espresso-900">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-coffee-500 font-semibold uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-terracotta-600" /> Date
                  </span>
                  <div className="font-bold">{res.reservation_date}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-coffee-500 font-semibold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-terracotta-600" /> Time
                  </span>
                  <div className="font-bold">{res.reservation_time}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-coffee-500 font-semibold uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-terracotta-600" /> Guests
                  </span>
                  <div className="font-bold">{res.guest_count} Guests</div>
                </div>
              </div>

              {/* Booking Code & Actions */}
              <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-coffee-500 text-[11px]">Booking Code: </span>
                  <span className="font-mono font-bold text-espresso-900">{res.reservation_code}</span>
                </div>

                <div className="flex items-center gap-2">
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <Link
                    to={`/cafes/${res.cafe_id}`}
                    className="text-xs font-bold text-espresso-900 hover:text-terracotta-600 flex items-center gap-1"
                  >
                    View Cafe <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <TableBookingModal
        cafe={selectedCafeForBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
