import api from "./api";
import { IEmployee } from "@/types/Employee.type";

export const employeeService = {
  getEmployees: async (): Promise<IEmployee[]> => {
    const response = await api.get("/employees");
    return response.data;
  },
};
