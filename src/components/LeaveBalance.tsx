'use client';

import { ILeaveBalance } from '@/types/LeaveBalance.type';

interface LeaveBalanceProps {
  balance: ILeaveBalance | undefined;
  isLoading: boolean;
}

export default function LeaveBalance({ balance, isLoading }: LeaveBalanceProps) {
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

  if (!balance) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">Leave balance not found.</p>
      </div>
    );
  }

  const remainingDays = balance.totalDays - balance.usedDays;
  const remainingHours = balance.totalHours - balance.usedHours;
  const usagePercentage = Math.round((balance.usedHours / balance.totalHours) * 100);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
        Leave Balance for {balance.year}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Allocation */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-600">Total Allocation</p>
              <p className="text-2xl font-semibold text-blue-900">{balance.totalDays} days</p>
              <p className="text-sm text-blue-700">{balance.totalHours} hours</p>
            </div>
          </div>
        </div>

        {/* Used */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-600">Used</p>
              <p className="text-2xl font-semibold text-orange-900">{balance.usedDays} days</p>
              <p className="text-sm text-orange-700">{balance.usedHours} hours</p>
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600">Remaining</p>
              <p className="text-2xl font-semibold text-green-900">{remainingDays} days</p>
              <p className="text-sm text-green-700">{remainingHours} hours</p>
            </div>
          </div>
        </div>

        {/* Usage Percentage */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-600">Usage</p>
              <p className="text-2xl font-semibold text-purple-900">{usagePercentage}%</p>
              <p className="text-sm text-purple-700">of total allocation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Leave Usage Progress</span>
          <span>{balance.usedHours}/{balance.totalHours} hours</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              usagePercentage > 80
                ? 'bg-red-500'
                : usagePercentage > 60
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Warnings */}
      {usagePercentage > 90 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Low leave balance</h3>
              <p className="text-sm text-red-700 mt-1">
                You have used {usagePercentage}% of your annual leave allocation.
              </p>
            </div>
          </div>
        </div>
      )}

      {remainingHours <= 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Leave balance exhausted</h3>
              <p className="text-sm text-red-700 mt-1">
                You have no remaining leave hours for this year.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
