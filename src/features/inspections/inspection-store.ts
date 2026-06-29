import { create } from 'zustand';

import {
  createInitialIssues,
  createMockChecklist,
  inspections as inspectionSeed,
} from './mock-data';

import type {
  ChecklistAnswer,
  ChecklistSection,
  Inspection,
  InspectionIssue,
  IssuePriority,
} from './types';
import { validateInspection } from './inspection-validation';

interface CreateIssuePayload {
  inspectionId: string;
  checklistItemId: string;
  title: string;
  description: string;
  priority: IssuePriority;
}

interface InspectionStore {
  inspections: Inspection[];
  checklists: Record<string, ChecklistSection[]>;
  issuesByInspection: Record<string, InspectionIssue[]>;

  startInspection: (inspectionId: string) => void;

  setChecklistAnswer: (
    inspectionId: string,
    checklistItemId: string,
    answer: ChecklistAnswer,
  ) => void;

  createIssue: (payload: CreateIssuePayload) => void;

  submitInspection: (inspectionId: string) => void;
}

const initialChecklists = Object.fromEntries(
  inspectionSeed.map((inspection) => [
    inspection.id,
    createMockChecklist(inspection),
  ]),
);

const initialIssues = Object.fromEntries(
  inspectionSeed.map((inspection) => [
    inspection.id,
    createInitialIssues(
      inspection,
      initialChecklists[inspection.id] ?? [],
    ),
  ]),
);

function getChecklistSummary(
  sections: ChecklistSection[],
  issues: InspectionIssue[],
) {
  const items = sections.flatMap((section) => section.items);

  return {
    totalItemsCount: items.length,
    completedItemsCount: items.filter((item) => item.answer !== null).length,
    issuesCount: issues.filter((issue) => issue.status === 'OPEN').length,
    criticalIssuesCount: issues.filter(
      (issue) =>
        issue.status === 'OPEN' && issue.priority === 'CRITICAL',
    ).length,
  };
}

function updateInspectionSummary(
  inspections: Inspection[],
  inspectionId: string,
  sections: ChecklistSection[],
  issues: InspectionIssue[],
) {
  const summary = getChecklistSummary(sections, issues);

  return inspections.map((inspection) => {
    if (inspection.id !== inspectionId) {
      return inspection;
    }

    return {
      ...inspection,
      ...summary,
      updatedAt: 'Just now',
    };
  });
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useInspectionStore = create<InspectionStore>()((set) => ({
  inspections: inspectionSeed,
  checklists: initialChecklists,
  issuesByInspection: initialIssues,

  startInspection: (inspectionId) => {
    set((state) => ({
      inspections: state.inspections.map((inspection) => {
        if (inspection.id !== inspectionId) {
          return inspection;
        }

        if (inspection.status !== 'ASSIGNED') {
          return inspection;
        }

        return {
          ...inspection,
          status: 'IN_PROGRESS',
          updatedAt: 'Just now',
        };
      }),
    }));
  },

  setChecklistAnswer: (inspectionId, checklistItemId, answer) => {
    set((state) => {
      const currentSections = state.checklists[inspectionId] ?? [];
      const currentIssues = state.issuesByInspection[inspectionId] ?? [];

      const nextSections = currentSections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== checklistItemId) {
            return item;
          }

          return {
            ...item,
            answer,
            comment: answer === 'FAIL' ? item.comment : null,
            issueId: answer === 'FAIL' ? item.issueId : null,
            updatedAt: 'Just now',
          };
        }),
      }));

      // Для MVP считаем, что одно замечание связано с одним checklist item.
      // Если пользователь меняет FAIL на PASS/N/A — закрываем замечание локально.
      const nextIssues =
        answer === 'FAIL'
          ? currentIssues
          : currentIssues.filter(
              (issue) => issue.checklistItemId !== checklistItemId,
            );

      return {
        checklists: {
          ...state.checklists,
          [inspectionId]: nextSections,
        },
        issuesByInspection: {
          ...state.issuesByInspection,
          [inspectionId]: nextIssues,
        },
        inspections: updateInspectionSummary(
          state.inspections,
          inspectionId,
          nextSections,
          nextIssues,
        ),
      };
    });
  },

  createIssue: ({
    inspectionId,
    checklistItemId,
    title,
    description,
    priority,
  }) => {
    set((state) => {
      const currentIssues = state.issuesByInspection[inspectionId] ?? [];
      const currentSections = state.checklists[inspectionId] ?? [];

      const issue: InspectionIssue = {
        id: makeId('issue'),
        inspectionId,
        checklistItemId,
        title,
        description,
        priority,
        status: 'OPEN',
        createdAt: 'Just now',
        updatedAt: 'Just now',
      };

      const nextIssues = [
        ...currentIssues.filter(
          (currentIssue) =>
            currentIssue.checklistItemId !== checklistItemId,
        ),
        issue,
      ];

      const nextSections = currentSections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== checklistItemId) {
            return item;
          }

          return {
            ...item,
            answer: 'FAIL' as const,
            comment: description,
            issueId: issue.id,
            updatedAt: 'Just now',
          };
        }),
      }));

      return {
        checklists: {
          ...state.checklists,
          [inspectionId]: nextSections,
        },
        issuesByInspection: {
          ...state.issuesByInspection,
          [inspectionId]: nextIssues,
        },
        inspections: updateInspectionSummary(
          state.inspections,
          inspectionId,
          nextSections,
          nextIssues,
        ),
      };
    });
  },

  submitInspection: (inspectionId) => {
  set((state) => {
    const sections = state.checklists[inspectionId] ?? [];
    const issues = state.issuesByInspection[inspectionId] ?? [];

    const validation = validateInspection(sections, issues);

    if (!validation.isReady) {
      return state;
    }

    return {
      inspections: state.inspections.map((inspection) => {
        if (inspection.id !== inspectionId) {
          return inspection;
        }

        return {
          ...inspection,
          status: 'SUBMITTED',
          updatedAt: 'Just now',
        };
      }),
    };
  });
},
}));