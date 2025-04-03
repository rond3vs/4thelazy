// src/utils/sanitize.ts

/**
 * Sanitizes HTML string to prevent XSS attacks
 * 
 * @param input The string to sanitize
 * @returns A sanitized version of the input string
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }
  
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and sanitizes a URL to ensure it's safe and properly formatted
 * 
 * @param url The URL to validate
 * @returns A validated and sanitized URL or throws an error if invalid
 */
export function validateUrl(url: string | null | undefined): string {
  if (!url) {
    throw new Error('URL is required');
  }
  
  // Trim whitespace
  let cleanUrl = url.trim();
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  try {
    // Create a URL object to validate the URL
    const urlObj = new URL(cleanUrl);
    
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('URL must use http or https protocol');
    }
    
    // Make sure there's a valid domain
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
      throw new Error('URL must contain a valid domain');
    }
    
    // Return the sanitized URL string
    return urlObj.toString();
  } catch (e) {
    // Provide a more specific error message
    if (e instanceof Error) {
      throw new Error(`Invalid URL: ${e.message}`);
    } else {
      throw new Error('Invalid URL format');
    }
  }
}

/**
 * Sanitizes a URL to ensure it's safe, with a fallback to null if invalid
 * 
 * @param url The URL to sanitize
 * @returns A sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  try {
    return validateUrl(url);
  } catch (e) {
    // If validation fails, return null instead of throwing
    console.warn('URL sanitization failed:', e);
    return null;
  }
}

/**
 * Sanitizes an array of tags
 * 
 * @param tags Array of tags to sanitize
 * @returns Sanitized array of tags
 */
export function sanitizeTags(tags: string[] | undefined | null): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  
  return tags
    .filter(tag => typeof tag === 'string')
    .map(tag => sanitizeHtml(tag))
    .filter(tag => tag.length > 0);
}

/**
 * Validates a date object
 * 
 * @param date Date to validate
 * @returns Valid date or current date if invalid
 */
export function validateDate(date: Date | string | undefined | null): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  
  if (typeof date === 'string') {
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (e) {
      // Fall through to default
    }
  }
  
  // Default to current date
  return new Date();
}