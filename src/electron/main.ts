import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import {
  listPorts,
  startSerialConnection,
  closeSerialConnection,
  setMainWindow,
  writeSerialMessage,
} from "./serialManager.js";
import { logManager } from "./logManager.js";

let mainWindow: BrowserWindow | null = null;
let currentPort: string | null = null;
let autoConnected = false;

const updateMenu = async () => {
  const ports = await listPorts();

  if (ports.length === 1 && !currentPort && !autoConnected) {
    console.log(`🔌 Automatisch mit ${ports[0].path} verbinden...`);
    await connectToPort(ports[0].path);
    autoConnected = true;
  }

  const portItems: MenuItemConstructorOptions[] = ports.map((port) => ({
    label: port.path,
    type: "checkbox",
    checked: port.path === currentPort,
    enabled: port.path !== currentPort,
    click: async () => {
      if (port.path !== currentPort) {
        await connectToPort(port.path);
      }
    },
  }));

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "Verbindung",
      submenu: [
        { label: "Ports aktualisieren", click: async () => await updateMenu() },
        ...portItems,
        { type: "separator" },
        {
          label: "Trennen",
          enabled: currentPort !== null,
          click: async () => {
            await disconnectPort();
          },
        },
      ],
    },
  ];

  if (isDev()) {
    menuTemplate.push({
      label: "Debug",
      submenu: [
        {
          label: "Öffne DevTools",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.openDevTools();
            }
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

const connectToPort = async (portName: string) => {
  try {
    await startSerialConnection(portName, 9600);
    currentPort = portName;
    console.log(`Verbunden mit ${portName}`);

    if (mainWindow) {
      mainWindow.webContents.send("serial-status", `Verbunden mit ${portName}`);
    }

    await updateMenu();
  } catch (error) {
    console.error(`Fehler beim Verbinden mit ${portName}:`, error);
  }
};

const disconnectPort = async () => {
  await closeSerialConnection();
  console.log("🔌 Verbindung getrennt");

  currentPort = null;
  if (mainWindow) {
    mainWindow.webContents.send("serial-status", "Getrennt");
  }

  await updateMenu();
};

// Hauptprozess starten
app.on("ready", async () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    width: 1240,
    height: 960,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
  }

  setMainWindow(mainWindow);
  await updateMenu();

  // Automatische Verbindung nur beim ersten Start, nicht nach Trennung
  const ports = await listPorts();
  if (ports.length === 1 && !autoConnected) {
    console.log(`🔌 Automatische Verbindung mit ${ports[0].path}`);
    await connectToPort(ports[0].path);
    autoConnected = true;
  }

  ipcMain.handle("get-com-ports", async () => await listPorts());
  ipcMain.handle(
    "start-serial-connection",
    async (_event, portPath, _baudRate) => {
      return await connectToPort(portPath);
    }
  );
  ipcMain.handle("close-serial-connection", async () => await disconnectPort());
  ipcMain.handle("get-logs", () => logManager.getLogs());
  ipcMain.handle("get-debug-messages", () => logManager.getDebugMessages());

  ipcMain.on("button-click", (_event, hexValue: string) => {
    writeSerialMessage(`d02${hexValue}\n`);
  });

  ipcMain.on("update-switch-status", (_event, hexCode: string) => {
    writeSerialMessage(`d01${hexCode}\n`);
  });

  ipcMain.on("update-scale", (_event, channelHexCode: string) => {
    writeSerialMessage(`d0${channelHexCode}\n`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    disconnectPort();
  });
});
