import api from "./api";
import { ILeave, ICreateLeaveRequest } from "@/types/Leave.type";

export const leaveService = {
  getEmployeeLeaves: async (employeeId: string): Promise<ILeave[]> => {
    const response = await api.get(`/employees/${employeeId}/leaves`);
    return response.data;
  },

  getManagerLeaves: async (managerId: string): Promise<ILeave[]> => {
    const response = await api.get(`/managers/${managerId}/leaves`);
    return response.data;
  },

  createLeave: async (leaveData: ICreateLeaveRequest): Promise<ILeave> => {
    const response = await api.post("/leaves", leaveData);
    return response.data.leave;
  },

  updateLeaveStatus: async (
    leaveId: string,
    status: string,
    approverId: string
  ): Promise<ILeave> => {
    const response = await api.patch(`/leaves/${leaveId}/status`, {
      status,
      approverId,
    });
    return response.data;
  },

  deleteLeave: async (leaveId: string, employeeId: string): Promise<void> => {
    await api.delete(`/leaves/${leaveId}`, {
      data: { employeeId },
    });
  },
};
