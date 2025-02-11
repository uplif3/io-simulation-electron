import React from "react";

interface SeesawProps {
  reference: number; 
  ball: number;     
  angle: number;   
  boing: boolean;
}

const SeesawView: React.FC<SeesawProps> = ({ reference, ball, angle, boing }) => {
  const safeReference = isNaN(reference) ? 0 : reference;
  const safeBall = isNaN(ball) ? 0 : ball;
  const safeAngle = isNaN(angle) ? 0 : angle;

  const pSsSize = { x: 420, y: 180 }; 
  const rSsBall = 9;                
  const hSsStand = 70;               
  const wSsRamp = 3;                
  const angle2tan = Math.tan(7.5 * Math.PI / 180) / 7.5; 

  const margin = { x: 50, y: 50 };
  const svgWidth = pSsSize.x + 2 * margin.x;
  const svgHeight = pSsSize.y + 2 * margin.y;

  const origin = { x: margin.x + pSsSize.x / 2, y: margin.y + pSsSize.y };

  const toAbsolute = (x: number, y: number) => ({
    x: origin.x + x,
    y: origin.y - y,
  });


  // Reference Marker:
  const refX = Math.round(safeReference / 0.6 * (pSsSize.x / 2 - 1.5 * rSsBall));
  const refY = pSsSize.y - 1;
  const refPos = toAbsolute(refX, refY);
  const refPoints = [
    { x: refPos.x - 6, y: refPos.y - 11 }, // Links unten
    { x: refPos.x + 6, y: refPos.y - 11 }, // Rechts unten
    { x: refPos.x, y: refPos.y }, // Spitze nach unten
  ];
  const refPointsStr = refPoints.map(pt => `${pt.x},${pt.y}`).join(" ");

  // Ball:
  const ballX = Math.round(safeBall / 0.6 * (pSsSize.x / 2 - 1.5 * rSsBall));
  const tanAngle = safeAngle * angle2tan;
  const yMid = hSsStand;
  const ballY = -tanAngle * ballX + yMid + rSsBall + wSsRamp;
  const ballPos = toAbsolute(ballX, ballY);

  // Ramp:
  const rampTan = safeAngle * angle2tan;
  const yDelta = Math.round(rampTan * (pSsSize.x / 2));
  const yMidRamp = hSsStand;
  const yLeft = yMidRamp + yDelta;
  const yRight = yMidRamp - yDelta;
  const rampLeftLocal = { x: -pSsSize.x / 2 + 2, y: yLeft };
  const rampRightLocal = { x: pSsSize.x / 2 - 1, y: yRight };
  const rampLeft = toAbsolute(rampLeftLocal.x, rampLeftLocal.y);
  const rampRight = toAbsolute(rampRightLocal.x, rampRightLocal.y);

  // Boing-Text:
  const boingPos = toAbsolute(-pSsSize.x / 2 - 30, 10);

  return (
    <svg width={svgWidth} height={svgHeight} style={{ background: "#202020", border: "1px solid #ccc" }}>
      {/* Hintergrund */}
      <rect x={margin.x} y={margin.y} width={pSsSize.x} height={pSsSize.y} fill="#000000" />
      
      {/* Stand (als Dreieck) */}
      {(() => {
        const wStand = 36;
        const standRel = [
          { x: -wStand / 2, y: 0 },
          { x: 0, y: hSsStand },
          { x: wStand / 2, y: 0 },
        ];
        const standPoints = standRel.map(pt => {
          const abs = toAbsolute(pt.x, pt.y);
          return `${abs.x},${abs.y}`;
        }).join(" ");
        return <polygon points={standPoints} fill="#606060" />;
      })()}
      
      {/* Ramp */}
      <line
        x1={rampLeft.x}
        y1={rampLeft.y}
        x2={rampRight.x}
        y2={rampRight.y}
        stroke="#004de6"
        strokeWidth={wSsRamp}
      />
      
      {/* Ball */}
      <circle
        cx={ballPos.x}
        cy={ballPos.y}
        r={rSsBall}
        fill="#f0f0f0"
        stroke="#f0f0f0"
      />
      
      {/* Reference Marker */}
      <polygon points={refPointsStr} fill="#fcf800" />
      
      {/* Boing-Text, wenn aktiv */}
      {boing && (
        <text x={boingPos.x} y={boingPos.y} fill="#cc0000" fontSize="14" fontFamily="sans-serif">
          Boing!
        </text>
      )}
    </svg>
  );
};

export default SeesawView;
