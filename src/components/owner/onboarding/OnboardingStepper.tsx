import React from 'react';
import {
  FileText,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Image as ImageIcon,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface StepItem {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  progressScore: number;
  onStepClick: (stepId: number) => void;
  canNavigateToStep: (stepId: number) => boolean;
}

const ONBOARDING_STEPS: Omit<StepItem, 'isComplete'>[] = [
  {
    id: 1,
    key: 'basic',
    title: 'Basic Info',
    shortTitle: 'Basics',
    description: 'Name, tagline & description',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 2,
    key: 'location',
    title: 'Location & Contact',
    shortTitle: 'Location',
    description: 'Address, phone & email',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    id: 3,
    key: 'hours',
    title: 'Opening Hours',
    shortTitle: 'Hours',
    description: 'Weekly operating schedule',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: 4,
    key: 'amenities',
    title: 'Amenities',
    shortTitle: 'Amenities',
    description: 'Wi-Fi, parking, seating',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 5,
    key: 'categories',
    title: 'Menu Categories',
    shortTitle: 'Categories',
    description: 'Coffee, snacks, bakes',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 6,
    key: 'menu',
    title: 'Menu Items',
    shortTitle: 'Menu Items',
    description: 'Dishes, prices & dietary',
    icon: <UtensilsCrossed className="w-4 h-4" />,
  },
  {
    id: 7,
    key: 'photos',
    title: 'Cafe Photos',
    shortTitle: 'Photos',
    description: 'Logo, cover & gallery',
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: 8,
    key: 'review',
    title: 'Review & Submit',
    shortTitle: 'Review',
    description: 'Verification & submission',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  completedSteps,
  progressScore,
  onStepClick,
  canNavigateToStep,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-cream-200 shadow-warm p-4 sm:p-6 mb-6">
      {/* Top Header: Progress Bar & Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Cafe Setup Wizard
            </span>
            <span className="text-xs text-coffee-500 font-medium">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-espresso-950 mt-1">
            {ONBOARDING_STEPS.find((s) => s.id === currentStep)?.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-espresso-900">{progressScore}%</span>
            <span className="text-[10px] text-coffee-500 block">Setup Complete</span>
          </div>
          <div className="w-24 sm:w-32 bg-cream-100 rounded-full h-2.5 overflow-hidden border border-cream-200">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-700 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Stepper Bar */}
      <div className="hidden lg:grid grid-cols-8 gap-2 pt-2 border-t border-cream-100">
        {ONBOARDING_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          const isClickable = canNavigateToStep(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex flex-col items-center text-center p-2 rounded-2xl transition-all text-left group ${
                isActive
                  ? 'bg-amber-50/80 border border-amber-300 shadow-xs'
                  : isDone
                  ? 'hover:bg-cream-50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cream-200 text-coffee-600'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`text-[11px] font-bold line-clamp-1 ${
                  isActive
                    ? 'text-amber-800'
                    : isDone
                    ? 'text-espresso-900'
                    : 'text-coffee-400'
                }`}
              >
                {step.shortTitle}
              </span>
              <span className="text-[9px] text-coffee-500 line-clamp-1 hidden xl:block">
                {step.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile / Tablet Horizontal Scrollable Stepper */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none border-t border-cream-100">
        {ONBOARDING_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          const isClickable = canNavigateToStep(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isDone
                  ? 'bg-cream-100 text-espresso-900 border border-cream-300'
                  : 'bg-cream-50 text-coffee-400 border border-cream-200 opacity-60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {isDone ? '✓' : step.id}
              </span>
              <span>{step.shortTitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
