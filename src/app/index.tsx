import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../lib/session';
import { C } from '../theme';
export default function Index(){const {user,ready}=useSession();if(!ready)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator color={C.green}/></View>;return <Redirect href={user?'/(tabs)/devices':'/sign-in'}/>}
