import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/ui";
import { useInspectionStore } from "@/features/inspections/inspection-store";

export default function InspectionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inspection = useInspectionStore((state) =>
    state.inspections.find((item) => item.id === id),
  );
  const startInspection = useInspectionStore((state) => state.startInspection);

  if (!inspection) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.notFoundTitle}>Inspection not found</Text>

        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </Screen>
    );
  }

  const progress = Math.round(
    (inspection.completedItemsCount / inspection.totalItemsCount) * 100,
  );

  function handleOpenChecklist() {
    if (!inspection) {
      return;
    }

    if (inspection.status === "ASSIGNED") {
      startInspection(inspection.id);
    }

    router.push(`/inspections/${inspection.id}/checklist`);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>INSPECTION DETAILS</Text>
            <Text style={styles.title}>{inspection.title}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.locationName}>{inspection.locationName}</Text>
          <Text style={styles.address}>{inspection.address}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.statValue}>
                {inspection.completedItemsCount}/{inspection.totalItemsCount}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Issues</Text>
              <Text style={styles.statValue}>{inspection.issuesCount}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Critical</Text>
              <Text
                style={[
                  styles.statValue,
                  inspection.criticalIssuesCount > 0 && styles.critical,
                ]}
              >
                {inspection.criticalIssuesCount}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>

          <View style={styles.infoCard}>
            <InfoRow
              label="Status"
              value={inspection.status.replace("_", " ")}
            />
            <InfoRow label="Priority" value={inspection.priority} />
            <InfoRow label="Scheduled" value={inspection.scheduledAt} />
            <InfoRow
              label="Deadline"
              value={inspection.deadlineAt ?? "No deadline"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection workflow</Text>

          <View style={styles.workflowCard}>
            <WorkflowRow
              number="1"
              title="Review object details"
              description="Confirm location and inspection scope."
            />
            <WorkflowRow
              number="2"
              title="Complete checklist"
              description="Mark each item as pass, fail, or not applicable."
            />
            <WorkflowRow
              number="3"
              title="Document issues"
              description="Add comments, priority and photo evidence."
            />
            <WorkflowRow
              number="4"
              title="Submit report"
              description="Review all findings before sending."
            />
          </View>
        </View>

        <Pressable onPress={handleOpenChecklist} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {inspection.status === "ASSIGNED"
              ? "Start inspection"
              : inspection.status === "SUBMITTED"
                ? "View checklist"
                : "Continue inspection"}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function WorkflowRow({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.workflowRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>

      <View style={styles.workflowText}>
        <Text style={styles.workflowTitle}>{title}</Text>
        <Text style={styles.workflowDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5EAF2",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonText: {
    color: "#172033",
    fontSize: 30,
    fontWeight: "400",
    lineHeight: 31,
    marginTop: -4,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: "#2E5BFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    color: "#172033",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 3,
  },
  heroCard: {
    backgroundColor: "#172033",
    borderRadius: 22,
    padding: 18,
  },
  locationName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  address: {
    color: "#B9C2D2",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  divider: {
    backgroundColor: "#33405B",
    height: 1,
    marginVertical: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: "#A8B4C6",
    fontSize: 11,
    fontWeight: "700",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
  },
  critical: {
    color: "#FF969A",
  },
  progressTrack: {
    backgroundColor: "#3A4966",
    borderRadius: 999,
    height: 7,
    marginTop: 18,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#5B82FF",
    borderRadius: 999,
    height: "100%",
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: "#243047",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9EDF4",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    alignItems: "center",
    borderBottomColor: "#EEF1F5",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 53,
    paddingHorizontal: 15,
  },
  infoLabel: {
    color: "#7A8494",
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: "#243047",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  workflowCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9EDF4",
    borderRadius: 18,
    borderWidth: 1,
    gap: 18,
    padding: 16,
  },
  workflowRow: {
    flexDirection: "row",
    gap: 12,
  },
  stepBadge: {
    alignItems: "center",
    backgroundColor: "#EEF3FF",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stepNumber: {
    color: "#2E5BFF",
    fontSize: 12,
    fontWeight: "800",
  },
  workflowText: {
    flex: 1,
  },
  workflowTitle: {
    color: "#263248",
    fontSize: 14,
    fontWeight: "800",
  },
  workflowDescription: {
    color: "#788395",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2E5BFF",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 28,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  notFoundTitle: {
    color: "#243047",
    fontSize: 20,
    fontWeight: "800",
  },
});
