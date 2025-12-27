/**
 * Normalizes a phone number to the standard Philippine format (+639XXXXXXXXX).
 * 
 * Accepted formats:
 * - 09171234567
 * - +639171234567
 * - 0917 123 4567 (spaces)
 * - (0917) 123-4567 (separators)
 * 
 * @param phone The raw phone string input.
 * @returns The normalized string if valid, or null if invalid.
 */
export function normalizeMobilePH(phone: string): string | null {
    if (!phone) return null

    // 1. Remove all non-numeric characters except leading +
    let clean = phone.replace(/[^0-9+]/g, '')

    // 2. Handle 63 prefix or 0 prefix
    if (clean.startsWith('09')) {
        clean = '+63' + clean.substring(1)
    } else if (clean.startsWith('9') && clean.length === 10) {
        clean = '+63' + clean
    } else if (clean.startsWith('639')) {
        clean = '+' + clean
    }

    // 3. Validation: Must start with +639 and have 13 chars total (+63 + 10 digits)
    const phMobileRegex = /^\+639\d{9}$/

    if (!phMobileRegex.test(clean)) {
        return null
    }

    return clean
}

/**
 * Formats a normalized mobile number for display.
 * Input: +639171234567
 * Output: 0917 123 4567
 */
export function formatMobileDisplay(phone: string): string {
    if (!phone) return ''
    const clean = normalizeMobilePH(phone)
    if (!clean) return phone // Return raw if invalid

    // Convert +639... to 09...
    const local = '0' + clean.slice(3)
    // Format as 09XX XXX XXXX
    return local.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
}
