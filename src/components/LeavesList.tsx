"use client";

import { useState } from "react";
import { ILeave } from "@/types/Leave.type";
import { useDeleteLeave, useUpdateLeaveStatus } from "@/hooks/useLeaves";

interface LeavesListProps {
  leaves: ILeave[];
  isLoading: boolean;
  showEmployee: boolean;
  canManage: boolean;
  canApprove?: boolean;
  currentUserId: string;
}

export default function LeavesList({
  leaves,
  isLoading,
  showEmployee,
  canManage,
  canApprove = false,
  currentUserId,
}: LeavesListProps) {
  const deleteLeaveMutation = useDeleteLeave();
  const updateStatusMutation = useUpdateLeaveStatus();

  const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
      case "CLOSED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canDeleteLeave = (leave: ILeave): boolean => {
    const startDate = new Date(leave.startOfLeave);
    const now = new Date();
    return startDate > now && leave.status !== "CLOSED" && leave.status !== "APPROVED";
  };

  const handleDeleteLeave = async (leaveId: string) => {
    if (confirm("Are you sure you want to cancel this leave request?")) {
      try {
        await deleteLeaveMutation.mutateAsync({ leaveId, employeeId: currentUserId });
      } catch (error) {
        console.error("Error deleting leave:", error);
        alert("Error canceling leave request. Please try again.");
      }
    }
  };

  const handleApproveLeave = async (leaveId: string, approved: boolean = true) => {
    const status = approved ? "APPROVED" : "REJECTED";
    const action = approved ? "approve" : "reject";

    if (confirm(`Are you sure you want to ${action} this leave request?`)) {
      try {
        await updateStatusMutation.mutateAsync({
          leaveId,
          status,
          approverId: currentUserId,
        });
      } catch (error) {
        console.error(`Error ${action}ing leave:`, error);
        alert(`Error ${action}ing leave. Please try again.`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No leaves found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {canApprove ? "Pending Approvals" : "Leave Requests"}
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {showEmployee && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.leaveId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {leave.leaveLabel}
                  </td>
                  {showEmployee && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.employee?.name || "Unknown"}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(leave.startOfLeave)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(leave.endOfLeave)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.leaveType === "SPECIAL"
                      ? `Special (${leave.specialLeaveType})`
                      : "Regular"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.totalHours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canApprove && leave.status === "REQUESTED" && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(leave.leaveId, true)}
                          disabled={updateStatusMutation.isPending}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveLeave(leave.leaveId, false)}
                          disabled={updateStatusMutation.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {canManage && canDeleteLeave(leave) && (
                      <button
                        onClick={() => handleDeleteLeave(leave.leaveId)}
                        disabled={deleteLeaveMutation.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
