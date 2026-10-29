const ENDPOINT = process.env.EXPO_PUBLIC_GINJER_API_URL || 'https://devapi.ginjer.io/graphql';
export type Org = { organisationId: string; name: string; isActive: boolean; isAccepted: boolean; isAdmin: boolean };
export type Project = { _id: string; name: string; description?: string | null; active: boolean; organisationId: string; location?: { placeName?: string; lat?: number; lng?: number } | null; deviceCount?: { deviceCount: number }[] };
export type Device = { _id: string; name: string; devEui?: string; hardwareId?: string; timestamp?: string; description?: string; hardwareType?: string; position?: {placeName?:string; lat?:number; lng?:number}; outputs?: {outputId:string; outputName:string; value:unknown; label?:string; color?:string}[]; attributes?: {attributeId:string;attributeName:string;value:unknown}[] };
export type ProjectDevices = { _id: string; name: string; clusters: { _id: string; name: string; devices: Device[] }[] };
export async function gql<T>(query: string, variables: Record<string,unknown> = {}, token?: string): Promise<T> {
  const res = await fetch(ENDPOINT, { method: 'POST', headers: {
    'Content-Type': 'application/json', ...(token ? { authorization: token } : {}),
  }, body: JSON.stringify({query,variables}) });
  let body: any;
  try { body = await res.json(); } catch { throw new Error('Ginjer returned an unreadable response'); }
  if (!res.ok) throw new Error(body?.errors?.[0]?.message || `Server error (${res.status})`);
  if (body?.errors?.length) throw new Error(body.errors.map((e:any)=>e.message).join('; '));
  if (!body?.data) throw new Error('No data returned by Ginjer');
  return body.data as T;
}
export const Q = {
  signIn: `query SignIn($auth: SignInInput!) { signIn(auth: $auth) { _id firstName lastName emailId token defaultAccount organisationId } }`,
  orgs: `query OrgList { accounts { organisationId name isActive isAccepted isAdmin } }`,
  projects: `query ProjectList($params: ParamInput!) { projectOverview(params: $params) { _id name description active organisationId location { placeName lat lng } deviceCount { _id deviceCount } } }`,
  devices: `query DeviceList($params: ParamInput!) { projects(params: $params) { _id name clusters { _id name devices { _id name devEui hardwareId timestamp } } } }`,
  details: `query DeviceDetails($params: ParamInput!) { projects(params: $params) { _id name clusters { _id name devices { _id name description devEui organisationId projectId clusterId hardwareId networkId hardwareType timestamp deleted position { placeName lat lng } outputs { outputId outputName value label color } attributes { attributeId attributeName value } } } } } }`,
  modules: `query ModuleList($params: ParamInput!) { modules(params: $params) { _id label moduleType organisationId } }`,
  downlink: `query SendDownlink($action: SendDownlinkInput!) { sendDownlink(action: $action) { timestamp type message } }`,
};
