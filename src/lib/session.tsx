import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { gql, Q, Org } from './api';
const KEY = 'ginjer-session-v1';
type User = { _id:string; firstName:string; lastName:string; emailId:string; token:string; organisationId?:string };
type Session = { user:User|null; org:Org|null; ready:boolean; signIn:(email:string,password:string)=>Promise<void>; signOut:()=>Promise<void>; selectOrg:(org:Org)=>void };
const Ctx = createContext<Session|null>(null);
async function save(user:User|null) { if(Platform.OS !== 'web') { if(user) await SecureStore.setItemAsync(KEY,JSON.stringify(user)); else await SecureStore.deleteItemAsync(KEY); } }
export function SessionProvider({children}:{children:React.ReactNode}) {
 const [user,setUser] = useState<User|null>(null); const [org,setOrg] = useState<Org|null>(null); const [ready,setReady] = useState(false);
 useEffect(()=>{(async()=>{try { if(Platform.OS !== 'web'){const s=await SecureStore.getItemAsync(KEY); if(s) setUser(JSON.parse(s));}}catch{}finally{setReady(true)}})()},[]);
 const value=useMemo<Session>(()=>({user,org,ready,async signIn(email,password){
   const d=await gql<{signIn:User}>(Q.signIn,{auth:{emailId:email.trim(),password,application:'Ginjer',forever:true}});
   if(!d.signIn?.token) throw new Error('Sign in did not return a token');
   await save(d.signIn); setUser(d.signIn);setOrg(null);
 },async signOut(){setUser(null);setOrg(null);await save(null)},selectOrg:setOrg}),[user,org,ready]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useSession(){const s=useContext(Ctx);if(!s)throw new Error('Missing SessionProvider');return s}
