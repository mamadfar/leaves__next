'use client';

import { useQuery } from '@tanstack/react-query';
import { leaveBalanceService } from '@/services/leaveBalanceService';

export const useLeaveBalance = (employeeId: string | undefined, year?: number) => {
  return useQuery({
    queryKey: ['leaveBalance', employeeId, year],
    queryFn: () => leaveBalanceService.getEmployeeBalance(employeeId!, year),
    enabled: !!employeeId,
  });
};
