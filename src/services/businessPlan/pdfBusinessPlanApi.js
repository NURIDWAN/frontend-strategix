import api from "../authApi";

const pdfBusinessPlanApi = {
  // Generate PDF - sekarang return JSON dengan base64
  generatePdf: (businessBackgroundId, mode = "free", charts = null) => {
    const payload = {
      business_background_id: businessBackgroundId,
      mode: mode,
    };

    // Tambahkan charts data jika ada
    if (charts) {
      payload.charts = charts;
    }

    return api.post("/pdf-business-plan/generate", payload, {
      // Hapus responseType: 'blob' karena sekarang return JSON
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 300 seconds (5 menit) timeout untuk PDF besar
    });
  },

  // Preview PDF data
  previewPdf: (businessBackgroundId, mode = "free") => {
    return api.post("/pdf-business-plan/generate", {
      business_background_id: businessBackgroundId,
      mode: mode,
      preview: true,
    }, {
      timeout: 300000, // 300 seconds timeout
    });
  },

  // Generate executive summary
  generateExecutiveSummary: (businessBackgroundId) => {
    return api.post("/pdf-business-plan/executive-summary", {
      business_background_id: businessBackgroundId,
    }, {
      timeout: 300000, // 300 seconds timeout
    });
  },

  // Get PDF statistics
  getStatistics: () => {
    return api.get("/pdf-business-plan/statistics");
  },
};

export default pdfBusinessPlanApi;