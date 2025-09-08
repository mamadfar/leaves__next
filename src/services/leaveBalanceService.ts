import api from './api';
import { ILeaveBalance } from '@/types/LeaveBalance.type';

export const leaveBalanceService = {
  getEmployeeBalance: async (employeeId: string, year?: number): Promise<ILeaveBalance> => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/employees/${employeeId}/balance${params}`);
    return response.data;
  },
};
