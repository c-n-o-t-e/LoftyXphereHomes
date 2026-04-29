import { formatDateForInput, parseLocalDate } from "./datePickerDisplay";

export interface BookingRange {
  checkIn: string;
  checkOut: string;
}

export function buildCheckoutDisabledDates(
  checkIn: string,
  bookingRanges: BookingRange[]
): string[] {
  if (!checkIn || bookingRanges.length === 0) return [];

  const checkInDate = parseLocalDate(checkIn);
  const disabled: string[] = [];

  const nextBooking = bookingRanges.find((range) => {
    const rangeCheckIn = parseLocalDate(range.checkIn);
    return rangeCheckIn > checkInDate;
  });

  if (!nextBooking) return disabled;

  const current = parseLocalDate(nextBooking.checkIn);
  current.setDate(current.getDate() + 1);

  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

  while (current <= twoYearsLater) {
    disabled.push(formatDateForInput(current));
    current.setDate(current.getDate() + 1);
  }

  return disabled;
}
