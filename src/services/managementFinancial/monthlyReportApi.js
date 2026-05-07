import api from '../authApi';

export async function getMonthlyReport(year, params = {}) {
  const res = await api.get(`/management-financial/reports/monthly`, {
    params: { year, ...params }
  });
  return res.data;
}
