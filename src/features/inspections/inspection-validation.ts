import type {
  ChecklistItem,
  ChecklistSection,
  InspectionIssue,
} from './types';

export interface InspectionValidationResult {
  isReady: boolean;
  requiredUnansweredItems: ChecklistItem[];
  failedWithoutIssueItems: ChecklistItem[];
}

export function validateInspection(
  sections: ChecklistSection[],
  issues: InspectionIssue[],
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

  return {
    isReady:
      requiredUnansweredItems.length === 0 &&
      failedWithoutIssueItems.length === 0,
    requiredUnansweredItems,
    failedWithoutIssueItems,
  };
}