/** EU member states, EEA, UK, and Switzerland — consent banner required. */
export const EEA_UK_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
  "UK",
  "CH",
]);

export function isEeaOrUkCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return EEA_UK_COUNTRY_CODES.has(countryCode.trim().toUpperCase());
}
