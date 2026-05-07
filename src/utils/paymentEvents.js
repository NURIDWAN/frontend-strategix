export const PAYMENT_PENDING_COUNTS_UPDATED = "payment:pending-counts-updated";

export const emitPaymentPendingCounts = (counts) => {
  window.dispatchEvent(
    new CustomEvent(PAYMENT_PENDING_COUNTS_UPDATED, {
      detail: {
        pro: Number(counts?.pro || 0),
        consultation: Number(counts?.consultation || 0),
      },
    })
  );
};
