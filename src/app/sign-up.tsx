
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';

import { router } from 'expo-router';
import { Field, PrimaryButton, ErrorNote } from '../components/ui';
import { C } from '../theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [error, setError] = useState('');

  function submit() {
    setError('');

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !organisation.trim()
    ) {
      setError('Please fill in all the fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    Alert.alert(
      'Demo Mode',
      'Your details passed validation. Account creation and organisation requests are not connected to the backend yet.'
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={st.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={st.mark}>
          <Text style={st.markText}>G</Text>
        </View>

        <Text style={st.logo}>Ginjer</Text>
        <Text style={st.tag}>Smart IoT Device Management</Text>

        <View style={st.card}>
          <Text style={st.heading}>Create your account</Text>

          <Text style={st.desc}>
            Join Ginjer and manage your connected devices.
          </Text>

          <Field
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 characters"
            secureTextEntry
          />

          <Field
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
          />

          <Field
            label="Organisation name / ID"
            value={organisation}
            onChangeText={setOrganisation}
            placeholder="Enter organisation name or ID"
          />

          {error ? <ErrorNote message={error} /> : null}

          <PrimaryButton
            label="Request to Join"
            onPress={submit}
          />

          <Text style={st.note}>
            Your organisation request will require approval
            once backend integration is available.
          </Text>
        </View>

        <View style={st.loginRow}>
          <Text style={st.loginText}>
            Already have an account?{' '}
          </Text>

          <Pressable onPress={() => router.replace('/sign-in')}>
            <Text style={st.loginLink}>Sign In</Text>
          </Pressable>
        </View>

        <Text style={st.footer}>Powered by Ginjer</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    maxWidth: 510,
    width: '100%',
    alignSelf: 'center',
  },
  mark: {
    width: 65,
    height: 65,
    backgroundColor: C.green,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: C.white,
    fontSize: 40,
    fontWeight: '800',
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: C.ink,
    marginTop: 12,
  },
  tag: {
    color: C.muted,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 25,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    borderColor: C.line,
    borderWidth: 1,
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
    color: C.ink,
  },
  desc: {
    fontSize: 14,
    color: C.muted,
    marginTop: 6,
    marginBottom: 25,
    lineHeight: 21,
  },
  note: {
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  loginText: {
    color: C.muted,
    fontSize: 14,
  },
  loginLink: {
    color: C.greenDark,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: C.muted,
    marginTop: 25,
    fontSize: 12,
  },
});
