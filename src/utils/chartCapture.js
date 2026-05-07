import html2canvas from "html2canvas";

/**
 * Capture chart element sebagai base64 image
 * @param {HTMLElement} element - DOM element yang akan di-capture
 * @param {Object} options - Options untuk html2canvas
 * @returns {Promise<string>} Base64 image string
 */
export const captureChartAsBase64 = async (element, options = {}) => {
  if (!element) {
    throw new Error("Element not found");
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution untuk kualitas terbaik
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      ...options,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error capturing chart:", error);
    throw error;
  }
};

/**
 * Capture multiple charts untuk Financial Plan
 * @param {string} financialPlanId - ID dari financial plan
 * @returns {Promise<Object>} Object berisi semua charts dalam base64
 */
export const captureFinancialCharts = async (financialPlanId) => {
  const charts = {};
  const chartTypes = ["profit_loss", "capital_structure", "revenue_streams", "expense_breakdown", "feasibility", "forecast"];

  for (const chartType of chartTypes) {
    try {
      // Cari chart element berdasarkan data attribute atau class
      const chartElement = document.querySelector(`[data-chart-type="${chartType}"]`);

      if (chartElement) {
        const base64Image = await captureChartAsBase64(chartElement);
        charts[chartType] = base64Image;
      } else {
        console.warn(`Chart element for ${chartType} not found`);
        charts[chartType] = null;
      }
    } catch (error) {
      console.error(`Error capturing ${chartType}:`, error);
      charts[chartType] = null;
    }
  }

  return charts;
};

/**
 * Capture single chart by type
 * @param {string} chartType - Type of chart
 * @returns {Promise<string|null>} Base64 image or null
 */
export const captureSingleChart = async (chartType) => {
  try {
    const chartElement = document.querySelector(`[data-chart-type="${chartType}"]`);

    if (!chartElement) {
      console.warn(`Chart element for ${chartType} not found`);
      return null;
    }

    return await captureChartAsBase64(chartElement);
  } catch (error) {
    console.error(`Error capturing ${chartType}:`, error);
    return null;
  }
};
