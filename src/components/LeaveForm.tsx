"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateLeave } from "@/hooks/useLeaves";
import { ICreateLeaveRequest, LeaveType, SpecialLeaveType } from "@/types/Leave.type";

interface LeaveFormProps {
  onSuccess: () => void;
}

export default function LeaveForm({ onSuccess }: LeaveFormProps) {
  const { getCurrentUser } = useAuth();
  const createLeaveMutation = useCreateLeave();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState<ICreateLeaveRequest>({
    leaveLabel: "",
    employeeId: currentUser?.employeeId || "",
    startOfLeave: getDefaultStartDateString(),
    endOfLeave: getDefaultEndDateString(),
    leaveType: LeaveType.REGULAR,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function getDefaultStartDateString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  }

  function getDefaultEndDateString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createLeaveMutation.mutateAsync(formData);
      setSuccessMessage("Leave request submitted successfully!");

      // Reset form
      setFormData({
        leaveLabel: "",
        employeeId: currentUser?.employeeId || "",
        startOfLeave: getDefaultStartDateString(),
        endOfLeave: getDefaultEndDateString(),
        leaveType: LeaveType.REGULAR,
      });

      // Call onSuccess after a brief delay to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Failed to create leave request");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset special leave type when changing leave type
    if (name === "leaveType" && value !== LeaveType.SPECIAL) {
      setFormData((prev) => ({
        ...prev,
        specialLeaveType: undefined,
      }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Request New Leave</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="leaveLabel" className="block text-sm font-medium text-gray-700">
            Leave Description
          </label>
          <input
            type="text"
            id="leaveLabel"
            name="leaveLabel"
            required
            value={formData.leaveLabel}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Summer vacation, Doctor appointment"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startOfLeave" className="block text-sm font-medium text-gray-700">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startOfLeave"
              name="startOfLeave"
              required
              value={formData.startOfLeave}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="endOfLeave" className="block text-sm font-medium text-gray-700">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endOfLeave"
              name="endOfLeave"
              required
              value={formData.endOfLeave}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
            Leave Type
          </label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value={LeaveType.REGULAR}>Regular Leave</option>
            <option value={LeaveType.SPECIAL}>Special Leave</option>
          </select>
        </div>

        {formData.leaveType === LeaveType.SPECIAL && (
          <div>
            <label htmlFor="specialLeaveType" className="block text-sm font-medium text-gray-700">
              Special Leave Type
            </label>
            <select
              id="specialLeaveType"
              name="specialLeaveType"
              value={formData.specialLeaveType || ""}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select special leave type</option>
              <option value={SpecialLeaveType.MOVING}>Moving (1 day)</option>
              <option value={SpecialLeaveType.WEDDING}>Wedding (1 day)</option>
              <option value={SpecialLeaveType.CHILD_BIRTH}>Child Birth (max 5 days)</option>
              <option value={SpecialLeaveType.PARENTAL_CARE}>Parental Care</option>
            </select>
          </div>
        )}

        {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}

        {successMessage && <div className="text-green-600 text-sm">{successMessage}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createLeaveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
