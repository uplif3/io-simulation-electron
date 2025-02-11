export interface IElectron {
  getComPorts: () => Promise<any>;
  startSerialConnection: (
    portPath: string,
    baudRate: number
  ) => Promise<boolean>;
  closeSerialConnection: () => Promise<any>;
  on: (eventName: string, callback: (payload: any) => void) => void;
  off: (eventName: string, callback: (...args: any[]) => void) => void;
  getLogs: () => Promise<any>;
  getDebugMessages: () => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
}

declare global {
  interface Window {
    electron: IElectron;
  }
}
