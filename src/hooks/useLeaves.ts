"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leaveService";
import { ICreateLeaveRequest } from "@/types/Leave.type";

export const useEmployeeLeaves = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["leaves", "employee", employeeId],
    queryFn: () => leaveService.getEmployeeLeaves(employeeId!),
    enabled: !!employeeId,
  });
};

export const useManagerLeaves = (managerId: string | undefined) => {
  return useQuery({
    queryKey: ["leaves", "manager", managerId],
    queryFn: () => leaveService.getManagerLeaves(managerId!),
    enabled: !!managerId,
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveService.createLeave,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["leaves", "employee", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalance", variables.employeeId] });
    },
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaveId,
      status,
      approverId,
    }: {
      leaveId: string;
      status: string;
      approverId: string;
    }) => leaveService.updateLeaveStatus(leaveId, status, approverId),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
};

export const useDeleteLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, employeeId }: { leaveId: string; employeeId: string }) =>
      leaveService.deleteLeave(leaveId, employeeId),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["leaves", "employee", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalance", variables.employeeId] });
    },
  });
};
