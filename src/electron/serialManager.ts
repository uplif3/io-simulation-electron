import { BrowserWindow } from "electron";
import { SerialPort } from "serialport";

let port: SerialPort | null = null;
let mainWindow: BrowserWindow | null = null;
let vppVersion: string = "dV03";

/**
 * Set the main window for sending events.
 */
export function setMainWindow(window: BrowserWindow) {
  mainWindow = window;
}

/**
 * List available serial ports.
 */
export async function listPorts() {
  try {
    const ports = await SerialPort.list();
    console.log("Available ports:", ports);
    return ports;
  } catch (error) {
    console.error("Failed to list ports:", error);
    throw error;
  }
}

export function getSerialPort(): SerialPort | null {
  return port;
}

/**
 * Start a serial connection and handle incoming packets.
 */
export function startSerialConnection(
  portPath: string,
  baudRate: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    port = new SerialPort({
      path: portPath,
      baudRate: baudRate,
    });

    let buffer = "";

    port.on("open", () => {
      console.log("Port opened!");
      resolve(true);
    });

    port.on("data", (data) => {
      buffer += data.toString();
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
        const packet = buffer.slice(0, newlineIndex + 1);
        buffer = buffer.slice(newlineIndex + 1);
        handleSerialPacket(packet.trim());
      }
    });

    port.on("error", (err) => {
      console.error("Error:", err.message);
      reject(false);
    });
  });
}

/**
 * Handle incoming packets and dispatch them based on their prefix.
 */
function handleSerialPacket(packet: string) {
  console.log("Received packet:", packet);

  if (!mainWindow) {
    console.warn("No main window set, cannot dispatch events.");
    return;
  }

  if (packet.startsWith("dD")) {
    const payload = packet.slice(2).trim();
    mainWindow.webContents.send("debug-event", payload);
  } else if (packet.startsWith("dL")) {
    const payload = packet.slice(2).trim();
    mainWindow.webContents.send("log-event", payload);
  } else if (packet.startsWith("dS")) {
    const payload = packet.slice(2).trim();
    mainWindow.webContents.send("view-event", payload);
  } else if (packet.startsWith("d0")) {
    const payload = packet.slice(2).trim();
    mainWindow.webContents.send("led-event", payload);
  } else if (packet.startsWith("d1")) {
    const alarmHex = packet.slice(2).trim();
    mainWindow.webContents.send("alarm-clock-event", alarmHex);
  } else if (packet.startsWith("d2")) {
    const dataHex = packet.slice(2).trim();
    function parseSignedHex(hexStr: string): number {
      let num = parseInt(hexStr, 16);
      if (num & 0x8000) {
        num = num - 0x10000;
      }
      return num;
    }

    const reference = parseSignedHex(dataHex.substr(0, 4)) / 50000.0;
    const ball = parseSignedHex(dataHex.substr(4, 4)) / 50000.0;
    const angle = parseSignedHex(dataHex.substr(8, 4)) / 2000.0;
    const boing = dataHex[12] === "t";
    const seesawData = { reference, ball, angle, boing };
    mainWindow.webContents.send("seesaw-event", seesawData);
  } else if (packet.startsWith("?T")) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");
    const nowString = `${year}${month}${day}${hour}${minute}${second}`;
    const answer = `dT${nowString}\n`;
    writeSerialMessage(answer);
  } else if (packet.startsWith("dV")) {
    writeSerialMessage(vppVersion);
  } else {
    console.warn("Unknown packet received:", packet);
    mainWindow.webContents.send("unknown-packet", packet);
  }
}

/**
 * Write a message to the serial port.
 * Returns a Promise that resolves with true on success, or rejects with an Error.
 */
export function writeSerialMessage(message: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (port && port.isOpen) {
      port.write(message, (err: Error | null | undefined) => {
        if (err) {
          // console.error("Error writing to serial port:", err);
          reject(err);
        } else {
          // console.log("Serial message sent:", message);
          resolve(true);
        }
      });
    } else {
      const errorMsg = "No open serial port available";
      console.error(errorMsg);
      reject(new Error(errorMsg));
    }
  });
}

/**
 * Close the serial connection.
 */
export function closeSerialConnection(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (port && port.isOpen) {
      port.close((err) => {
        if (err) {
          console.error("Failed to close port:", err.message);
          reject(false);
        } else {
          console.log("Port closed successfully.");
          port = null;
          resolve(true);
        }
      });
    } else {
      console.warn("No open port to close.");
      resolve(false);
    }
  });
}
