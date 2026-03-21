/** Tag for all availability-related server caches (list + per-apartment). */
export const AVAILABILITY_TAG = "availability";

export function availabilityApartmentTag(apartmentId: string): string {
  return `availability-apartment-${apartmentId}`;
}
