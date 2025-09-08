export interface IEmployee {
  employeeId: string;
  name: string;
  managerId?: string;
  contractHours: number;
  isManager: boolean;
  createdAt: Date;
  updatedAt: Date;
}
