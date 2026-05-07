import { backgroundApi } from './backgroundApi'; // Import named export
import marketAnalysisApi from './marketAnalysisApi';
import productServiceApi from './productServiceApi';
import marketingStrategiesApi from './marketingStrategiesApi';
import operationalPlanApi from './operationalPlanApi';
import teamStructureApi from './teamStructureApi';
// TODO: Comment - FinancialPlan nonaktif di Business Plan
// import financialPlanApi from './financialPlanApi';
import pdfBusinessPlanApi from './pdfBusinessPlanApi';

// Named exports
export {
  backgroundApi,
  marketAnalysisApi,
  productServiceApi,
  marketingStrategiesApi,
  operationalPlanApi,
  teamStructureApi,
  // TODO: Comment - FinancialPlan nonaktif di Business Plan
  // financialPlanApi,
  pdfBusinessPlanApi
};

// Default export (opsional)
export default {
  backgroundApi,
  marketAnalysisApi,
  productServiceApi,
  marketingStrategiesApi,
  operationalPlanApi,
  teamStructureApi,
  // TODO: Comment - FinancialPlan nonaktif di Business Plan
  // financialPlanApi,
  pdfBusinessPlanApi
};