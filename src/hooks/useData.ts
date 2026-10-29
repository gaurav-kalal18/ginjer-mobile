import { useCallback,useEffect,useState } from 'react';
import { gql } from '../lib/api';
import { useSession } from '../lib/session';
export function useData<T>(query:string,variables:Record<string,unknown>,enabled=true){const {user}=useSession();const [data,setData]=useState<T|null>(null),[loading,setLoading]=useState(enabled),[error,setError]=useState('');const vars=JSON.stringify(variables);
const refresh=useCallback(async()=>{if(!user||!enabled)return;setLoading(true);setError('');try{setData(await gql<T>(query,JSON.parse(vars),user.token))}catch(e:any){setError(e.message||'Request failed')}finally{setLoading(false)}},[query,vars,user?.token,enabled]);
useEffect(()=>{refresh()},[refresh]);return {data,loading,error,refresh};}
