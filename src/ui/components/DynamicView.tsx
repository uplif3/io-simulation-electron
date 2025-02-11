import React from "react";
import AlarmClock from "./AlarmClockView";
import Seesaw from "./Seesaw";

interface DynamicViewProps {
  currentView: "viewA" | "viewB" | "none";
}


//feat: router verwenden?
const DynamicView: React.FC<DynamicViewProps> = ({ currentView }) => {
  if (currentView === "viewA") {
    return <div className="dynamic-view"><AlarmClock/></div>;
  }
  if (currentView === "viewB") {
    return <div className="dynamic-view"><Seesaw/></div>;
  }
};

export default DynamicView;
