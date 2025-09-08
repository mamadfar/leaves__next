"use client";

import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.getEmployees,
  });
};
