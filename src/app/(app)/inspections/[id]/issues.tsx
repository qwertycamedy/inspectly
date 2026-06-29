import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui';
import { useInspectionStore } from '@/features/inspections/inspection-store';

import type { IssuePriority } from '@/features/inspections/types';

const priorityLabelMap: Record<IssuePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

function getPriorityStyle(priority: IssuePriority) {
  switch (priority) {
    case 'CRITICAL':
      return styles.priorityCritical;
    case 'HIGH':
      return styles.priorityHigh;
    case 'MEDIUM':
      return styles.priorityMedium;
    default:
      return styles.priorityLow;
  }
}

export default function IssuesScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const inspection = useInspectionStore((state) =>
    state.inspections.find((item) => item.id === id),
  );

  const issues = useInspectionStore(
    (state) => state.issuesByInspection[id] ?? [],
  );

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

  const openIssues = issues.filter((issue) => issue.status === 'OPEN');
  const criticalIssues = openIssues.filter(
    (issue) => issue.priority === 'CRITICAL',
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>INSPECTION ISSUES</Text>
            <Text numberOfLines={1} style={styles.title}>
              {inspection.locationName}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Open issues</Text>
            <Text style={styles.summaryValue}>{openIssues.length}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Critical</Text>
            <Text style={[styles.summaryValue, styles.criticalValue]}>
              {criticalIssues.length}
            </Text>
          </View>
        </View>

        {openIssues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No issues recorded</Text>
            <Text style={styles.emptyText}>
              Failed checklist items and their comments will appear here.
            </Text>

            <Pressable
              onPress={() =>
                router.push(`/inspections/${inspection.id}/checklist`)
              }
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Open checklist</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {openIssues.map((issue, index) => (
              <View key={issue.id} style={styles.issueCard}>
                <View style={styles.issueTopRow}>
                  <View style={styles.issueNumber}>
                    <Text style={styles.issueNumberText}>{index + 1}</Text>
                  </View>

                  <View
                    style={[
                      styles.priorityBadge,
                      getPriorityStyle(issue.priority),
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {priorityLabelMap[issue.priority]}
                    </Text>
                  </View>
                </View>

                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>

                <View style={styles.issueFooter}>
                  <Text style={styles.openStatus}>Open</Text>
                  <Text style={styles.updatedAt}>{issue.updatedAt}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => router.push(`/inspections/${inspection.id}/report`)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Review report</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EAF2',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButtonText: {
    color: '#172033',
    fontSize: 30,
    lineHeight: 31,
    marginTop: -4,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#2E5BFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: '#172033',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
    padding: 18,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#AEBAD0',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 5,
  },
  criticalValue: {
    color: '#FF989C',
  },
  summaryDivider: {
    backgroundColor: '#394865',
    height: 42,
    width: 1,
  },
  list: {
    gap: 12,
    marginTop: 20,
  },
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECF3',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  issueTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  issueNumber: {
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: 8,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  issueNumberText: {
    color: '#C53A3E',
    fontSize: 11,
    fontWeight: '800',
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityLow: {
    backgroundColor: '#607087',
  },
  priorityMedium: {
    backgroundColor: '#C58A00',
  },
  priorityHigh: {
    backgroundColor: '#E5812F',
  },
  priorityCritical: {
    backgroundColor: '#DC3E42',
  },
  issueTitle: {
    color: '#263248',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 14,
  },
  issueDescription: {
    color: '#6F7B8E',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  issueFooter: {
    alignItems: 'center',
    borderTopColor: '#EEF1F5',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
  },
  openStatus: {
    color: '#C53A3E',
    fontSize: 11,
    fontWeight: '800',
  },
  updatedAt: {
    color: '#97A0AF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECF3',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
    padding: 24,
  },
  emptyTitle: {
    color: '#263248',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: '#758195',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: '#2E5BFF',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2E5BFF',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 54,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  notFoundTitle: {
    color: '#243047',
    fontSize: 20,
    fontWeight: '800',
  },
});