import React, { useEffect, useRef } from "react";

interface LogWindowProps {
  logs: string[];
}

const LogWindow: React.FC<LogWindowProps> = ({ logs }) => {
  //ref damit es automatisch scrollt
  const containerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-window">
      <h2>Logs</h2>
      <textarea className="log-textarea"
        ref={containerRef}
        readOnly
        value={logs.join("\n")}
      />
    </div>
  );
};

export default LogWindow;
