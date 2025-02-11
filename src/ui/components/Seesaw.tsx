import React, { useState, useEffect } from "react";
import SeesawView from "./SeesawView";
import AnalysisGraph from "./AnalysisGraph";

interface SeesawData {
  reference: number;
  ball: number;
  angle: number;
  boing: boolean;
}

const Seesaw: React.FC = () => {
  const [data, setData] = useState<SeesawData>({
    reference: 0,
    ball: 0,
    angle: 0,
    boing: false,
  });

  useEffect(() => {
    const handler = (newData: SeesawData) => {
      setData(newData);
    };

    window.electron.on("seesaw-event", handler);
    return () => {
      window.electron.off("seesaw-event", handler);
    };
  }, []);

  return (
    <div className="seesaw-container">
      <div className="seesaw-simulation">
        <h2>Seesaw Simulation</h2>
        <SeesawView
          reference={data.reference}
          ball={data.ball}
          angle={data.angle}
          boing={data.boing}
        />
      </div>
      
      {/* Analysegraph immer unterhalb der Wippe */}
      <div className="analysis-wrapper">
        <AnalysisGraph data={data} />
      </div>
    </div>
  );
};

export default Seesaw;
