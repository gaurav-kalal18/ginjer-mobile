import React from 'react';
import { ScrollView,StyleSheet,Text,View } from 'react-native';
import { router } from 'expo-router';
import { Panel,PrimaryButton,ScreenTitle } from '../../components/ui';
import { useSession } from '../../lib/session';
import { C } from '../../theme';
export default function Profile(){const {user,org,signOut}=useSession();return <ScrollView style={{flex:1,backgroundColor:C.background}} contentContainerStyle={{padding:22,paddingTop:55}}><ScreenTitle title="Profile" subtitle="Your Ginjer account"/><View style={s.avatar}><Text style={s.initial}>{user?.firstName?.[0]||'G'}</Text></View><Text style={s.name}>{user?.firstName} {user?.lastName}</Text><Text style={s.email}>{user?.emailId}</Text><Panel><Text style={s.label}>Organization</Text><Text style={s.value}>{org?.name||'Select an organization in Devices'}</Text></Panel><Panel><Text style={s.label}>Account</Text><Text style={s.value}>Authenticated with Ginjer</Text></Panel><PrimaryButton label="Sign out" outline onPress={async()=>{await signOut();router.replace('/sign-in')}}/></ScrollView>}
const s=StyleSheet.create({avatar:{width:76,height:76,borderRadius:25,backgroundColor:C.green,justifyContent:'center',alignItems:'center',alignSelf:'center',marginTop:15},initial:{color:C.white,fontSize:35,fontWeight:'800'},name:{fontSize:22,color:C.ink,fontWeight:'800',textAlign:'center',marginTop:15},email:{fontSize:14,color:C.muted,textAlign:'center',marginTop:5,marginBottom:32},label:{fontSize:12,color:C.muted,marginBottom:7},value:{fontSize:15,fontWeight:'700',color:C.ink}});
