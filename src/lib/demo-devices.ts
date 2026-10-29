
export type DemoDevice = {
  _id: string;
  name: string;
  devEui: string;
  hardwareType: string;
  lastHeard: string;
  status: string;
  battery: string;
  secondaryStatus: string;
  color: string;
};

export const demoDevices: DemoDevice[] = [
  {
    _id: 'demo-cold-chain',
    name: 'Cold Chain',
    devEui: 'ECFAF446947298',
    hardwareType: 'sensor',
    lastHeard: '50 mins ago',
    status: 'Moderate',
    battery: '3.70 V',
    secondaryStatus: 'Humid',
    color: '#F5B942',
  },
  {
    _id: 'demo-level-sensor',
    name: 'Level Sensor',
    devEui: 'ECFAF4469472DD',
    hardwareType: 'sensor',
    lastHeard: '50 mins ago',
    status: 'Empty',
    battery: '3.70 V',
    secondaryStatus: 'Full',
    color: '#F87171',
  },
  {
    _id: 'demo-io-controller',
    name: 'IO Controller',
    devEui: 'ECFAF44694729A',
    hardwareType: 'controller',
    lastHeard: '02 Feb 2024',
    status: 'ON',
    battery: '3.70 V',
    secondaryStatus: 'Full',
    color: '#86B817',
  },
  {
    _id: 'demo-panic-button',
    name: 'Panic Button',
    devEui: 'ECFAF44694729B',
    hardwareType: 'button',
    lastHeard: '02 Feb 2024',
    status: 'SOS',
    battery: '3.70 V',
    secondaryStatus: 'Low',
    color: '#F87171',
  },
  {
    _id: 'demo-air-quality',
    name: 'Air Quality Sensor',
    devEui: 'ECFAF4469472CC',
    hardwareType: 'sensor',
    lastHeard: '02 Feb 2024',
    status: 'Poor',
    battery: '3.70 V',
    secondaryStatus: 'Full',
    color: '#F87171',
  },
  {
    _id: 'demo-busylight',
    name: 'Busylight',
    devEui: '23456789021234',
    hardwareType: 'light',
    lastHeard: 'Demo device',
    status: 'Ready',
    battery: '3.70 V',
    secondaryStatus: 'Colour',
    color: '#86B817',
  },
];
