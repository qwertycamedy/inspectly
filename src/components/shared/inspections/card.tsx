import { Inspection, InspectionPriority, InspectionStatus } from "@/features/inspections/types";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const statusLabelMap: Record<InspectionStatus, string> = {
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  SUBMITTED: 'Submitted',
  SYNC_ERROR: 'Sync issue',
};

const priorityLabelMap: Record<InspectionPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};


function getStatusStyle(status: InspectionStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return styles.statusInProgress;
    case "COMPLETED":
    case "SUBMITTED":
      return styles.statusCompleted;
    case "SYNC_ERROR":
      return styles.statusSyncError;
    default:
      return styles.statusAssigned;
  }
}

function getPriorityStyle(priority: InspectionPriority) {
  switch (priority) {
    case "CRITICAL":
      return styles.priorityCritical;
    case "HIGH":
      return styles.priorityHigh;
    case "MEDIUM":
      return styles.priorityMedium;
    default:
      return styles.priorityLow;
  }
}

export function InspectionCard({ inspection }: { inspection: Inspection }) {
  const progress = inspection.completedItemsCount / inspection.totalItemsCount;
  const progressPercent = Math.round(progress * 100);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(app)/inspections/[id]",
          params: { id: inspection.id },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.locationTypeBadge}>
          <Text style={styles.locationTypeText}>{inspection.locationType}</Text>
        </View>

        <View
          style={[styles.priorityBadge, getPriorityStyle(inspection.priority)]}
        >
          <Text style={styles.priorityText}>
            {priorityLabelMap[inspection.priority]}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{inspection.title}</Text>
      <Text style={styles.locationName}>{inspection.locationName}</Text>
      <Text style={styles.address}>{inspection.address}</Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Progress: {inspection.completedItemsCount}/
          {inspection.totalItemsCount}
        </Text>
        <Text style={styles.progressPercent}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Issues</Text>
          <Text style={styles.metaValue}>{inspection.issuesCount}</Text>
        </View>

        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Critical</Text>
          <Text
            style={[
              styles.metaValue,
              inspection.criticalIssuesCount > 0 && styles.criticalValue,
            ]}
          >
            {inspection.criticalIssuesCount}
          </Text>
        </View>

        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Deadline</Text>
          <Text style={styles.deadlineValue}>
            {inspection.deadlineAt ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, getStatusStyle(inspection.status)]}>
          <Text style={styles.statusText}>
            {statusLabelMap[inspection.status]}
          </Text>
        </View>

        <Text style={styles.updatedAt}>{inspection.updatedAt}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9EDF4",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationTypeBadge: {
    backgroundColor: "#EEF3FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  locationTypeText: {
    color: "#2E5BFF",
    fontSize: 10,
    fontWeight: "800",
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  priorityText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  priorityCritical: {
    backgroundColor: "#DC3E42",
  },
  priorityHigh: {
    backgroundColor: "#E5812F",
  },
  priorityMedium: {
    backgroundColor: "#C58A00",
  },
  priorityLow: {
    backgroundColor: "#607087",
  },
  cardTitle: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
  },
  locationName: {
    color: "#303B50",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },
  address: {
    color: "#7A8495",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  progressText: {
    color: "#536074",
    fontSize: 12,
    fontWeight: "700",
  },
  progressPercent: {
    color: "#172033",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#EDF0F5",
    borderRadius: 8,
    height: 7,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#2E5BFF",
    borderRadius: 8,
    height: "100%",
  },
  metaRow: {
    borderBottomColor: "#EEF1F5",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 20,
    marginTop: 18,
    paddingBottom: 15,
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    color: "#8A94A4",
    fontSize: 11,
    fontWeight: "700",
  },
  metaValue: {
    color: "#243047",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  criticalValue: {
    color: "#DC3E42",
  },
  deadlineValue: {
    color: "#243047",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  statusAssigned: {
    backgroundColor: "#5374B8",
  },
  statusInProgress: {
    backgroundColor: "#2E5BFF",
  },
  statusCompleted: {
    backgroundColor: "#24956B",
  },
  statusSyncError: {
    backgroundColor: "#DC3E42",
  },
  updatedAt: {
    color: "#97A0AF",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 72,
  },
  emptyTitle: {
    color: "#243047",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#7B8494",
    fontSize: 14,
    marginTop: 6,
  },
});
