
import React from 'react';
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

export default function Automations() {
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
          Automation management is available through the
          original Ginjer web platform.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Automation Summary
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Automations</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>0</Text>
          <Text style={styles.summaryLabel}>Inactive</Text>
        </View>
      </View>

      <Text style={styles.summaryNote}>
        Your Ginjer project currently shows no automations.
        These values are illustrative and are not connected
        to a live automation API.
      </Text>

      <View style={styles.panel}>
        <View style={styles.panelIcon}>
          <Ionicons
            name="git-branch-outline"
            size={32}
            color={C.greenDark}
          />
        </View>

        <Text style={styles.panelTitle}>
          Manage Automations
        </Text>

        <Text style={styles.panelDescription}>
          Open the existing Ginjer mobile web interface
          to view automations, configure triggers,
          define conditions, and manage actions.
        </Text>

        <Pressable
          style={styles.openButton}
          onPress={openGinjer}
        >
          <Ionicons
            name="open-outline"
            size={20}
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
