import React, { useState } from 'react';
import {
  Cafe,
  CafeOpeningHours,
  AmenityKey,
  MenuCategory,
  MenuItem,
  CafeImage,
  DAY_NAMES,
  ALL_AMENITY_OPTIONS,
} from '../../../types';
import { SetupCompleteness } from '../../../services/ownerService';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  Sparkles,
  ArrowLeft,
  Store,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';

interface StepReviewSubmitProps {
  cafe: Cafe;
  hours: CafeOpeningHours[];
  amenities: AmenityKey[];
  categories: MenuCategory[];
  items: MenuItem[];
  images: CafeImage[];
  completeness: SetupCompleteness;
  onJumpToStep: (stepId: number) => void;
  onSubmitForApproval: () => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isSubmitting: boolean;
}

export const StepReviewSubmit: React.FC<StepReviewSubmitProps> = ({
  cafe,
  hours,
  amenities,
  categories,
  items,
  images,
  completeness,
  onJumpToStep,
  onSubmitForApproval,
  onBack,
  isSubmitting,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleFinalSubmit = async () => {
    setSubmissionError(null);
    const res = await onSubmitForApproval();
    if (!res.success) {
      setSubmissionError(res.error || 'Failed to submit application. Please try again.');
      setShowConfirmModal(false);
    }
  };

  const amenityLabels = amenities.map(
    (key) => ALL_AMENITY_OPTIONS.find((a) => a.key === key)?.label || key
  );

  return (
    <div className="space-y-6">
      {/* 1. Readiness Banner & Checklist */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  completeness.isReadyForSubmission
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}
              >
                {completeness.isReadyForSubmission ? 'Ready For Submission' : 'Setup Incomplete'}
              </span>
              <span className="text-xs text-coffee-500 font-semibold font-mono">
                Score: {completeness.score}/100
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
              Final Review & Verification
            </h3>
            <p className="text-xs text-coffee-600 mt-0.5">
              Review your venue details below before submitting for platform admin review.
            </p>
          </div>

          <div className="w-full sm:w-48 bg-cream-100 rounded-2xl p-3 border border-cream-200 text-center">
            <span className="text-2xl font-serif font-bold text-espresso-950 block">
              {completeness.score}%
            </span>
            <span className="text-[10px] text-coffee-500 uppercase tracking-wider font-bold">
              Checklist Completion
            </span>
          </div>
        </div>

        {submissionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Step-by-Step Verification Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-cream-100">
          {[
            {
              id: 1,
              label: 'Basic Profile',
              isDone: completeness.steps.basicProfile,
              desc: cafe.name ? `${cafe.name}` : 'Not provided',
            },
            {
              id: 2,
              label: 'Location & Phone',
              isDone: completeness.steps.locationContact,
              desc: cafe.address ? `${cafe.city}, ${cafe.phone}` : 'Not provided',
            },
            {
              id: 3,
              label: 'Operating Hours',
              isDone: completeness.steps.openingHours,
              desc: `${hours.filter((h) => h.is_open).length} days open`,
            },
            {
              id: 4,
              label: 'Amenities',
              isDone: completeness.steps.amenities,
              desc: `${amenities.length} amenities enabled`,
            },
            {
              id: 5,
              label: 'Menu Categories',
              isDone: categories.length > 0,
              desc: `${categories.length} categories created`,
            },
            {
              id: 6,
              label: 'Menu Items',
              isDone: items.length > 0,
              desc: `${items.length} items cataloged`,
            },
          ].map((check) => (
            <button
              key={check.id}
              type="button"
              onClick={() => onJumpToStep(check.id)}
              className="p-3 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-cream-100/70 text-left transition-all flex items-center justify-between gap-2 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    check.isDone ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {check.isDone ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-espresso-950 block truncate">{check.label}</span>
                  <span className="text-[10px] text-coffee-500 truncate block">{check.desc}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-coffee-400 group-hover:text-espresso-900 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        {/* Missing Requirements Warning */}
        {!completeness.isReadyForSubmission && completeness.missingRequirements.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Required before submission:</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px] pl-1">
              {completeness.missingRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Comprehensive Details Preview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Location Card */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h4 className="text-sm font-bold text-espresso-950 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              <span>Store Profile</span>
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-coffee-400 block text-[10px]">Cafe Name</span>
              <span className="font-bold text-espresso-950 text-sm">{cafe.name}</span>
            </div>
            {cafe.tagline && (
              <div>
                <span className="text-coffee-400 block text-[10px]">Tagline</span>
                <span className="text-coffee-700 italic">{cafe.tagline}</span>
              </div>
            )}
            <div>
              <span className="text-coffee-400 block text-[10px]">Description</span>
              <p className="text-coffee-700 line-clamp-3 leading-relaxed">{cafe.description}</p>
            </div>
            <div className="pt-2 border-t border-cream-100 space-y-1.5">
              <div className="flex items-center gap-2 text-coffee-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{cafe.address}, {cafe.city}, {cafe.state} {cafe.postal_code}</span>
              </div>
              <div className="flex items-center gap-2 text-coffee-700">
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{cafe.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-coffee-700">
                <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{cafe.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Card */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h4 className="text-sm font-bold text-espresso-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Operating Hours</span>
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            {hours.map((h) => (
              <div key={h.day_of_week} className="flex items-center justify-between py-1 border-b border-cream-50 last:border-0">
                <span className="font-semibold text-espresso-900">{DAY_NAMES[h.day_of_week]}</span>
                <span className="text-coffee-600">
                  {h.is_open ? `${h.open_time} - ${h.close_time}` : <span className="text-coffee-400 italic">Closed</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Card */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h4 className="text-sm font-bold text-espresso-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Enabled Amenities ({amenityLabels.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {amenityLabels.map((lbl, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-cream-100 rounded-full text-xs font-semibold text-espresso-900 border border-cream-200"
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>

        {/* Menu & Photos Summary */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h4 className="text-sm font-bold text-espresso-950 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Menu & Photos Overview</span>
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Edit Menu
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <span className="text-2xl font-serif font-bold text-espresso-950 block">{categories.length}</span>
              <span className="text-[10px] text-coffee-500 font-bold uppercase tracking-wider">Categories</span>
            </div>
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <span className="text-2xl font-serif font-bold text-espresso-950 block">{items.length}</span>
              <span className="text-[10px] text-coffee-500 font-bold uppercase tracking-wider">Menu Items</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-coffee-600">
            <span>Atmosphere Photos: <strong>{images.length} uploaded</strong></span>
            <button
              type="button"
              onClick={() => onJumpToStep(7)}
              className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
            >
              Manage Photos
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-cream-200 shadow-warm-xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-lg font-serif font-bold text-espresso-950">
                Submit Cafe for Admin Review?
              </h4>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Your cafe details will be locked for review by the CafeHub operations team. Verification usually takes 24 to 48 hours.
              </p>
            </div>

            <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-coffee-700 space-y-1">
              <div className="flex justify-between">
                <span>Cafe:</span>
                <span className="font-bold text-espresso-950">{cafe.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-bold text-espresso-950">{cafe.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Catalog:</span>
                <span className="font-bold text-espresso-950">{items.length} items</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-xs font-bold text-coffee-700 hover:bg-cream-100 rounded-xl transition-colors cursor-pointer"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-warm cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-xs font-bold text-coffee-700 hover:text-espresso-950 hover:bg-cream-100 rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photos</span>
        </button>

        <button
          type="button"
          disabled={!completeness.isReadyForSubmission || isSubmitting}
          onClick={() => setShowConfirmModal(true)}
          className={`px-7 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-warm flex items-center gap-2 cursor-pointer ${
            completeness.isReadyForSubmission
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-warm-md'
              : 'bg-cream-200 text-coffee-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit for Approval</span>
        </button>
      </div>
    </div>
  );
};
