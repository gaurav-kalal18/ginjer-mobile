
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../theme';

type DeviceCardProps = {
  name: string;
  identifier?: string;
  cluster?: string;
  onPress: () => void;
};

export default function DeviceCard({
  name,
  identifier,
  cluster,
  onPress,
}: DeviceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons
          name="hardware-chip-outline"
          size={25}
          color={C.greenDark}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name || 'Unnamed device'}
        </Text>

        <Text style={styles.identifier} numberOfLines={1}>
          {identifier || 'No device identifier'}
        </Text>

        {cluster ? (
          <Text style={styles.cluster} numberOfLines={1}>
            {cluster}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={C.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: C.line,
    gap: 13,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBox: {
    width: 49,
    height: 49,
    borderRadius: 12,
    backgroundColor: C.greenPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  identifier: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },
  cluster: {
    fontSize: 11,
    color: C.greenDark,
    marginTop: 5,
  },
});
