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
   * Validates a URL to ensure it's safe
   * 
   * @param url The URL to validate
   * @returns A validated URL or null if invalid
   */
  export function validateUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    
    try {
      // Create a URL object to validate the URL
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return null;
      }
      
      // Return the sanitized URL string
      return urlObj.toString();
    } catch (e) {
      // If URL is invalid, return null
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