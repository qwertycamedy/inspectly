import type {
  ChecklistItem,
  ChecklistSection,
  Inspection,
  InspectionIssue,
} from "./types";

export const inspections: Inspection[] = [
  {
    id: "inspection-001",
    title: "Safety inspection",
    locationName: "Warehouse #12",
    locationType: "WAREHOUSE",
    address: "ул. Абая, 145, Алматы",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    scheduledAt: "Today, 10:00",
    deadlineAt: "Today, 18:00",
    completedItemsCount: 18,
    totalItemsCount: 24,
    issuesCount: 3,
    criticalIssuesCount: 1,
    updatedAt: "12 min ago",
  },
  {
    id: "inspection-002",
    title: "Store compliance check",
    locationName: "Green Market — Point 4",
    locationType: "STORE",
    address: "пр. Достык, 87, Алматы",
    status: "ASSIGNED",
    priority: "HIGH",
    scheduledAt: "Today, 14:30",
    deadlineAt: "Tomorrow, 12:00",
    completedItemsCount: 0,
    totalItemsCount: 18,
    issuesCount: 0,
    criticalIssuesCount: 0,
    updatedAt: "35 min ago",
  },
  {
    id: "inspection-003",
    title: "Office facility review",
    locationName: "North Tower, Floor 9",
    locationType: "OFFICE",
    address: "ул. Тимирязева, 42, Алматы",
    status: "COMPLETED",
    priority: "MEDIUM",
    scheduledAt: "Yesterday, 11:00",
    deadlineAt: null,
    completedItemsCount: 31,
    totalItemsCount: 31,
    issuesCount: 2,
    criticalIssuesCount: 0,
    updatedAt: "Yesterday",
  },
  {
    id: "inspection-004",
    title: "Apartment handover inspection",
    locationName: "Residential complex Aurora",
    locationType: "APARTMENT",
    address: "ул. Кабанбай батыра, 19, Астана",
    status: "SUBMITTED",
    priority: "LOW",
    scheduledAt: "June 25, 09:30",
    deadlineAt: null,
    completedItemsCount: 22,
    totalItemsCount: 22,
    issuesCount: 1,
    criticalIssuesCount: 0,
    updatedAt: "June 25",
  },
  {
    id: "inspection-005",
    title: "Fire safety inspection",
    locationName: "Logistics Center A",
    locationType: "WAREHOUSE",
    address: "Индустриальная зона, блок 7, Астана",
    status: "SYNC_ERROR",
    priority: "HIGH",
    scheduledAt: "Today, 16:00",
    deadlineAt: "Today, 20:00",
    completedItemsCount: 9,
    totalItemsCount: 16,
    issuesCount: 2,
    criticalIssuesCount: 0,
    updatedAt: "Offline changes pending",
  },
];

const checklistTemplate = [
  {
    title: 'Access and entry',
    items: [
      'Main entrance is clear and accessible',
      'Emergency exits are unlocked',
      'Evacuation routes are clearly marked',
      'Visitor sign-in process is available',
      'Accessibility ramp is usable',
      'Door closers are functioning correctly',
    ],
  },
  {
    title: 'Fire safety',
    items: [
      'Fire extinguishers are present',
      'Fire extinguishers are within service date',
      'Fire alarm panel is operational',
      'Emergency lighting is working',
      'Fire evacuation plan is visible',
      'Fire doors are closed and unobstructed',
    ],
  },
  {
    title: 'Electrical safety',
    items: [
      'Electrical panels are closed and labelled',
      'Power sockets have no visible damage',
      'Extension cords are used safely',
      'Cables are not blocking walkways',
      'Electrical equipment has no visible defects',
      'Emergency power systems are accessible',
    ],
  },
  {
    title: 'Workspace conditions',
    items: [
      'Work areas are clean and organised',
      'Walkways are clear of obstacles',
      'Storage areas are properly labelled',
      'Lighting is sufficient for work tasks',
      'Ventilation is functioning correctly',
      'Waste containers are available and used properly',
    ],
  },
  {
    title: 'Equipment and operations',
    items: [
      'Required equipment is available',
      'Equipment is maintained and functional',
      'Safety labels are visible',
      'Operational instructions are available',
      'Protective equipment is available',
      'Restricted areas are secured',
    ],
  },
  {
    title: 'Documentation',
    items: [
      'Mandatory policies are available',
      'Emergency contacts are displayed',
      'Inspection log is up to date',
      'Staff training records are available',
      'Equipment maintenance records are complete',
      'Incident reporting process is documented',
    ],
  },
];

export function createMockChecklist(
  inspection: Inspection,
): ChecklistSection[] {
  let itemPosition = 0;

  const sections: ChecklistSection[] = [];

  for (let sectionIndex = 0; sectionIndex < checklistTemplate.length; sectionIndex += 1) {
    const templateSection = checklistTemplate[sectionIndex];
    const items: ChecklistItem[] = [];

    for (let itemIndex = 0; itemIndex < templateSection.items.length; itemIndex += 1) {
      if (itemPosition >= inspection.totalItemsCount) {
        break;
      }

      const title = templateSection.items[itemIndex];
      const currentPosition = itemPosition;
      itemPosition += 1;

      const isCompleted = currentPosition < inspection.completedItemsCount;
      const isFailed = isCompleted && currentPosition < inspection.issuesCount;

      const item: ChecklistItem = {
        id: `${inspection.id}-item-${sectionIndex + 1}-${itemIndex + 1}`,
        title,
        description: null,
        isRequired: itemIndex !== 5,
        answer: !isCompleted ? null : isFailed ? 'FAIL' : 'PASS',
        comment: isFailed
          ? 'Follow-up is required before the inspection can be submitted.'
          : null,
        issueId: null,
        updatedAt: isCompleted ? inspection.updatedAt : null,
      };

      items.push(item);
    }

    if (items.length > 0) {
      sections.push({
        id: `${inspection.id}-section-${sectionIndex + 1}`,
        title: templateSection.title,
        order: sectionIndex + 1,
        items,
      });
    }
  }

  return sections;
}

export function createInitialIssues(
  inspection: Inspection,
  sections: ChecklistSection[],
): InspectionIssue[] {
  const failedItems = sections
    .flatMap((section) => section.items)
    .filter((item) => item.answer === 'FAIL');

  return failedItems.map((item, index) => ({
    id: `${inspection.id}-initial-issue-${index + 1}`,
    inspectionId: inspection.id,
    checklistItemId: item.id,
    title: item.title,
    description:
      item.comment ?? 'A follow-up action is required for this checklist item.',
    priority:
      index < inspection.criticalIssuesCount
        ? 'CRITICAL'
        : inspection.priority === 'LOW'
          ? 'LOW'
          : 'HIGH',
    status: 'OPEN',
    createdAt: inspection.updatedAt,
    updatedAt: inspection.updatedAt,
  }));
}