/**
 * Format currency value in Indonesian Rupiah (IDR)
 * @param value - The numeric value to format
 * @returns Formatted currency string with "Rp" prefix
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0';
  }

  // Format as Indonesian Rupiah with proper thousands separators
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency value in Indonesian Rupiah (IDR) with fallback text
 * @param value - The numeric value to format
 * @param fallback - Fallback text when value is null/undefined (default: 'N/A')
 * @returns Formatted currency string or fallback text
 */
export function formatCurrencyWithFallback(
  value: number | null | undefined, 
  fallback: string = 'N/A'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }

  // Format as Indonesian Rupiah with proper thousands separators
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
} 