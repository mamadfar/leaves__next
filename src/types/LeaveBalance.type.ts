export interface ILeaveBalance {
  id: number;
  employeeId: string;
  year: number;
  totalDays: number;
  totalHours: number;
  usedDays: number;
  usedHours: number;
  createdAt: Date;
  updatedAt: Date;
}
