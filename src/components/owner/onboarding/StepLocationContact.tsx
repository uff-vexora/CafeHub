import React, { useState, useEffect } from 'react';
import { Cafe } from '../../../types';
import { MapPin, Phone, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepLocationContactProps {
  cafe: Cafe;
  onSave: (data: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
  }) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isSaving: boolean;
}

const COMMON_INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'West Bengal',
  'Gujarat',
  'Goa',
  'Rajasthan',
  'Kerala',
  'Punjab',
  'Uttar Pradesh',
];

export const StepLocationContact: React.FC<StepLocationContactProps> = ({
  cafe,
  onSave,
  onBack,
  isSaving,
}) => {
  const [address, setAddress] = useState(cafe.address || '');
  const [city, setCity] = useState(cafe.city || 'Mumbai');
  const [state, setState] = useState(cafe.state || 'Maharashtra');
  const [postalCode, setPostalCode] = useState(cafe.postal_code || '');
  const [phone, setPhone] = useState(cafe.phone || '');
  const [email, setEmail] = useState(cafe.email || '');
  const [latitude, setLatitude] = useState<number>(cafe.latitude || 19.076);
  const [longitude, setLongitude] = useState<number>(cafe.longitude || 72.8777);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cafe) {
      setAddress(cafe.address || '');
      setCity(cafe.city || 'Mumbai');
      setState(cafe.state || 'Maharashtra');
      setPostalCode(cafe.postal_code || '');
      setPhone(cafe.phone || '');
      setEmail(cafe.email || '');
      if (cafe.latitude) setLatitude(cafe.latitude);
      if (cafe.longitude) setLongitude(cafe.longitude);
    }
  }, [cafe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanAddress || cleanAddress.length < 5) {
      setError('Please provide a complete street address of at least 5 characters.');
      return;
    }

    if (!cleanCity || cleanCity.length < 2) {
      setError('City name is required.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please provide a valid contact phone number with at least 8 digits.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please provide a valid contact email address.');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180 degrees.');
      return;
    }

    const res = await onSave({
      address: cleanAddress,
      city: cleanCity,
      state: state.trim() || 'Maharashtra',
      postal_code: postalCode.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      latitude,
      longitude,
    });

    if (!res.success) {
      setError(res.error || 'Failed to update location and contact information.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div>
          <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>Location & Contact Details</span>
          </h3>
          <p className="text-xs text-coffee-600 mt-1">
            Diners and delivery drivers will use these details to find and reach your cafe.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-espresso-900 mb-1.5">
            Street Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ground Floor, 21 Chapel Road, Bandra West"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* City & State & Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai, Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
            >
              {COMMON_INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1.5">Postal / PIN Code</label>
            <input
              type="text"
              placeholder="e.g. 400050"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1.5">
              Primary Store Phone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="e.g. +91 98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
              />
            </div>
            <p className="text-[11px] text-coffee-400 mt-1">Used for order alerts and diner calls.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1.5">
              Store Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="e.g. orders@mycafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cream-50 border border-cream-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
              />
            </div>
            <p className="text-[11px] text-coffee-400 mt-1">For official notifications and invoices.</p>
          </div>
        </div>

        {/* Map Coordinates (Optional / Defaults provided) */}
        <div className="pt-2 border-t border-cream-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-espresso-900">Map Coordinates (GPS)</span>
            <span className="text-[10px] text-coffee-500">Auto-calculated or custom pin</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-coffee-600 mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs text-espresso-950 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-coffee-600 mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs text-espresso-950 font-mono outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-xs font-bold text-coffee-700 hover:text-espresso-950 hover:bg-cream-100 rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Basics</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-warm hover:shadow-warm-md flex items-center gap-2 text-xs cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
