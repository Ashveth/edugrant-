/**
 * Translates raw OAuth / network errors into user-friendly messages with actionable guidance.
 */
export function getGoogleAuthErrorMessage(error: unknown): { title: string; description: string } {
  const msg = String(error).toLowerCase();

  if (msg.includes("popup") && msg.includes("blocked")) {
    return {
      title: "Popup blocked",
      description: "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.",
    };
  }

  if (msg.includes("popup_closed") || msg.includes("popup closed") || msg.includes("user_cancelled") || msg.includes("cancelled")) {
    return {
      title: "Sign-in cancelled",
      description: "You closed the Google sign-in window. Click 'Continue with Google' to try again.",
    };
  }

  if (msg.includes("access_denied") || msg.includes("access denied")) {
    return {
      title: "Access denied",
      description: "Google denied sign-in access. Make sure you're using a valid Google account.",
    };
  }

  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch") || msg.includes("networkerror")) {
    return {
      title: "Network error",
      description: "Couldn't reach Google. Check your internet connection and try again.",
    };
  }

  if (msg.includes("timeout") || msg.includes("timed out")) {
    return {
      title: "Request timed out",
      description: "The sign-in took too long. Check your connection and try again.",
    };
  }

  if (msg.includes("redirect") || msg.includes("mismatch")) {
    return {
      title: "Configuration error",
      description: "There's a redirect issue. Try refreshing the page and signing in again.",
    };
  }

  // Fallback
  return {
    title: "Google sign-in failed",
    description: "Something went wrong. Please refresh and try again, or use email sign-in instead.",
  };
}
