import { InspectionCard } from "@/components/shared";
import { Screen } from "@/components/ui";
import { inspections } from "@/features/inspections/mock-data";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";

type FilterKey = "ALL" | "IN_PROGRESS" | "ASSIGNED" | "COMPLETED" | "SUBMITTED";

const filters: { label: string; value: FilterKey }[] = [
  { label: "All", value: "ALL" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Submitted", value: "SUBMITTED" },
];

export default function InspectionsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const filteredInspections = useMemo(() => {
    if (activeFilter === "ALL") {
      return inspections;
    }

    return inspections.filter(
      (inspection) => inspection.status === activeFilter,
    );
  }, [activeFilter]);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>INSPECTLY</Text>
          <Text style={styles.heading}>My inspections</Text>
          <Text style={styles.subtitle}>
            Keep every site inspection under control.
          </Text>
        </View>

        <Pressable style={styles.avatar}>
          <Text style={styles.avatarText}>QC</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <Pressable
              key={filter.value}
              onPress={() => setActiveFilter(filter.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredInspections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <InspectionCard inspection={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No inspections found</Text>
            <Text style={styles.emptyText}>Try selecting another filter.</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#2E5BFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 4,
  },
  heading: {
    color: "#172033",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: "#6E7787",
    fontSize: 14,
    marginTop: 5,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#172033",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  filtersContent: {
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EAF2",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
    height: 38,
  },
  filterChipActive: {
    backgroundColor: "#172033",
    borderColor: "#172033",
  },
  filterText: {
    color: "#647084",
    fontSize: 13,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    gap: 12,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
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
