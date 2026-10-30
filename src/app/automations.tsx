
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

const GINJER_AUTOMATION_URL =
  'https://ginjer.io/projects/6ae46a59c48f954657c0bcc5/alerts?organisationId=6ae46a2dc48f95c51ac0bcc3';

type RunStatus = 'Running' | 'Succeeded' | 'Aborted';
type TriggerType = 'Manual' | 'Automatic';

type AutomationRun = {
  id: number;
  status: RunStatus;
  time: string;
  message: string;
};

type Automation = {
  id: string;
  name: string;
  solution: string;
  output: string;
  trigger: TriggerType;
  enabled: boolean;
  runs: AutomationRun[];
};

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: '1',
    name: 'Irrigation - Zone 1 (Automatic)',
    solution: 'Irrigation',
    output: 'Valve',
    trigger: 'Automatic',
    enabled: false,
    runs: [
      {
        id: 1,
        status: 'Succeeded',
        time: 'Demo history',
        message: 'Soil moisture condition was met.',
      },
    ],
  },
  {
    id: '2',
    name: 'Irrigation - Zone 1 (Manual)',
    solution: 'Irrigation',
    output: 'Valve',
    trigger: 'Manual',
    enabled: true,
    runs: [],
  },
  {
    id: '3',
    name: 'Irrigation - Zone 2 (Automatic)',
    solution: 'Irrigation',
    output: 'Valve',
    trigger: 'Automatic',
    enabled: false,
    runs: [],
  },
  {
    id: '4',
    name: 'Irrigation - Zone 2 (Manual)',
    solution: 'Irrigation',
    output: 'Valve',
    trigger: 'Manual',
    enabled: true,
    runs: [],
  },
  {
    id: '5',
    name: 'Pump Automation',
    solution: 'Water Management',
    output: 'Pump',
    trigger: 'Automatic',
    enabled: false,
    runs: [],
  },
  {
    id: '6',
    name: 'Pump Off',
    solution: 'Water Management',
    output: 'Pump',
    trigger: 'Manual',
    enabled: false,
    runs: [
      {
        id: 1,
        status: 'Aborted',
        time: 'Demo history',
        message: 'Simulated action failed after 3 attempts.',
      },
    ],
  },
  {
    id: '7',
    name: 'Pump On',
    solution: 'Water Management',
    output: 'Pump',
    trigger: 'Manual',
    enabled: true,
    runs: [],
  },
];

const GREEN = '#86B817';

