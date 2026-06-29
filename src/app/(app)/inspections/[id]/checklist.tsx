import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/components/ui";
import { useInspectionStore } from "@/features/inspections/inspection-store";

import type {
  ChecklistAnswer,
  ChecklistItem,
  IssuePriority,
} from "@/features/inspections/types";

const answerOptions: Array<{
  value: ChecklistAnswer;
  label: string;
}> = [
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
  { value: "NOT_APPLICABLE", label: "N/A" },
];

const priorities: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ChecklistScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const inspection = useInspectionStore((state) =>
    state.inspections.find((item) => item.id === id),
  );

  const sections = useInspectionStore((state) => state.checklists[id] ?? []);

  const issues = useInspectionStore(
    (state) => state.issuesByInspection[id] ?? [],
  );

  const setChecklistAnswer = useInspectionStore(
    (state) => state.setChecklistAnswer,
  );

  const createIssue = useInspectionStore((state) => state.createIssue);

  const [activeSectionId, setActiveSectionId] = useState("");
  const [issueItem, setIssueItem] = useState<ChecklistItem | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePriority, setIssuePriority] = useState<IssuePriority>("MEDIUM");
  const [issueError, setIssueError] = useState("");

  useEffect(() => {
    if (!activeSectionId && sections[0]) {
      setActiveSectionId(sections[0].id);
      return;
    }

    const activeSectionExists = sections.some(
      (section) => section.id === activeSectionId,
    );

    if (!activeSectionExists && sections[0]) {
      setActiveSectionId(sections[0].id);
    }
  }, [activeSectionId, sections]);

  const activeSection = useMemo(
    () =>
      sections.find((section) => section.id === activeSectionId) ?? sections[0],
    [activeSectionId, sections],
  );

  if (!inspection || !activeSection) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.notFoundTitle}>Checklist not found</Text>

        <Pressable
          onPress={() => router.back()}
          style={styles.backToDetailsButton}
        >
          <Text style={styles.backToDetailsText}>Go back</Text>
        </Pressable>
      </Screen>
    );
  }

  const progressPercent = Math.round(
    (inspection.completedItemsCount / inspection.totalItemsCount) * 100,
  );

  function getAnswerButtonStyle(answer: ChecklistAnswer) {
    switch (answer) {
      case "PASS":
        return styles.answerPassActive;
      case "FAIL":
        return styles.answerFailActive;
      case "NOT_APPLICABLE":
        return styles.answerNaActive;
    }
  }

  function handleAnswer(item: ChecklistItem, answer: ChecklistAnswer) {
    if (!inspection) return;

    setChecklistAnswer(inspection.id, item.id, answer);

    if (answer !== "FAIL") {
      return;
    }

    const existingIssue = issues.find(
      (issue) => issue.checklistItemId === item.id,
    );

    setIssueItem(item);
    setIssueDescription(existingIssue?.description ?? item.comment ?? "");
    setIssuePriority(existingIssue?.priority ?? "MEDIUM");
    setIssueError("");
  }

  function closeIssueModal() {
    setIssueItem(null);
    setIssueDescription("");
    setIssuePriority("MEDIUM");
    setIssueError("");
  }

  function saveIssue() {
    if (!issueItem || !inspection) {
      return;
    }

    if (!issueDescription.trim()) {
      setIssueError(
        "Add a short description so the manager understands the issue.",
      );
      return;
    }

    createIssue({
      inspectionId: inspection.id,
      checklistItemId: issueItem.id,
      title: issueItem.title,
      description: issueDescription.trim(),
      priority: issuePriority,
    });

    closeIssueModal();
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>INSPECTION CHECKLIST</Text>
          <Text numberOfLines={1} style={styles.title}>
            {inspection.locationName}
          </Text>
        </View>

        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{progressPercent}%</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {inspection.completedItemsCount} of {inspection.totalItemsCount}{" "}
            items completed
          </Text>

          <Text style={styles.issueLabel}>
            {inspection.issuesCount} issue
            {inspection.issuesCount === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabs}
      >
        {sections.map((section, index) => {
          const isActive = section.id === activeSection.id;

          const completedCount = section.items.filter(
            (item) => item.answer !== null,
          ).length;

          return (
            <Pressable
              key={section.id}
              onPress={() => setActiveSectionId(section.id)}
              style={[styles.sectionTab, isActive && styles.sectionTabActive]}
            >
              <Text
                style={[
                  styles.sectionTabNumber,
                  isActive && styles.sectionTabNumberActive,
                ]}
              >
                {index + 1}
              </Text>

              <View style={styles.sectionTabContent}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.sectionTabTitle,
                    isActive && styles.sectionTabTitleActive,
                  ]}
                >
                  {section.title}
                </Text>

                <Text
                  style={[
                    styles.sectionTabMeta,
                    isActive && styles.sectionTabMetaActive,
                  ]}
                >
                  {completedCount}/{section.items.length}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionIntro}>
          <Text style={styles.sectionTitle}>{activeSection.title}</Text>
          <Text style={styles.sectionDescription}>
            Review every item and document anything that needs follow-up.
          </Text>
        </View>

        <View style={styles.itemsList}>
          {activeSection.items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemOrder}>
                  <Text style={styles.itemOrderText}>{index + 1}</Text>
                </View>

                {item.isRequired ? (
                  <Text style={styles.requiredText}>Required</Text>
                ) : (
                  <Text style={styles.optionalText}>Optional</Text>
                )}
              </View>

              <Text style={styles.itemTitle}>{item.title}</Text>

              {item.answer === "FAIL" && item.comment ? (
                <View style={styles.issuePreview}>
                  <Text style={styles.issuePreviewLabel}>Issue note</Text>
                  <Text style={styles.issuePreviewText}>{item.comment}</Text>
                </View>
              ) : null}

              <View style={styles.answerRow}>
                {answerOptions.map((option) => {
                  const isSelected = item.answer === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleAnswer(item, option.value)}
                      style={[
                        styles.answerButton,
                        isSelected && getAnswerButtonStyle(option.value),
                      ]}
                    >
                      <Text
                        style={[
                          styles.answerButtonText,
                          isSelected && styles.answerButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {item.answer === "FAIL" && !item.comment ? (
                <Text style={styles.missingIssueText}>
                  Add an issue description before submitting the report.
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push(`/inspections/${inspection.id}/report`)}
          style={styles.nextStepCard}
        >
          <Text style={styles.nextStepTitle}>Review report</Text>
          <Text style={styles.nextStepText}>
            Check validation results, review issues and submit the inspection
            report.
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={Boolean(issueItem)}
        onRequestClose={closeIssueModal}
      >
        <View style={styles.modalRoot}>
          <Pressable
            onPress={closeIssueModal}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalEyebrow}>CREATE ISSUE</Text>
            <Text style={styles.modalTitle}>{issueItem?.title}</Text>

            <Text style={styles.inputLabel}>Priority</Text>

            <View style={styles.priorityRow}>
              {priorities.map((priority) => {
                const isSelected = issuePriority === priority;

                return (
                  <Pressable
                    key={priority}
                    onPress={() => setIssuePriority(priority)}
                    style={[
                      styles.priorityButton,
                      isSelected && priority === "LOW" && styles.priorityLow,
                      isSelected &&
                        priority === "MEDIUM" &&
                        styles.priorityMedium,
                      isSelected && priority === "HIGH" && styles.priorityHigh,
                      isSelected &&
                        priority === "CRITICAL" &&
                        styles.priorityCritical,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        isSelected && styles.priorityButtonTextActive,
                      ]}
                    >
                      {priority}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Description</Text>

            <TextInput
              multiline
              value={issueDescription}
              onChangeText={(value) => {
                setIssueDescription(value);
                setIssueError("");
              }}
              placeholder="Explain what is wrong and what needs attention..."
              placeholderTextColor="#98A1B0"
              style={styles.textarea}
              textAlignVertical="top"
            />

            {issueError ? (
              <Text style={styles.issueError}>{issueError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable onPress={closeIssueModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={saveIssue} style={styles.saveIssueButton}>
                <Text style={styles.saveIssueButtonText}>Save issue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundTitle: {
    color: "#243047",
    fontSize: 20,
    fontWeight: "800",
  },
  backToDetailsButton: {
    backgroundColor: "#2E5BFF",
    borderRadius: 14,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backToDetailsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EAF2",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonText: {
    color: "#172033",
    fontSize: 30,
    lineHeight: 31,
    marginTop: -4,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: "#2E5BFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },
  progressBadge: {
    alignItems: "center",
    backgroundColor: "#172033",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 52,
  },
  progressBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  progressBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: "#536074",
    fontSize: 12,
    fontWeight: "700",
  },
  issueLabel: {
    color: "#DC3E42",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#E7EBF2",
    borderRadius: 999,
    height: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#2E5BFF",
    borderRadius: 999,
    height: "100%",
  },
  sectionTabs: {
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTab: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EAF2",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    maxWidth: 180,
    minWidth: 145,
    paddingHorizontal: 10,
  },
  sectionTabActive: {
    backgroundColor: "#172033",
    borderColor: "#172033",
  },
  sectionTabNumber: {
    alignItems: "center",
    backgroundColor: "#EEF3FF",
    borderRadius: 10,
    color: "#2E5BFF",
    fontSize: 12,
    fontWeight: "800",
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    width: 28,
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTabNumberActive: {
    backgroundColor: "#3D5179",
    color: "#FFFFFF",
  },
  sectionTabContent: { flex: 1 },
  sectionTabTitle: {
    color: "#2B364B",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionTabTitleActive: {
    color: "#FFFFFF",
  },
  sectionTabMeta: {
    color: "#8792A3",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  sectionTabMetaActive: {
    color: "#B9C5DC",
  },
  content: {
    padding: 20,
    paddingBottom: 38,
  },
  sectionIntro: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#172033",
    fontSize: 22,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#748093",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8ECF3",
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  itemHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemOrder: {
    alignItems: "center",
    backgroundColor: "#F0F3F8",
    borderRadius: 8,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  itemOrderText: {
    color: "#66748A",
    fontSize: 11,
    fontWeight: "800",
  },
  requiredText: {
    color: "#B26F00",
    fontSize: 10,
    fontWeight: "800",
  },
  optionalText: {
    color: "#8B95A5",
    fontSize: 10,
    fontWeight: "800",
  },
  itemTitle: {
    color: "#263248",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 11,
  },
  answerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  answerButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E7EF",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  answerButtonText: {
    color: "#68758A",
    fontSize: 12,
    fontWeight: "800",
  },
  answerButtonTextActive: {
    color: "#FFFFFF",
  },
  answerPassActive: {
    backgroundColor: "#24956B",
    borderColor: "#24956B",
  },
  answerFailActive: {
    backgroundColor: "#DC3E42",
    borderColor: "#DC3E42",
  },
  answerNaActive: {
    backgroundColor: "#6E7A8D",
    borderColor: "#6E7A8D",
  },
  issuePreview: {
    backgroundColor: "#FFF3F3",
    borderColor: "#FFD8D9",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    padding: 10,
  },
  issuePreviewLabel: {
    color: "#C3373B",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  issuePreviewText: {
    color: "#7D3A3D",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  missingIssueText: {
    color: "#C3373B",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 9,
  },
  nextStepCard: {
    backgroundColor: "#EAF0FF",
    borderRadius: 18,
    marginTop: 22,
    padding: 16,
  },
  nextStepTitle: {
    color: "#24418C",
    fontSize: 14,
    fontWeight: "800",
  },
  nextStepText: {
    color: "#50658E",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  modalRoot: {
    backgroundColor: "rgba(14, 24, 42, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 34,
  },
  modalHandle: {
    alignSelf: "center",
    backgroundColor: "#D9DFE8",
    borderRadius: 999,
    height: 5,
    marginBottom: 18,
    width: 42,
  },
  modalEyebrow: {
    color: "#DC3E42",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  modalTitle: {
    color: "#1E293D",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 5,
  },
  inputLabel: {
    color: "#4B586E",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 20,
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 9,
  },
  priorityButton: {
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 9,
    justifyContent: "center",
    minHeight: 35,
    paddingHorizontal: 12,
  },
  priorityButtonText: {
    color: "#69778D",
    fontSize: 11,
    fontWeight: "800",
  },
  priorityButtonTextActive: {
    color: "#FFFFFF",
  },
  priorityLow: {
    backgroundColor: "#607087",
  },
  priorityMedium: {
    backgroundColor: "#C58A00",
  },
  priorityHigh: {
    backgroundColor: "#E5812F",
  },
  priorityCritical: {
    backgroundColor: "#DC3E42",
  },
  textarea: {
    backgroundColor: "#F7F9FC",
    borderColor: "#E2E7EF",
    borderRadius: 14,
    borderWidth: 1,
    color: "#263248",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 9,
    minHeight: 112,
    padding: 13,
  },
  issueError: {
    color: "#C3373B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: "#F1F4F8",
    borderRadius: 14,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  cancelButtonText: {
    color: "#59667B",
    fontSize: 14,
    fontWeight: "800",
  },
  saveIssueButton: {
    alignItems: "center",
    backgroundColor: "#2E5BFF",
    borderRadius: 14,
    flex: 1.4,
    justifyContent: "center",
    minHeight: 52,
  },
  saveIssueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
