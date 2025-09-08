import { LeaveType, SpecialLeaveType } from "@prisma/client";

export interface LeaveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CreateLeaveBusinessRequest {
  startOfLeave: Date;
  endOfLeave: Date;
  leaveType: LeaveType;
  specialLeaveType?: SpecialLeaveType;
  employeeId: string;
  contractHours: number;
}

export class LeaveBusinessRulesService {
  static validateLeaveRequest(request: CreateLeaveBusinessRequest): LeaveValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { startOfLeave, endOfLeave, leaveType, specialLeaveType } = request;

    // Basic date validation
    if (startOfLeave >= endOfLeave) {
      errors.push("Start date must be before end date");
    }

    // Check if leave is in the past
    const now = new Date();
    if (startOfLeave <= now) {
      errors.push("Leave cannot be scheduled in the past");
    }

    // For special leaves, check advance notice (2 weeks)
    if (leaveType === LeaveType.SPECIAL) {
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      if (startOfLeave < twoWeeksFromNow) {
        errors.push("Special leaves must be requested at least 2 weeks in advance");
      }

      if (!specialLeaveType) {
        errors.push("Special leave type must be specified for special leaves");
      }
    }

    // Check if dates fall on weekends (simplified - assumes Mon-Fri work week)
    const startDay = startOfLeave.getDay();
    const endDay = endOfLeave.getDay();

    if (startDay === 0 || startDay === 6) {
      warnings.push("Leave starts on a weekend");
    }

    if (endDay === 0 || endDay === 6) {
      warnings.push("Leave ends on a weekend");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static calculateWorkingHours(startDate: Date, endDate: Date): number {
    // Simplified calculation - assumes 8 hours per day
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Filter out weekends (simplified)
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday or Saturday
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays * 8;
  }

  static getSpecialLeaveLimit(
    specialLeaveType: SpecialLeaveType,
    contractHours: number
  ): { maxDays: number; maxHours: number } {
    switch (specialLeaveType) {
      case SpecialLeaveType.MOVING:
        return { maxDays: 1, maxHours: 8 };
      case SpecialLeaveType.WEDDING:
        return { maxDays: 1, maxHours: 8 };
      case SpecialLeaveType.CHILD_BIRTH:
        return { maxDays: 5, maxHours: 40 };
      case SpecialLeaveType.PARENTAL_CARE:
        return { maxDays: (contractHours * 10) / 8, maxHours: contractHours * 10 };
      default:
        return { maxDays: 0, maxHours: 0 };
    }
  }
}
