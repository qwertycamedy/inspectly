import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui';
import { useInspectionStore } from '@/features/inspections/inspection-store';
import { validateInspection } from '@/features/inspections/inspection-validation';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const inspection = useInspectionStore((state) =>
    state.inspections.find((item) => item.id === id),
  );

  const sections = useInspectionStore(
    (state) => state.checklists[id] ?? [],
  );

  const issues = useInspectionStore(
    (state) => state.issuesByInspection[id] ?? [],
  );

  const submitInspection = useInspectionStore(
    (state) => state.submitInspection,
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

  const items = sections.flatMap((section) => section.items);

  const passCount = items.filter((item) => item.answer === 'PASS').length;
  const failCount = items.filter((item) => item.answer === 'FAIL').length;
  const naCount = items.filter(
    (item) => item.answer === 'NOT_APPLICABLE',
  ).length;
  const pendingCount = items.filter((item) => item.answer === null).length;

  const validation = validateInspection(sections, issues);

  function handleSubmit() {
    if (!validation.isReady || !inspection) {
      return;
    }

    submitInspection(inspection.id);

    Alert.alert(
      'Report submitted',
      'The inspection report is ready for manager review.',
      [
        {
          text: 'Done',
          onPress: () => router.replace(`/inspections/${inspection.id}`),
        },
      ],
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>REPORT REVIEW</Text>
            <Text numberOfLines={1} style={styles.title}>
              {inspection.locationName}
            </Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Inspection status</Text>
          <Text style={styles.statusValue}>
            {inspection.status === 'SUBMITTED'
              ? 'Submitted'
              : 'Ready for review'}
          </Text>
          <Text style={styles.statusDescription}>
            Review findings and complete outstanding checklist requirements.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Checklist summary</Text>

        <View style={styles.metricsGrid}>
          <MetricCard label="Pass" value={passCount} tone="green" />
          <MetricCard label="Fail" value={failCount} tone="red" />
          <MetricCard label="N/A" value={naCount} tone="gray" />
          <MetricCard label="Pending" value={pendingCount} tone="blue" />
        </View>

        <Text style={styles.sectionTitle}>Submission validation</Text>

        <View style={styles.validationCard}>
          <ValidationRow
            isValid={validation.requiredUnansweredItems.length === 0}
            title="Required checklist items"
            description={
              validation.requiredUnansweredItems.length === 0
                ? 'All mandatory checks have been completed.'
                : `${validation.requiredUnansweredItems.length} required item(s) still need an answer.`
            }
          />

          <View style={styles.divider} />

          <ValidationRow
            isValid={validation.failedWithoutIssueItems.length === 0}
            title="Failed items documented"
            description={
              validation.failedWithoutIssueItems.length === 0
                ? 'Every failed check has an issue description.'
                : `${validation.failedWithoutIssueItems.length} failed item(s) need an issue description.`
            }
          />

          <View style={styles.divider} />

          <ValidationRow
            isValid
            title="Open issues"
            description={`${issues.length} issue(s) will be included in the report.`}
          />
        </View>

        {!validation.isReady ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Report is not ready yet</Text>
            <Text style={styles.warningText}>
              Complete all required checks and document each failed item before
              submitting.
            </Text>

            <Pressable
              onPress={() =>
                router.push(`/inspections/${inspection.id}/checklist`)
              }
              style={styles.warningButton}
            >
              <Text style={styles.warningButtonText}>Return to checklist</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>Ready to submit</Text>
            <Text style={styles.readyText}>
              All required checklist items are complete and all findings are documented.
            </Text>
          </View>
        )}

        {inspection.status === 'SUBMITTED' ? (
          <View style={styles.submittedCard}>
            <Text style={styles.submittedTitle}>Report already submitted</Text>
            <Text style={styles.submittedText}>
              The manager can now review findings and take follow-up actions.
            </Text>
          </View>
        ) : (
          <Pressable
            disabled={!validation.isReady}
            onPress={handleSubmit}
            style={[
              styles.primaryButton,
              !validation.isReady && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>Submit report</Text>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'red' | 'gray' | 'blue';
}) {
  const toneStyleMap = {
    green: styles.metricGreen,
    red: styles.metricRed,
    gray: styles.metricGray,
    blue: styles.metricBlue,
  };

  return (
    <View style={[styles.metricCard, toneStyleMap[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ValidationRow({
  isValid,
  title,
  description,
}: {
  isValid: boolean;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.validationRow}>
      <View
        style={[
          styles.validationIcon,
          isValid ? styles.validationIconValid : styles.validationIconInvalid,
        ]}
      >
        <Text style={styles.validationIconText}>{isValid ? '✓' : '!'}</Text>
      </View>

      <View style={styles.validationText}>
        <Text style={styles.validationTitle}>{title}</Text>
        <Text style={styles.validationDescription}>{description}</Text>
      </View>
    </View>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
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
  statusCard: {
    backgroundColor: '#172033',
    borderRadius: 20,
    padding: 18,
  },
  statusLabel: {
    color: '#AEBAD0',
    fontSize: 11,
    fontWeight: '700',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  statusDescription: {
    color: '#C1CAD9',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  sectionTitle: {
    color: '#263248',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 11,
    marginTop: 26,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    borderRadius: 16,
    flexGrow: 1,
    minWidth: '45%',
    padding: 14,
  },
  metricGreen: {
    backgroundColor: '#EAF8F2',
  },
  metricRed: {
    backgroundColor: '#FFF0F0',
  },
  metricGray: {
    backgroundColor: '#F0F3F7',
  },
  metricBlue: {
    backgroundColor: '#EEF3FF',
  },
  metricLabel: {
    color: '#66748A',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#243047',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
  },
  validationCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECF3',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  validationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  validationIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  validationIconValid: {
    backgroundColor: '#DFF5E9',
  },
  validationIconInvalid: {
    backgroundColor: '#FFE3E4',
  },
  validationIconText: {
    color: '#243047',
    fontSize: 14,
    fontWeight: '900',
  },
  validationText: {
    flex: 1,
  },
  validationTitle: {
    color: '#263248',
    fontSize: 14,
    fontWeight: '800',
  },
  validationDescription: {
    color: '#748093',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  divider: {
    backgroundColor: '#EEF1F5',
    height: 1,
    marginVertical: 15,
  },
  warningCard: {
    backgroundColor: '#FFF8E8',
    borderColor: '#F4DDA2',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  warningTitle: {
    color: '#8A5A00',
    fontSize: 15,
    fontWeight: '800',
  },
  warningText: {
    color: '#896D31',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  warningButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  warningButtonText: {
    color: '#8A5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  readyCard: {
    backgroundColor: '#EAF8F2',
    borderColor: '#C4E9D5',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  readyTitle: {
    color: '#176947',
    fontSize: 15,
    fontWeight: '800',
  },
  readyText: {
    color: '#4A7D68',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  submittedCard: {
    backgroundColor: '#EAF0FF',
    borderColor: '#CCDAFF',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  submittedTitle: {
    color: '#294B9D',
    fontSize: 15,
    fontWeight: '800',
  },
  submittedText: {
    color: '#5870A7',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2E5BFF',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 54,
  },
  primaryButtonDisabled: {
    backgroundColor: '#AAB7D7',
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