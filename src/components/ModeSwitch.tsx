
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { C } from '../theme';

type Props = {
  demo: boolean;
  onChange: (demo: boolean) => void;
};

export default function ModeSwitch({
  demo,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(false)}
        style={[
          styles.option,
          !demo && styles.active,
        ]}
      >
        <Text
          style={[
            styles.label,
            !demo && styles.activeText,
          ]}
        >
          Live API
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange(true)}
        style={[
          styles.option,
          demo && styles.active,
        ]}
      >
        <Text
          style={[
            styles.label,
            demo && styles.activeText,
          ]}
        >
          Demo Mode
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.greenPale,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },

  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center',
  },

  active: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.green,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
  },

  activeText: {
    color: C.greenDark,
  },
});
