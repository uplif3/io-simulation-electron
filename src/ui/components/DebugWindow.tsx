import React, { useEffect, useRef } from "react";

interface DebugWindowProps {
  debugMessages: string[];
}

const DebugWindow: React.FC<DebugWindowProps> = ({ debugMessages }) => {
  //ref damit es automatisch scrollt
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [debugMessages]);

  return (
    <div className="debug-window">
      <h2>Debug</h2>
      <textarea
        ref={textAreaRef}
        readOnly
        value={debugMessages.join("\n")} 
      />
    </div>
  );
};

export default DebugWindow;
