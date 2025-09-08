"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/hooks/useAuth";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      setErrorMessage("Please enter an employee ID");
      return;
    }

    setErrorMessage("");

    try {
      const user = await loginMutation.mutateAsync(employeeId);
      login(user);
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const quickLogin = (id: string) => {
    setEmployeeId(id);
    // Auto-submit after setting ID
    setTimeout(() => {
      if (!loginMutation.isPending) {
        handleLogin({ preventDefault: () => {} } as React.FormEvent);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Leave Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in with your employee ID</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="employeeId" className="sr-only">
              Employee ID
            </label>
            <input
              id="employeeId"
              name="employeeId"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Employee ID (e.g., K012345)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          {errorMessage && <div className="text-red-600 text-sm text-center">{errorMessage}</div>}

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Quick login (Demo)</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => quickLogin("K012345")}
              disabled={loginMutation.isPending}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Employee: Mohammad Farhadi
            </button>
            <button
              type="button"
              onClick={() => quickLogin("K012346")}
              disabled={loginMutation.isPending}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Employee: Bertold Oravecz
            </button>
            <button
              type="button"
              onClick={() => quickLogin("K012347")}
              disabled={loginMutation.isPending}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Employee: Carol Davis
            </button>
            <button
              type="button"
              onClick={() => quickLogin("K000001")}
              disabled={loginMutation.isPending}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Manager: Velthoven Jeroen-van
            </button>
            <button
              type="button"
              onClick={() => quickLogin("K012346")}
              disabled={loginMutation.isPending}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Employee: Bertold Oravecz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
