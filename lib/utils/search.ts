import { Apartment } from "../types";

export interface SearchFilters {
    location?: string; // City or area
    checkIn?: string; // ISO date string
    checkOut?: string; // ISO date string
    guests?: number;
}

/**
 * Filter apartments based on search criteria
 */
export function filterApartments(
    apartments: Apartment[],
    filters: SearchFilters
): Apartment[] {
    let filtered = [...apartments];

    // Filter by location (city or area)
    if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        filtered = filtered.filter(
            (apt) =>
                apt.location.city.toLowerCase().includes(locationLower) ||
                apt.location.area.toLowerCase().includes(locationLower)
        );
    }

    // Filter by guests (capacity)
    if (filters.guests && filters.guests > 0) {
        filtered = filtered.filter((apt) => apt.capacity >= filters.guests!);
    }

    // Note: Date-based availability checking would require a booking system
    // For now, we just filter by location and capacity
    // In a real system, you'd check against booked dates

    return filtered;
}

/**
 * Get all unique cities from apartments
 */
export function getUniqueCities(apartments: Apartment[]): string[] {
    const cities = new Set<string>();
    apartments.forEach((apt) => {
        cities.add(apt.location.city);
    });
    return Array.from(cities).sort();
}

/**
 * Get all unique areas from apartments
 */
export function getUniqueAreas(apartments: Apartment[]): string[] {
    const areas = new Set<string>();
    apartments.forEach((apt) => {
        areas.add(apt.location.area);
    });
    return Array.from(areas).sort();
}

/**
 * Get all areas for a specific city
 */
export function getAreasByCity(
    apartments: Apartment[],
    city: string
): string[] {
    const areas = new Set<string>();
    apartments
        .filter((apt) => apt.location.city.toLowerCase() === city.toLowerCase())
        .forEach((apt) => {
            areas.add(apt.location.area);
        });
    return Array.from(areas).sort();
}

/**
 * Check if dates are valid (check-out must be after check-in)
 */
export function areDatesValid(checkIn: string, checkOut: string): boolean {
    if (!checkIn || !checkOut) return true; // Skip validation if dates not provided

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check-in must be today or in the future
    if (checkInDate < today) return false;

    // Check-out must be after check-in
    return checkOutDate > checkInDate;
}

/**
 * Calculate number of nights between check-in and check-out
 */
export function calculateNights(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}
