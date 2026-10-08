import React, { useState, useEffect } from 'react';
import { CafeOpeningHours, DAY_NAMES } from '../../../types';
import { Clock, AlertCircle, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';

interface StepOpeningHoursProps {
  cafeId: string;
  initialHours: CafeOpeningHours[];
  onSave: (hours: CafeOpeningHours[]) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isSaving: boolean;
}

const DEFAULT_SCHEDULE: Omit<CafeOpeningHours, 'id'>[] = [
  { cafe_id: '', day_of_week: 0, is_open: true, open_time: '09:00', close_time: '22:00' }, // Sunday
  { cafe_id: '', day_of_week: 1, is_open: true, open_time: '08:00', close_time: '22:00' }, // Monday
  { cafe_id: '', day_of_week: 2, is_open: true, open_time: '08:00', close_time: '22:00' }, // Tuesday
  { cafe_id: '', day_of_week: 3, is_open: true, open_time: '08:00', close_time: '22:00' }, // Wednesday
  { cafe_id: '', day_of_week: 4, is_open: true, open_time: '08:00', close_time: '22:00' }, // Thursday
  { cafe_id: '', day_of_week: 5, is_open: true, open_time: '08:00', close_time: '23:00' }, // Friday
  { cafe_id: '', day_of_week: 6, is_open: true, open_time: '09:00', close_time: '23:00' }, // Saturday
];

export const StepOpeningHours: React.FC<StepOpeningHoursProps> = ({
  cafeId,
  initialHours,
  onSave,
  onBack,
  isSaving,
}) => {
  const [schedule, setSchedule] = useState<CafeOpeningHours[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize 7 days
  useEffect(() => {
    if (initialHours && initialHours.length > 0) {
      // Merge with 7 days
      const days = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
        const existing = initialHours.find((h) => h.day_of_week === dayIdx);
        if (existing) return existing;
        return {
          cafe_id: cafeId,
          day_of_week: dayIdx,
          is_open: true,
          open_time: '08:30',
          close_time: '22:30',
        };
      });
      setSchedule(days);
    } else {
      setSchedule(
        DEFAULT_SCHEDULE.map((d) => ({
          ...d,
          cafe_id: cafeId,
        }))
      );
    }
  }, [initialHours, cafeId]);

  const updateDay = (dayIdx: number, updates: Partial<CafeOpeningHours>) => {
    setSchedule((prev) =>
      prev.map((day) => (day.day_of_week === dayIdx ? { ...day, ...updates } : day))
    );
  };

  // Helper: Copy Monday to all weekdays (Mon-Fri)
  const copyMondayToWeekdays = () => {
    const monday = schedule.find((d) => d.day_of_week === 1);
    if (!monday) return;

    setSchedule((prev) =>
      prev.map((day) => {
        if ([1, 2, 3, 4, 5].includes(day.day_of_week)) {
          return {
            ...day,
            is_open: monday.is_open,
            open_time: monday.open_time,
            close_time: monday.close_time,
          };
        }
        return day;
      })
    );
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Helper: Set standard hours 09:00 to 22:00 for all 7 days
  const setStandardAllWeek = () => {
    setSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        is_open: true,
        open_time: '08:30',
        close_time: '22:30',
      }))
    );
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that at least one day is open
    const hasOpenDay = schedule.some((d) => d.is_open);
    if (!hasOpenDay) {
      setError('Please set at least one day as open.');
      return;
    }

    // Validate times for open days
    for (const day of schedule) {
      if (day.is_open) {
        if (!day.open_time || !day.close_time) {
          setError(`Please provide both opening and closing times for ${DAY_NAMES[day.day_of_week]}.`);
          return;
        }
      }
    }

    const res = await onSave(schedule);
    if (!res.success) {
      setError(res.error || 'Failed to save opening hours.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Operating Hours</span>
            </h3>
            <p className="text-xs text-coffee-600 mt-1">
              Configure your weekly schedule so customers know when you're brewing and taking orders.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyMondayToWeekdays}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-espresso-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy Monday hours to Tuesday through Friday"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Mon → Fri</span>
            </button>
            <button
              type="button"
              onClick={setStandardAllWeek}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-espresso-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Set 8:30 - 22:30 All Days
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 7 Days Table / Cards */}
        <div className="divide-y divide-cream-100 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/30">
          {schedule.map((day) => {
            const dayName = DAY_NAMES[day.day_of_week];
            const isWeekend = day.day_of_week === 0 || day.day_of_week === 6;

            return (
              <div
                key={day.day_of_week}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  day.is_open ? 'bg-white' : 'bg-cream-100/50 opacity-70'
                }`}
              >
                {/* Left: Day & Toggle */}
                <div className="flex items-center gap-4 min-w-[150px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.is_open}
                      onChange={(e) => updateDay(day.day_of_week, { is_open: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                  <div>
                    <span className="text-xs font-bold text-espresso-950 block">{dayName}</span>
                    <span className="text-[10px] text-coffee-500">
                      {day.is_open ? (isWeekend ? 'Weekend' : 'Weekday') : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Right: Open & Close Time Pickers */}
                {day.is_open ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-coffee-600">Opens</span>
                      <input
                        type="time"
                        value={day.open_time}
                        onChange={(e) => updateDay(day.day_of_week, { open_time: e.target.value })}
                        className="bg-cream-50 border border-cream-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-espresso-900 outline-none focus:border-amber-600"
                      />
                    </div>
                    <span className="text-xs text-coffee-400">to</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-coffee-600">Closes</span>
                      <input
                        type="time"
                        value={day.close_time}
                        onChange={(e) => updateDay(day.day_of_week, { close_time: e.target.value })}
                        className="bg-cream-50 border border-cream-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-espresso-900 outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-coffee-400 italic">
                    Store Closed on this day
                  </span>
                )}
              </div>
            );
          })}
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
          <span>Back to Location</span>
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
