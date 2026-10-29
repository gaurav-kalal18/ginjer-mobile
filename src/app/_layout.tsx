import React from 'react';
import { Stack } from 'expo-router';
import { SessionProvider } from '../lib/session';
import { C } from '../theme';
export default function RootLayout(){return <SessionProvider><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:C.background}}}/></SessionProvider>}