export default function Automations() {
  const [automations, setAutomations] =
    useState<Automation[]>(INITIAL_AUTOMATIONS);

  const [solutionFilter, setSolutionFilter] =
    useState('All');

  const [outputFilter, setOutputFilter] =
    useState('All');

  const [openFilter, setOpenFilter] =
    useState<'solution' | 'output' | null>(null);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [runningId, setRunningId] =
    useState<string | null>(null);

  const total = automations.length;
  const active = automations.filter(a => a.enabled).length;
  const inactive = total - active;

  const filtered = automations.filter(a => {
    const solutionMatches =
      solutionFilter === 'All' ||
      a.solution === solutionFilter;

    const outputMatches =
      outputFilter === 'All' ||
      a.output === outputFilter;

    return solutionMatches && outputMatches;
  });

  const updateAutomation = (
    id: string,
    update: (item: Automation) => Automation
  ) => {
    setAutomations(current =>
      current.map(item =>
        item.id === id ? update(item) : item
      )
    );
  };

  const toggleAutomation = (id: string) => {
    updateAutomation(id, item => ({
      ...item,
      enabled: !item.enabled,
    }));
  };

  const runAutomation = (item: Automation) => {
    if (runningId) return;

    if (!item.enabled) {
      Alert.alert(
        'Automation Disabled',
        'Enable this automation before running it.'
      );
      return;
    }

    if (item.trigger !== 'Manual') {
      Alert.alert(
        'Automatic Trigger',
        'This automation is triggered by a condition, not manually.'
      );
      return;
    }

    setRunningId(item.id);

    const runId = Date.now();

    updateAutomation(item.id, current => ({
      ...current,
      runs: [
        {
          id: runId,
          status: 'Running',
          time: new Date().toLocaleString(),
          message: 'Simulated command is being processed.',
        },
        ...current.runs,
      ],
    }));

    setExpandedId(item.id);

    // Simulated completion. No backend or hardware request.
    // Using a microtask keeps the UI responsive on web/native.
    Promise.resolve().then(() => {
      updateAutomation(item.id, current => ({
        ...current,
        runs: current.runs.map(run =>
          run.id === runId
            ? {
                ...run,
                status: 'Succeeded',
                message:
                  'Demo automation completed successfully. No hardware command was sent.',
              }
            : run
        ),
      }));

      setRunningId(null);
    });
  };

  const openGinjer = async () => {
    try {
      await Linking.openURL(GINJER_AUTOMATION_URL);
    } catch {
      Alert.alert(
        'Unable to open Ginjer',
        'Please open the Ginjer web application in your browser.'
      );
    }
  };

  const renderFilter = (
    type: 'solution' | 'output',
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>{label}</Text>

      <Pressable
        style={styles.filterButton}
        onPress={() =>
          setOpenFilter(openFilter === type ? null : type)
        }
      >
        <Text style={styles.filterValue}>{value}</Text>
        <Ionicons
          name="chevron-down"
          size={17}
          color={C.muted}
        />
      </Pressable>

      {openFilter === type && (
        <View style={styles.filterOptions}>
          {options.map(option => (
            <Pressable
              key={option}
              style={styles.filterOption}
              onPress={() => {
                onSelect(option);
                setOpenFilter(null);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  value === option && {
                    color: C.greenDark,
                    fontWeight: '800',
                  },
                ]}
              >
                {option}
              </Text>

              {value === option && (
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={C.greenDark}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={C.ink}
          />
        </Pressable>

        <Text style={styles.heading}>Automations</Text>
      </View>

      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={C.greenDark}
        />
        <Text style={styles.noticeText}>
          Demo Mode — these automation examples are simulated.
          No real Ginjer rules or hardware are changed.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Automation Summary
      </Text>

      <View style={styles.summaryRow}>
        {[
          ['Automations', total],
          ['Active', active],
          ['Inactive', inactive],
        ].map(([label, value]) => (
          <View key={String(label)} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {value}
            </Text>
            <Text style={styles.summaryLabel}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.summaryNote}>
        Counts reflect only the sample automations shown below,
        not your live Ginjer project.
      </Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Automation Engine
        </Text>
        <Text style={styles.demoTag}>DEMO</Text>
      </View>

      <View style={styles.filtersRow}>
        {renderFilter(
          'solution',
          'Solution',
          solutionFilter,
          ['All', 'Irrigation', 'Water Management'],
          setSolutionFilter
        )}

        {renderFilter(
          'output',
          'Output',
          outputFilter,
          ['All', 'Valve', 'Pump'],
          setOutputFilter
        )}
      </View>

      <View style={styles.automationSection}>
        <Text style={styles.automationSectionTitle}>
          Automation
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="git-branch-outline"
              size={35}
              color={C.greenDark}
            />
            <Text style={styles.emptyText}>
              No matching automations
            </Text>
          </View>
        ) : (
          filtered.map(item => {
            const expanded = expandedId === item.id;
            const latestRun = item.runs[0];

            return (
              <View key={item.id} style={styles.automationCard}>
                <View style={styles.automationTop}>
                  <Text style={styles.automationName}>
                    {item.name}
                  </Text>

                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{
                      checked: item.enabled,
                    }}
                    onPress={() =>
                      toggleAutomation(item.id)
                    }
                    style={[
                      styles.switchTrack,
                      item.enabled && styles.switchOn,
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        item.enabled &&
                          styles.switchThumbOn,
                      ]}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setExpandedId(
                        expanded ? null : item.id
                      )
                    }
                    style={styles.moreButton}
                  >
                    <Ionicons
                      name={
                        expanded
                          ? 'chevron-up'
                          : 'ellipsis-vertical'
                      }
                      size={19}
                      color={C.muted}
                    />
                  </Pressable>
                </View>

                <View style={styles.automationMeta}>
                  <View style={styles.metaPill}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={C.muted}
                    />
                    <Text style={styles.metaText}>
                      {item.trigger === 'Manual' ? 'Manual' : 'Auto'}
                    </Text>
                  </View>

                  <View style={styles.metaPill}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={C.muted}
                    />
                    <Text style={styles.metaText}>
                      {item.runs.length} runs
                    </Text>
                  </View>

                  {latestRun && (
                    <Text
                      style={[
                        styles.runStatus,
                        latestRun.status === 'Succeeded' &&
                          styles.successStatus,
                        latestRun.status === 'Aborted' &&
                          styles.errorStatus,
                      ]}
                    >
                      {latestRun.status}
                    </Text>
                  )}
                </View>

                {item.trigger === 'Manual' && (
                  <Pressable
                    disabled={!item.enabled || runningId !== null}
                    style={[
                      styles.runButton,
                      (!item.enabled || runningId !== null) &&
                        styles.runButtonDisabled,
                    ]}
                    onPress={() => runAutomation(item)}
                  >
                    <Ionicons
                      name="play"
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.runButtonText}>
                      {runningId === item.id
                        ? 'Running...'
                        : 'Run Automation'}
                    </Text>
                  </Pressable>
                )}

                {expanded && (
                  <View style={styles.history}>
                    <Text style={styles.historyTitle}>
                      Automation Runs
                    </Text>

                    {item.runs.length === 0 ? (
                      <Text style={styles.historyEmpty}>
                        No demo runs yet.
                      </Text>
                    ) : (
                      item.runs.map(run => (
                        <View
                          key={run.id}
                          style={styles.historyItem}
                        >
                          <View style={styles.historyHeading}>
                            <Ionicons
                              name={
                                run.status === 'Succeeded'
                                  ? 'checkmark-circle'
                                  : run.status === 'Aborted'
                                    ? 'close-circle'
                                    : 'time'
                              }
                              size={17}
                              color={
                                run.status === 'Succeeded'
                                  ? GREEN
                                  : run.status === 'Aborted'
                                    ? '#EF4444'
                                    : '#F59E0B'
                              }
                            />
                            <Text style={styles.historyStatus}>
                              {run.status}
                            </Text>
                          </View>

                          <Text style={styles.historyTime}>
                            {run.time}
                          </Text>

                          <Text style={styles.historyMessage}>
                            {run.message}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelIcon}>
          <Ionicons
            name="git-branch-outline"
            size={30}
            color={C.greenDark}
          />
        </View>

        <Text style={styles.panelTitle}>
          Manage Real Automations
        </Text>

        <Text style={styles.panelDescription}>
          Open the Ginjer platform to configure real triggers,
          conditions, actions, and automation runs.
        </Text>

        <Pressable
          style={styles.openButton}
          onPress={openGinjer}
        >
          <Ionicons
            name="open-outline"
            size={19}
            color="#FFFFFF"
          />
          <Text style={styles.openButtonText}>
            Open Ginjer Automation
          </Text>
        </Pressable>
      </View>

      <View style={styles.workflow}>
        <Text style={styles.sectionTitle}>
          Automation Workflow
        </Text>

        {[
          ['FOR', 'Select Solution'],
          ['WHEN', 'Choose Trigger'],
          ['IF', 'Define Conditions'],
          ['THEN', 'Define Actions'],
        ].map(([step, description]) => (
          <View key={step} style={styles.workflowRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>{step}</Text>
            </View>

            <Text style={styles.workflowText}>
              {description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 45,
    paddingBottom: 55,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: C.ink,
  },
  notice: {
    backgroundColor: C.greenPale,
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  noticeText: {
    flex: 1,
    color: C.greenDark,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 9,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 27,
    fontWeight: '800',
    color: C.greenDark,
  },
  summaryLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
  },
  summaryNote: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoTag: {
    color: C.greenDark,
    backgroundColor: C.greenPale,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.greenDark,
    marginBottom: 6,
  },
  filterButton: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterValue: {
    fontSize: 13,
    color: C.ink,
    fontWeight: '600',
  },
  filterOptions: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    marginTop: 5,
    overflow: 'hidden',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 12,
    color: C.ink,
  },
  automationSection: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
    gap: 9,
  },
  automationSectionTitle: {
    backgroundColor: '#F2F3F5',
    padding: 12,
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
    marginBottom: 3,
  },
  automationCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 12,
    backgroundColor: C.white,
    gap: 10,
  },
  automationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  automationName: {
    flex: 1,
    color: C.greenDark,
    fontSize: 12,
    fontWeight: '800',
  },
  switchTrack: {
    width: 34,
    height: 19,
    borderRadius: 12,
    backgroundColor: '#A1A1AA',
    justifyContent: 'center',
    padding: 2,
  },
  switchOn: {
    backgroundColor: GREEN,
  },
  switchThumb: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  moreButton: {
    padding: 4,
  },
  automationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F5F5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
  },
  runStatus: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  successStatus: {
    color: C.greenDark,
  },
  errorStatus: {
    color: '#EF4444',
  },
  runButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  runButtonDisabled: {
    opacity: 0.4,
  },
  runButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  history: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 12,
    gap: 9,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.ink,
  },
  historyEmpty: {
    fontSize: 12,
    color: C.muted,
  },
  historyItem: {
    backgroundColor: '#F8FAF5',
    borderRadius: 10,
    padding: 11,
    gap: 5,
  },
  historyHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: C.ink,
  },
  historyTime: {
    fontSize: 10,
    color: C.muted,
  },
  historyMessage: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 17,
  },
  emptyState: {
    alignItems: 'center',
    padding: 28,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: C.muted,
  },
  panel: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 22,
    alignItems: 'center',
    gap: 14,
  },
  panelIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.ink,
  },
  panelDescription: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
  },
  openButton: {
    marginTop: 8,
    width: '100%',
    backgroundColor: C.green,
    borderRadius: 13,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  workflow: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  workflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  stepCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.greenDark,
  },
  workflowText: {
    flex: 1,
    color: C.ink,
    fontSize: 14,
    fontWeight: '700',
  },
});
