import React from 'react';
import { ScrollView } from 'react-native';
import { Empty,ScreenTitle } from '../../components/ui';
import { C } from '../../theme';
export default function Page(){return <ScrollView style={{backgroundColor:C.background}} contentContainerStyle={{padding:22,paddingTop:55}}><ScreenTitle title="Analytics" subtitle="Ginjer device management"/><Empty icon="stats-chart-outline" title="Nothing to show yet" description="Analytics will use real readings once the required reporting API is provided."/></ScrollView>}
