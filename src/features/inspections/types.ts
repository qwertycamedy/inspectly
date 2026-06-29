export type InspectionStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SUBMITTED'
  | 'SYNC_ERROR';

export type InspectionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type LocationType = 'OFFICE' | 'STORE' | 'WAREHOUSE' | 'APARTMENT';

export type ChecklistAnswer = 'PASS' | 'FAIL' | 'NOT_APPLICABLE';

export type IssueStatus = 'OPEN' | 'RESOLVED';

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

export interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  isRequired: boolean;

  answer: ChecklistAnswer | null;
  comment: string | null;
  issueId: string | null;

  updatedAt: string | null;
}

export interface ChecklistSection {
  id: string;
  title: string;
  order: number;
  items: ChecklistItem[];
}

export interface InspectionIssue {
  id: string;
  inspectionId: string;
  checklistItemId: string;

  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;

  createdAt: string;
  updatedAt: string;
}

export interface IssuePhoto {
  id: string;
  inspectionId: string;
  issueId: string;
  checklistItemId: string;

  localUri: string;
  width: number;
  height: number;
  mimeType: string | null;

  createdAt: string;
}