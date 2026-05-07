import api from "./authApi";

const singapayApi = {
  /**
   * Get available packages
   */
  getPackages: () => {
    return api.get("/payment/packages");
  },

  /**
   * Get user subscription
   */
  getSubscription: () => {
    return api.get("/payment/subscription");
  },

  /**
   * Check PDF Pro access
   */
  checkAccess: () => {
    return api.get("/payment/check-access");
  },

  /**
   * Create purchase
   * @param {Object} data - Purchase data
   * @param {number} data.package_id - Package ID
   * @param {string} data.payment_method - 'virtual_account' | 'qris'
   * @param {string} data.bank_code - Bank code (required for VA): 'BRI' | 'BNI' | 'DANAMON' | 'MAYBANK'
   */
  createPurchase: (data) => {
    return api.post("/payment/purchase", data);
  },

  /**
   * Check payment status
   * @param {string} transactionCode - Transaction code
   */
  checkPaymentStatus: (transactionCode) => {
    return api.get(`/payment/status/${transactionCode}`);
  },

  /**
   * Cancel purchase
   * @param {string} transactionCode - Transaction code
   */
  cancelPurchase: (transactionCode) => {
    return api.post(`/payment/cancel/${transactionCode}`);
  },

  /**
   * Get transaction history
   */
  getHistory: () => {
    return api.get("/payment/history");
  },

  /**
   * Test webhook (MOCK MODE ONLY)
   * @param {string} transactionCode - Transaction code
   */
  testWebhook: (transactionCode) => {
    return api.post("/webhook/singapay/test", {
      transaction_code: transactionCode,
    });
  },


};

export default singapayApi;
