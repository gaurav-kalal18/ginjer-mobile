
import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../lib/session';
import { C } from '../theme';

export default function Index() {
  const { user, ready } = useSession();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: C.background,
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/projects" />;
}
