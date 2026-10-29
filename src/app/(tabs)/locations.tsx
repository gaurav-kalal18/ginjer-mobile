import React from 'react';
import { ScrollView } from 'react-native';
import { Empty,ScreenTitle } from '../../components/ui';
import { C } from '../../theme';
export default function Page(){return <ScrollView style={{backgroundColor:C.background}} contentContainerStyle={{padding:22,paddingTop:55}}><ScreenTitle title="Locations" subtitle="Ginjer device management"/><Empty icon="map-outline" title="Nothing to show yet" description="Registered device locations will appear here once location data is available."/></ScrollView>}
