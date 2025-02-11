import React, { useEffect, useState } from 'react';

interface SeesawData {
  reference: number;
  ball: number;
  angle: number;
  boing: boolean;
}

interface GraphPoint {
  x: number;
  ref: number;   // y-Wert für den Referenzwert
  ball: number;  // y-Wert für den Ball
  angle: number; // y-Wert für den Winkel
}

interface AnalysisGraphProps {
  data: SeesawData;
}

const AnalysisGraph: React.FC<AnalysisGraphProps> = ({ data }) => {
  const graphWidth = 500;
  const graphHeight = 200;
  const centerY = graphHeight / 2;
  const xStep = 2; // Schrittweite in Pixeln pro neuem Datenpunkt
  const maxPoints = Math.floor(graphWidth / xStep);

  // Fixed-Size-Datenpuffer (Array) und Cursor
  const [points, setPoints] = useState<Array<GraphPoint | null>>(
    Array(maxPoints).fill(null)
  );
  const [cursor, setCursor] = useState<number>(0);

  useEffect(() => {
    const yRef = centerY - (data.reference / 0.6) * (graphHeight / 2);
    const yBall = centerY - (data.ball / 0.6) * (graphHeight / 2);
    const yAngle = centerY - (data.angle / 15) * (graphHeight / 2);

    const newPoint: GraphPoint = {
      x: cursor * xStep,
      ref: yRef,
      ball: yBall,
      angle: yAngle,
    };

    // Überschreibe im Puffer den Wert an der aktuellen Cursor-Position
    setPoints(prevPoints => {
      const newPoints = [...prevPoints];
      newPoints[cursor] = newPoint;
      return newPoints;
    });

    // Aktualisiere den Cursor: Wenn das Ende erreicht ist, wieder bei 0 anfangen
    setCursor(prev => (prev + 1) % maxPoints);
  }, [data, centerY, graphHeight, xStep, maxPoints]);

  const orderedPoints: GraphPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const index = (cursor + i) % maxPoints;
    if (points[index] !== null) {
      orderedPoints.push(points[index]!);
    }
  }

  const polylineString = (key: 'ref' | 'ball' | 'angle') =>
    orderedPoints.map(pt => `${pt.x},${pt[key]}`).join(" ");

  let statusX = 0;
  if (orderedPoints.length > 0) {
    statusX = orderedPoints[orderedPoints.length - 1].x;
  }

  return (
    <svg width={graphWidth} height={graphHeight} style={{ background: "#000", border: "1px solid #ccc" }}>
      {/* Hintergrund */}
      <rect x={0} y={0} width={graphWidth} height={graphHeight} fill="#000" />
      {/* Vertikale Rasterlinien */}
      {Array.from({ length: Math.floor(graphWidth / 50) + 1 }).map((_, i) => (
        <line key={`vgrid-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={graphHeight} stroke="#404040" strokeWidth={1} />
      ))}
      {/* Horizontale Mittellinie */}
      <line x1={0} y1={centerY} x2={graphWidth} y2={centerY} stroke="darkorange" strokeWidth={1} />
      {/* Polylinien für Reference, Ball und Angle */}
      <polyline points={polylineString("ref")} stroke="#fcf800" strokeWidth={2} fill="none" />
      <polyline points={polylineString("ball")} stroke="#f0f0f0" strokeWidth={2} fill="none" />
      <polyline points={polylineString("angle")} stroke="#004de6" strokeWidth={2} fill="none" />
      {/* Statusstrich: Vertikale Linie an der x-Position des aktuellen Datenpunktes */}
      <line
        x1={statusX}
        y1={0}
        x2={statusX}
        y2={graphHeight}
        stroke="red"
        strokeWidth={2}
      />
    </svg>
  );
};

export default AnalysisGraph;
