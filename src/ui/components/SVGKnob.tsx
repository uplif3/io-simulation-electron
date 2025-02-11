import React, { useRef, useState, useEffect } from "react";

type SVGKnobProps = {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (val: number) => void;
  size?: number;
  trackColor?: string;
  pointerColor?: string;
};

const SVGKnob: React.FC<SVGKnobProps> = ({
  min = 0,
  max = 1024,
  value = 0,
  onChange,
  size = 80,
  trackColor = "#444",
  pointerColor = "#00BFFF",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Aktueller "gültiger" Winkel (im Bereich 180..360)
  const [knobAngle, setKnobAngle] = useState(180);

  // Definiere obere Halbkreis-Bereiche
  const startAngle = 180; // links
  const endAngle = 360;   // rechts

  // Je nach Bedarf, wie groß soll der Snap-Bereich sein?
  const snapDegrees = 1;  // z. B. 5° Toleranz

  // --- Hilfsfunktionen ---
  const valueToAngle = (val: number) => {
    const fraction = (val - min) / (max - min);  // 0..1
    let angle = startAngle + fraction * (endAngle - startAngle);
    // Clampen
    if (angle < startAngle) angle = startAngle;
    if (angle > endAngle) angle = endAngle;
    return angle;
  };

  const angleToValue = (angle: number) => {
    const fraction = (angle - startAngle) / (endAngle - startAngle);
    const val = fraction * (max - min) + min;
    // Ganzzahlig, damit du exakte Schritte hast
    return Math.round(Math.min(Math.max(val, min), max));
  };

  // Wenn "value" sich von außen ändert (z. B. per Props), synchronisieren wir den Knob.
  useEffect(() => {
    const angle = valueToAngle(value);
    setKnobAngle(angle);
  }, [value]);

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: MouseEvent) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Winkel [0..360]
      let angle = Math.atan2(event.clientY - cy, event.clientX - cx) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      // 1) Boundary-Check: Verhindere Riesensprung unten durch
      //    Falls sich der Winkel im Vergleich zum "knobAngle" > 180° ändert, bleib einfach beim alten.
      const diff = Math.abs(angle - knobAngle);
      if (diff > 180) {
        angle = knobAngle; 
      }

      // 2) Clampen auf oberen Halbkreis [180..360]
      if (angle < startAngle) angle = startAngle;
      if (angle > endAngle) angle = endAngle;

      // 3) Snap an Anschläge (optional)
      if (angle > endAngle - snapDegrees) angle = endAngle;
      if (angle < startAngle + snapDegrees) angle = startAngle;

      // 4) State updaten
      setKnobAngle(angle);

      // 5) onChange aufrufen
      onChange?.(angleToValue(angle));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, [isDragging, knobAngle, onChange]);

  // --- Zeichnen im SVG ---
  const r = size / 2 - 5;
  const center = size / 2;

  // Umrechnung in Bogenmaß
  const rad = (knobAngle * Math.PI) / 180;
  const pointerX = center + r * Math.cos(rad);
  const pointerY = center + r * Math.sin(rad);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      onMouseDown={handlePointerDown}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {/* Hintergrundkreis */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={4}
      />
      {/* Zeiger */}
      <line
        x1={center}
        y1={center}
        x2={pointerX}
        y2={pointerY}
        stroke={pointerColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SVGKnob;
