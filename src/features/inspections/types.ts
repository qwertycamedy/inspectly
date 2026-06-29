export type InspectionStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SUBMITTED"
  | "SYNC_ERROR";

export type InspectionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type LocationType = "OFFICE" | "STORE" | "WAREHOUSE" | "APARTMENT";

export interface Inspection {
  id: string;

  title: string;

  locationName: string;
  locationType: LocationType;
  address: string;

  status: InspectionStatus;
  priority: InspectionPriority;

  scheduledAt: string;
  deadlineAt: string | null;

  completedItemsCount: number;
  totalItemsCount: number;

  issuesCount: number;
  criticalIssuesCount: number;

  updatedAt: string;
}
