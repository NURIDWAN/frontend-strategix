/**
 * Utility for handling localStorage cleaning to prevent data leakage between accounts
 */

/**
 * Clears all application data from localStorage while preserving global settings
 * like theme and affiliate info.
 *
 * @param {boolean} preserveAffiliate - Whether to keep affiliate referral info
 */
export const clearAppData = (preserveAffiliate = true) => {
  // 1. Capture items to preserve
  const theme = localStorage.getItem("theme");
  const affiliateRef = localStorage.getItem("affiliate_ref");
  const affiliateTimestamp = localStorage.getItem("affiliate_ref_timestamp");

  // 2. Clear all data
  localStorage.clear();

  // 3. Restore preserved items
  if (theme) {
    localStorage.setItem("theme", theme);
  }

  if (preserveAffiliate) {
    if (affiliateRef) localStorage.setItem("affiliate_ref", affiliateRef);
    if (affiliateTimestamp)
      localStorage.setItem("affiliate_ref_timestamp", affiliateTimestamp);
  }

  console.log("[Storage] App data cleared, preserved:", {
    theme: !!theme,
    affiliate: preserveAffiliate && !!affiliateRef,
  });
};

/**
 * Specifically removes auth-related data
 */
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
