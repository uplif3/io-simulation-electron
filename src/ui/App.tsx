import React, { useState, useEffect } from "react";
import LogWindow from "./components/LogWindow";
import DebugWindow from "./components/DebugWindow";
import DynamicView from "./components/DynamicView";
import DefaultView from "./components/DefaultView";
import "./App.css";

const App: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"viewA" | "viewB" | "none">("none");

  useEffect(() => {
    const handleLogEvent = (data: string) => {
      setLogs((prevLogs) => {
        if (prevLogs[prevLogs.length - 1] === data) {
          return prevLogs;
        }
        return [...prevLogs, data];
      });
    };

    const handleDebugEvent = (data: string) => {
      setDebugMessages((prevLogs) => {
        if (prevLogs[prevLogs.length - 1] === data) {
          return prevLogs;
        }
        return [...prevLogs, data];
      });
    };

    const handleViewEvent = (newView: string) => {
      if (newView === "1") {
        setCurrentView("viewA");
      } else if (newView === "2") {
        setCurrentView("viewB");
      } else if (newView === "0") {
        setCurrentView("none");
      }
    };

    window.electron.on("log-event", handleLogEvent);
    window.electron.on("debug-event", handleDebugEvent);
    window.electron.on("view-event", handleViewEvent);

    return () => {
      window.electron.off("log-event", handleLogEvent);
      window.electron.off("debug-event", handleDebugEvent);
      window.electron.off("view-event", handleViewEvent);
    };
  }, []);

  return (
    <div className="app">
      <div className="content">
        <div className="main">
          {currentView !== "none" && <DynamicView currentView={currentView} />}
          <DefaultView />
        </div>

        <div className="side">
          <LogWindow logs={logs} />
          <DebugWindow debugMessages={debugMessages} />
        </div>
      </div>
    </div>
  );
};

export default App;
