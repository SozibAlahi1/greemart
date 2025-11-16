/**
 * Get or create a unique session ID for the current device/browser
 * This ensures each device has its own cart
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a default (shouldn't happen in client components)
    return 'default';
  }

  const STORAGE_KEY = 'cart-session-id';
  
  // Try to get existing session ID from localStorage
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  // If no session ID exists, generate a new one
  if (!sessionId) {
    // Generate a unique ID using timestamp + random string
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

