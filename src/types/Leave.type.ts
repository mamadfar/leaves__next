import { LeaveStatus, LeaveType, SpecialLeaveType } from "@prisma/client";

export interface ILeave {
  leaveId: string;
  leaveLabel: string;
  employeeId: string;
  startOfLeave: string | Date;
  endOfLeave: string | Date;
  approverId?: string;
  status: LeaveStatus;
  leaveType: LeaveType;
  specialLeaveType?: SpecialLeaveType;
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
  employee?: {
    employeeId: string;
    name: string;
  };
  approver?: {
    employeeId: string;
    name: string;
  };
}

export interface ICreateLeaveRequest {
  leaveLabel: string;
  employeeId: string;
  startOfLeave: string;
  endOfLeave: string;
  leaveType: LeaveType;
  specialLeaveType?: SpecialLeaveType;
}

export { LeaveStatus, LeaveType, SpecialLeaveType };
