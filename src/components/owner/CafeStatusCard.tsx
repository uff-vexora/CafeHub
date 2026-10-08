import React from 'react';
import { Cafe, CafeStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Store,
  ArrowRight,
  ShieldCheck,
  Mail,
  Edit3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CafeStatusCardProps {
  cafe: Cafe;
  onEditOrResume?: () => void;
}

export const CafeStatusCard: React.FC<CafeStatusCardProps> = ({ cafe, onEditOrResume }) => {
  const status: CafeStatus = cafe.status || (cafe.is_approved ? 'approved' : 'draft');

  if (status === 'approved') {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-warm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Approved & Live
                </span>
                <span className="text-xs text-coffee-500 font-medium">Store Active</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
                {cafe.name} is Published!
              </h3>
              <p className="text-xs text-coffee-600 mt-0.5">
                Your cafe is accepting customer orders, table reservations, and diner reviews.
              </p>
            </div>
          </div>

          <Link
            to="/owner"
            className="px-5 py-3 bg-espresso-900 hover:bg-espresso-950 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>Open Backoffice</span>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'pending_approval') {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 shadow-warm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  Under Admin Review
                </span>
                {cafe.submitted_at && (
                  <span className="text-xs text-coffee-500">
                    Submitted on {new Date(cafe.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
                Your Cafe Application is Under Review
              </h3>
              <p className="text-xs text-coffee-600 mt-0.5 max-w-xl">
                The CafeHub operations team is verifying your establishment details, operating schedule, and menu items. Verification typically completes within 24 to 48 hours.
              </p>
            </div>
          </div>

          {onEditOrResume && (
            <button
              type="button"
              onClick={onEditOrResume}
              className="px-4 py-2.5 bg-cream-100 hover:bg-cream-200 text-espresso-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Review Details</span>
            </button>
          )}
        </div>

        {/* Status Tracker Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-cream-100 text-xs">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 block">1. Setup Submitted</span>
              <span className="text-[10px] text-emerald-700">Profile & Menu verified</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
            <div>
              <span className="font-bold text-amber-900 block">2. In Verification</span>
              <span className="text-[10px] text-amber-700">Admin quality checks</span>
            </div>
          </div>

          <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 flex items-center gap-3 opacity-60">
            <ShieldCheck className="w-5 h-5 text-coffee-400 shrink-0" />
            <div>
              <span className="font-bold text-espresso-900 block">3. Live Activation</span>
              <span className="text-[10px] text-coffee-500">Public customer ordering</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-coffee-500 pt-2 border-t border-cream-100">
          <Mail className="w-3.5 h-3.5 text-amber-700" />
          <span>Have an inquiry? Reach our merchant desk at <strong>support@cafehub.in</strong></span>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 shadow-warm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                Action Required: Application Returned
              </span>
              <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
                Your Cafe Submission Needs Revision
              </h3>
              <p className="text-xs text-coffee-600 mt-0.5">
                The platform administration reviewed your submission and requested adjustments before approval.
              </p>
            </div>
          </div>

          {onEditOrResume && (
            <button
              type="button"
              onClick={onEditOrResume}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-warm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit & Resubmit Cafe</span>
            </button>
          )}
        </div>

        {/* Rejection Reason Notice */}
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Admin Feedback / Reason for Revision:</span>
          </span>
          <p className="text-rose-950 font-medium leading-relaxed pl-5">
            {cafe.rejection_reason || 'Please provide updated operating hours and at least one high-resolution cover photo.'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="bg-white rounded-3xl border border-rose-300 shadow-warm p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              Account Suspended
            </span>
            <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
              Store Temporarily Suspended
            </h3>
            <p className="text-xs text-coffee-600 mt-1 leading-relaxed">
              This cafe has been temporarily suspended by CafeHub Administration. Live customer ordering and table reservations are currently paused.
            </p>
            <div className="mt-3 p-3 bg-cream-50 rounded-xl text-xs text-coffee-700">
              Contact <strong>compliance@cafehub.in</strong> to resolve account compliance or policy questions.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Draft mode
  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-warm p-6 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-espresso-800 border border-cream-300">
              Setup In Progress
            </span>
            <h3 className="text-xl font-serif font-bold text-espresso-950 mt-1">
              {cafe.name || 'Your Cafe Setup'}
            </h3>
            <p className="text-xs text-coffee-600 mt-0.5">
              Complete your operating hours, menu items, and photos to submit for admin review.
            </p>
          </div>
        </div>

        {onEditOrResume && (
          <button
            type="button"
            onClick={onEditOrResume}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-warm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Resume Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
