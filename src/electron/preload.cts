import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getComPorts: async (): Promise<any> => {
    const ports = await ipcRenderer.invoke("get-com-ports");
    return ports;
  },
  startSerialConnection: async (
    portPath: string,
    baudRate: number
  ): Promise<boolean> => {
    try {
      const success = await ipcRenderer.invoke(
        "start-serial-connection",
        portPath,
        baudRate
      );
      return success;
    } catch (error) {
      console.error("Error starting serial connection:", error);
      return false;
    }
  },
  closeSerialConnection: async (): Promise<any> => {
    return await ipcRenderer.invoke("close-serial-connection");
  },
  on: (eventName: string, callback: (payload: any) => void): void => {
    ipcRenderer.on(eventName, (_, payload) => callback(payload));
  },
  off: (eventName: string, callback: (...args: any[]) => void): void => {
    ipcRenderer.removeListener(eventName, callback);
  },
  getLogs: async (): Promise<any> => {
    return await ipcRenderer.invoke("get-logs");
  },
  getDebugMessages: async (): Promise<any> => {
    return await ipcRenderer.invoke("get-debug-messages");
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  },
});
