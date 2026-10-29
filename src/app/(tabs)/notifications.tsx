import React from 'react';
import { ScrollView } from 'react-native';
import { Empty,ScreenTitle } from '../../components/ui';
import { C } from '../../theme';
export default function Page(){return <ScrollView style={{backgroundColor:C.background}} contentContainerStyle={{padding:22,paddingTop:55}}><ScreenTitle title="Notifications" subtitle="Ginjer device management"/><Empty icon="notifications-outline" title="Nothing to show yet" description="No notification endpoint was included in the supplied API collection."/></ScrollView>}
