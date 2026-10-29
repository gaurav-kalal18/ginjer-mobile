
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LightColor = 'Red' | 'Blue' | 'Green' | 'Off';

type Props = {
  mode?: 'demo' | 'live';
  deviceId?: string;
  organisationId?: string;
  token?: string;
};

const COLORS: { name: LightColor; hex: string }[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#86B817' },
  { name: 'Off', hex: '#9CA3AF' },
];

const API_URL =
  process.env.EXPO_PUBLIC_GINJER_API_URL ||
  'https://devapi.ginjer.io/graphql';

// Identified from the Ginjer Module List.
const COLOR_INTERFACE_ID = '62853f132491a543a7f99384';

// Enable only after the colour command JSON has been verified.
const LIVE_COMMANDS_ENABLED = false;

// Placeholder for the verified hardware-specific payload.
// Do not guess the JSON structure.
function buildColorPayload(
  color: LightColor
): Record<string, unknown> {
  throw new Error(
    `Colour payload for ${color} has not been verified.`
  );
}

const DOWNLINK_QUERY = `
  query SendDownlink($action: SendDownlinkInput!) {
    sendDownlink(action: $action) {
      timestamp
      type
      message
    }
  }
`;

export default function BusylightControl({
  mode = 'demo',
  deviceId,
  organisationId,
  token,
}: Props) {
  const [selected, setSelected] = useState<LightColor>('Off');
  const [applied, setApplied] = useState<LightColor>('Off');
  const [sending, setSending] = useState(false);

  const isDemo = mode === 'demo';

  const applyColor = async () => {
    if (sending) return;

    if (isDemo) {
      setApplied(selected);
      Alert.alert(
        'Demo Mode',
        `Busylight colour changed to ${selected} in simulation only. No hardware command was sent.`
      );
      return;
    }

    if (!LIVE_COMMANDS_ENABLED) {
      Alert.alert(
        'Live Control Not Enabled',
        'The colour command payload must be verified with the hackathon organizers before real hardware commands can be sent.'
      );
      return;
    }

    if (!deviceId || !organisationId || !token) {
      Alert.alert(
        'Missing Device Information',
        'Device ID, organization ID, or authentication is missing.'
      );
      return;
    }

    setSending(true);

    try {
      const value = buildColorPayload(selected);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
        body: JSON.stringify({
          query: DOWNLINK_QUERY,
          variables: {
            action: {
              deviceId,
              organisationId,
              downlinkInterfaceId: COLOR_INTERFACE_ID,
              value,
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.errors?.length) {
        throw new Error(
          result.errors?.[0]?.message ||
          `Server error: ${response.status}`
        );
      }

      if (!result.data?.sendDownlink) {
        throw new Error('No downlink confirmation returned.');
      }

      Alert.alert(
        'Command Submitted',
        `Ginjer accepted the ${selected} command. Verify the physical Busylight to confirm the colour changed.`
      );

      // Do not update applied here: API acceptance does not
      // confirm that the physical light changed colour.
    } catch (error: any) {
      Alert.alert(
        'Command Failed',
        error?.message || 'Unable to send command.'
      );
    } finally {
      setSending(false);
    }
  };

  const activeColor =
    COLORS.find(c => c.name === applied)?.hex || '#9CA3AF';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Busylight Control</Text>

      <Text style={styles.subtitle}>
        Select a colour for your Busylight
      </Text>

      <View style={styles.preview}>
        <Ionicons
          name="bulb"
          size={65}
          color={isDemo ? activeColor : '#9CA3AF'}
        />

        <Text style={styles.previewText}>
          {isDemo
            ? `Current simulated colour: ${applied}`
            : 'Physical colour not verified'}
        </Text>
      </View>

      <View style={styles.colors}>
        {COLORS.map(color => (
          <Pressable
            key={color.name}
            disabled={sending}
            onPress={() => setSelected(color.name)}
            style={[
              styles.colorButton,
              selected === color.name && styles.selected,
            ]}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: color.hex },
              ]}
            />
            <Text style={styles.colorLabel}>
              {color.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[
          styles.applyButton,
          sending && { opacity: 0.6 },
        ]}
        disabled={sending}
        onPress={applyColor}
      >
        {sending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.applyText}>
            Apply {selected}
          </Text>
        )}
      </Pressable>

      <Text style={styles.demoNote}>
        {isDemo
          ? 'Demo only — no commands are sent to physical hardware.'
          : LIVE_COMMANDS_ENABLED
            ? 'Live API — commands will be sent to the selected device.'
            : 'Live API — hardware commands disabled until payload verification.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7E3',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2D28',
  },
  subtitle: {
    fontSize: 14,
    color: '#808783',
    marginTop: 6,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 20,
    backgroundColor: '#F5F9ED',
    borderRadius: 16,
  },
  previewText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1F2D28',
    fontWeight: '600',
  },
  colors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  colorButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7E3',
  },
  selected: {
    borderColor: '#86B817',
    borderWidth: 2,
    backgroundColor: '#F5F9ED',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2D28',
  },
  applyButton: {
    marginTop: 24,
    backgroundColor: '#86B817',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  demoNote: {
    textAlign: 'center',
    color: '#808783',
    fontSize: 12,
    marginTop: 14,
  },
});
