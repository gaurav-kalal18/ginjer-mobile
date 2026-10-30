
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type LightColor = 'Red' | 'Blue' | 'Green' | 'Off';

type Props = {
  mode?: 'demo' | 'live';
  deviceId?: string;
  organisationId?: string;
  token?: string;
  appliedColor?: LightColor;
  onDemoColorChange?: (color: LightColor) => void;
};

const COLORS: { name: LightColor; hex: string }[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#86B817' },
  { name: 'Off', hex: '#9CA3AF' },
];

export default function BusylightControl({
  mode = 'demo',
  appliedColor,
  onDemoColorChange,
}: Props) {
  const [selected, setSelected] = useState<LightColor>('Off');
  const [localApplied, setLocalApplied] =
    useState<LightColor>('Off');

  const isDemo = mode === 'demo';
  const applied = appliedColor ?? localApplied;

  const applyColor = () => {
    if (!isDemo) {
      Alert.alert(
        'Live Control Not Enabled',
        'The hardware command payload must be verified with the organisers before real commands can be sent.'
      );
      return;
    }

    setLocalApplied(selected);
    onDemoColorChange?.(selected);

    Alert.alert(
      'Demo Mode',
      `Busylight changed to ${selected} in simulation only. No hardware command was sent.`
    );
  };

  const activeColor =
    COLORS.find(c => c.name === applied)?.hex ?? '#9CA3AF';

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
        style={styles.applyButton}
        onPress={applyColor}
      >
        <Text style={styles.applyText}>
          Apply {selected}
        </Text>
      </Pressable>

      <Text style={styles.demoNote}>
        {isDemo
          ? 'Demo only — no commands are sent to physical hardware.'
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
