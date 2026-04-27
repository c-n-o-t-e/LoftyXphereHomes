"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_HEADER = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISO(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Monday = 0, Sunday = 6 */
function getDayOfWeek(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function findFirstSelectableDate(params: {
  anchor: Date;
  minDate: string;
  disabledSet: Set<string>;
  maxDaysToScan: number;
}): Date | null {
  const { anchor, minDate, disabledSet, maxDaysToScan } = params;
  const todayIso = toISO(anchor);
  const effectiveStartIso = minDate && todayIso < minDate ? minDate : todayIso;
  let current = parseISO(effectiveStartIso);

  for (let i = 0; i <= maxDaysToScan; i++) {
    const iso = toISO(current);
    if ((minDate ? iso >= minDate : true) && !disabledSet.has(iso)) return current;
    current = addDays(current, 1);
  }

  return null;
}

function monthHasSelectableDate(params: {
  month: Date;
  minDate: string;
  disabledSet: Set<string>;
}): boolean {
  const { month, minDate, disabledSet } = params;
  const start = startOfMonth(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const iso = toISO(d);
    if ((minDate ? iso >= minDate : true) && !disabledSet.has(iso)) return true;
  }
  return false;
}

export interface DatePickerCalendarProps {
  open: boolean;
  onClose: () => void;
  value: string; // YYYY-MM-DD
  minDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClear: () => void;
  /** Render inside a parent with position: relative. 'top' = above trigger, 'bottom' = below */
  placement?: "top" | "bottom";
  /** When true (e.g. in nav bar), on mobile position calendar below top of viewport (drop down) instead of centered */
  dropDownOnMobile?: boolean;
  className?: string;
  /** Array of dates (YYYY-MM-DD) that should be disabled/not selectable */
  disabledDates?: string[];
}

export function DatePickerCalendar({
  open,
  onClose,
  value,
  minDate,
  onSelect,
  onClear,
  placement = "bottom",
  dropDownOnMobile = false,
  className = "",
  disabledDates = [],
}: DatePickerCalendarProps) {
  const initialMonth = value ? parseISO(value) : minDate ? parseISO(minDate) : new Date();
  const [viewDate, setViewDate] = useState(initialMonth);
  const prevOpen = useRef(open);

  const minDateObj = minDate ? parseISO(minDate) : null;

  // Create a Set for O(1) lookup of disabled dates
  const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates]);

  useEffect(() => {
    if (!open) {
      prevOpen.current = open;
      return;
    }

    const didJustOpen = !prevOpen.current && open;
    prevOpen.current = open;

    // If user already picked a value, keep that month visible.
    if (value) {
      const next = parseISO(value);
      if (!isSameMonth(viewDate, next)) {
        queueMicrotask(() => setViewDate(next));
      }
      return;
    }

    const visibleMonthHasAvailability = monthHasSelectableDate({
      month: viewDate,
      minDate,
      disabledSet,
    });

    // Only auto-jump when opening, or when the current visible month has no selectable dates
    // (e.g. availability finishes loading and the month becomes fully blocked).
    if (!didJustOpen && visibleMonthHasAvailability) return;

    const anchor = minDate ? parseISO(minDate) : new Date();
    const firstSelectable = findFirstSelectableDate({
      anchor,
      minDate,
      disabledSet,
      maxDaysToScan: 366 * 2,
    });

    if (firstSelectable && !isSameMonth(viewDate, firstSelectable)) {
      queueMicrotask(() => setViewDate(firstSelectable));
    }
  }, [open, value, minDate, disabledSet, viewDate]);

  const { weeks, month, year } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const firstWeekday = getDayOfWeek(first);
    const daysInMonth = last.getDate();
    const cells: { date: Date; iso: string; currentMonth: boolean; disabled: boolean }[] = [];

    // Helper to check if a date should be disabled
    const isDisabled = (iso: string): boolean => {
      const beforeMin = minDateObj ? iso < minDate : false;
      const isBlocked = disabledSet.has(iso);
      return beforeMin || isBlocked;
    };

    // Leading empty cells
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (firstWeekday - i));
      const iso = toISO(d);
      cells.push({ date: d, iso, currentMonth: false, disabled: isDisabled(iso) });
    }
    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(y, m, day);
      const iso = toISO(d);
      cells.push({ date: d, iso, currentMonth: true, disabled: isDisabled(iso) });
    }
    // Trailing cells to complete last row
    const total = cells.length;
    const remainder = total % 7;
    if (remainder !== 0) {
      const need = 7 - remainder;
      const lastDay = cells[cells.length - 1]?.date ?? new Date(y, m, daysInMonth);
      for (let i = 1; i <= need; i++) {
        const d = new Date(lastDay);
        d.setDate(d.getDate() + i);
        const iso = toISO(d);
        cells.push({ date: d, iso, currentMonth: false, disabled: isDisabled(iso) });
      }
    }

    return {
      weeks: cells,
      month: m,
      year: y,
    };
  }, [viewDate, minDate, minDateObj, disabledSet]);

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };

  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  const handleSelect = (iso: string) => {
    onSelect(iso);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={`z-50 rounded-xl border border-black/10 bg-white p-4 shadow-xl
          max-w-[min(320px,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] overflow-y-auto
          fixed left-1/2 -translate-x-1/2 w-[min(320px,calc(100vw-2rem))]
          ${dropDownOnMobile ? "top-24 max-h-[calc(100vh-7rem)]" : "top-1/2 -translate-y-1/2"}
          md:absolute md:left-0 md:top-auto md:bottom-auto md:right-auto md:translate-x-0 md:translate-y-0 md:max-h-none md:overflow-visible md:w-[min(320px,90vw)]
          ${placement === "top" ? "md:bottom-full md:mb-1" : "md:top-full md:mt-1"}
          ${className}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="rounded p-1.5 text-black/60 hover:bg-black/5 hover:text-black"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-black">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded p-1.5 text-black/60 hover:bg-black/5 hover:text-black"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DAYS_HEADER.map((day, index) => (
            <div
              key={`day-${index}`}
              className="py-1 text-xs font-bold text-black"
            >
              {day}
            </div>
          ))}
          {weeks.map(({ date, iso, currentMonth, disabled }) => (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && handleSelect(iso)}
              className={`
                min-h-[36px] rounded-md text-sm transition-colors
                ${disabled ? "cursor-not-allowed text-black/30" : "hover:bg-black/10"}
                ${currentMonth ? "text-black" : "text-black/40"}
                ${value === iso ? "bg-[#FA5C5C] text-white hover:bg-[#E84A4A]" : ""}
              `}
            >
              {date.getDate()}
            </button>
          ))}
        </div>

        <div className="mt-3 flex justify-center border-t border-black/10 pt-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-[#2563eb] hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}
