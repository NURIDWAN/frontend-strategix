export const CHECKOUT_INTENT_KEY = "checkout_intent";

export const readCheckoutIntent = () => {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_INTENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const readCheckoutIntentPackageId = () => {
  const intent = readCheckoutIntent();
  return intent?.packageId ? String(intent.packageId) : null;
};

export const saveCheckoutIntent = (intent) => {
  sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
};

export const clearCheckoutIntent = () => {
  sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
};
