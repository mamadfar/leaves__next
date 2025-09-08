import api from "./api";
import { IUser } from "@/types/Auth.type";

export const authService = {
  login: async (employeeId: string): Promise<IUser> => {
    const response = await api.post("/auth", { employeeId });
    return response.data.user;
  },
};
