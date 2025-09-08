"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeLeaves, useManagerLeaves } from "@/hooks/useLeaves";
import { useLeaveBalance } from "@/hooks/useLeaveBalance";
import LeaveForm from "@/components/LeaveForm";
import LeavesList from "@/components/LeavesList";
import LeaveBalance from "@/components/LeaveBalance";

export default function Dashboard() {
  const { isAuthenticated, getCurrentUser, logout, isManager } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-leaves");
  const currentUser = getCurrentUser();

  // Data hooks
  const { data: myLeaves, isLoading: myLeavesLoading } = useEmployeeLeaves(currentUser?.employeeId);
  const { data: managerLeaves, isLoading: managerLeavesLoading } = useManagerLeaves(
    isManager() ? currentUser?.employeeId : undefined
  );
  const { data: leaveBalance, isLoading: balanceLoading } = useLeaveBalance(
    currentUser?.employeeId
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated() || !currentUser) {
    return null;
  }

  const pendingApprovals = managerLeaves?.filter((leave) => leave.status === "REQUESTED") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600">Welcome, {currentUser.name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("my-leaves")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "my-leaves"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Leaves
              </button>
              <button
                onClick={() => setActiveTab("request-leave")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "request-leave"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Request Leave
              </button>
              <button
                onClick={() => setActiveTab("balance")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "balance"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Leave Balance
              </button>
              {isManager() && (
                <button
                  onClick={() => setActiveTab("approvals")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "approvals"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Pending Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "my-leaves" && (
              <LeavesList
                leaves={myLeaves || []}
                isLoading={myLeavesLoading}
                showEmployee={false}
                canManage={true}
                currentUserId={currentUser.employeeId}
              />
            )}

            {activeTab === "request-leave" && (
              <LeaveForm onSuccess={() => setActiveTab("my-leaves")} />
            )}

            {activeTab === "balance" && (
              <LeaveBalance balance={leaveBalance} isLoading={balanceLoading} />
            )}

            {activeTab === "approvals" && isManager() && (
              <LeavesList
                leaves={pendingApprovals}
                isLoading={managerLeavesLoading}
                showEmployee={true}
                canManage={false}
                canApprove={true}
                currentUserId={currentUser.employeeId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
