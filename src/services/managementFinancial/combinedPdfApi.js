import api from "../authApi";

const combinedPdfApi = {
  generateCombinedPdf: (userId, businessBackgroundId, periodType, periodValue, mode = "free") => {
    const payload = {
      user_id: parseInt(userId),
      business_background_id: businessBackgroundId,
      period_type: periodType,
      period_value: periodValue,
      mode: mode,
    };

    return api.post("/management-financial/pdf/generate-combined", payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 300 seconds (5 menit) timeout untuk PDF besar yang kompleks
    });
  },
};

export default combinedPdfApi;
