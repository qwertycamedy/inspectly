import type {
  ChecklistItem,
  ChecklistSection,
  InspectionIssue,
  IssuePhoto,
} from './types';

export interface InspectionValidationResult {
  isReady: boolean;
  requiredUnansweredItems: ChecklistItem[];
  failedWithoutIssueItems: ChecklistItem[];
  criticalIssuesWithoutPhoto: InspectionIssue[];
}

export function validateInspection(
  sections: ChecklistSection[],
  issues: InspectionIssue[],
  issuePhotosByIssue: Record<string, IssuePhoto[]>,
): InspectionValidationResult {
  const items = sections.flatMap((section) => section.items);

  const requiredUnansweredItems = items.filter(
    (item) => item.isRequired && item.answer === null,
  );

  const failedWithoutIssueItems = items.filter((item) => {
    if (item.answer !== 'FAIL') {
      return false;
    }

    const issue = issues.find(
      (currentIssue) => currentIssue.checklistItemId === item.id,
    );

    return !issue || !issue.description.trim();
  });

  const criticalIssuesWithoutPhoto = issues.filter((issue) => {
    if (issue.status !== 'OPEN' || issue.priority !== 'CRITICAL') {
      return false;
    }

    const photos = issuePhotosByIssue[issue.id] ?? [];

    return photos.length === 0;
  });

  return {
    isReady:
      requiredUnansweredItems.length === 0 &&
      failedWithoutIssueItems.length === 0 &&
      criticalIssuesWithoutPhoto.length === 0,
    requiredUnansweredItems,
    failedWithoutIssueItems,
    criticalIssuesWithoutPhoto,
  };
}