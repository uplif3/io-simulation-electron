import React, { useEffect, useState } from "react";
import { Digit, BlinkingDigit } from "react-led-digit";

type AllowedDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const segMap: Record<string, string> = {
  "3f": "0",
  "06": "1",
  "5b": "2",
  "4f": "3",
  "66": "4",
  "6d": "5",
  "7d": "6",
  "07": "7",
  "7f": "8",
  "6f": "9",
};

interface ClockData {
  raw: string;
}

const AlarmClock: React.FC = () => {
  const [clockData, setClockData] = useState<ClockData | null>(null);

  useEffect(() => {
    const handler = (data: string) => {
      setClockData({ raw: data });
    };

    window.electron.on("alarm-clock-event", handler);

    return () => {
      window.electron.off("alarm-clock-event", handler);
    };
  }, []);

  /**
   * Dekodiert einen Byte-Wert (als Zahl) in eine Ziffer.
   * Dabei wird zuerst das MSB (Bit 7) entfernt (dies enthält LED-Informationen),
   * und der Rest als 2-stelliger Hex-String gemappt.
   */
  const decodeDigit = (byte: number): string => {
    const value = byte & 0x7F; // Bit 7 ausblenden
    const hexStr = value.toString(16).padStart(2, "0").toLowerCase();
    return segMap[hexStr] ?? "?";
  };

  if (!clockData || clockData.raw.length < 8) {
    return (
      <div className="alarm-clock" style={{ textAlign: "center" }}>
        <h2>Alarm Clock</h2>
        <p>No Alarm Data</p>
      </div>
    );
  }

  // Zerlege den Hex-String in 4 Bytes (je 2 Zeichen)
  // Reihenfolge im Protokoll:
  // Byte3: Stunden Zehner (Bit 7 nicht verwendet)
  // Byte2: Stunden Einer (mit LED Alarm in Bit 7)
  // Byte1: Minuten Zehner (mit Doppelpunkt in Bit 7)
  // Byte0: Minuten Einer (mit LED Beep in Bit 7)
  const raw = clockData.raw;
  const byte3 = parseInt(raw.substr(0, 2), 16);
  const byte2 = parseInt(raw.substr(2, 2), 16);
  const byte1 = parseInt(raw.substr(4, 2), 16);
  const byte0 = parseInt(raw.substr(6, 2), 16);

  // Für die Anzeige im Format HH:MM:
  // Stunden-Ziffern: Byte3 (Zehner) und Byte2 (Einer)
  // Minuten-Ziffern: Byte1 (Zehner) und Byte0 (Einer)
  const hoursTens = decodeDigit(byte3);
  const hoursOnes = decodeDigit(byte2);
  const minutesTens = decodeDigit(byte1);
  const minutesOnes = decodeDigit(byte0);

  // Extrahiere die LED-Indikatoren aus den Bits:
  const beepActive = (byte0 & 0x80) !== 0;    // LED Beep aus Byte0
  const colonActive = (byte1 & 0x80) !== 0;   // Doppelpunkt aus Byte1
  const alarmActive = (byte2 & 0x80) !== 0;   // LED Alarm aus Byte2

  return (
    <div className="alarm-clock" style={{ textAlign: "center", padding: "1em" }}>
      <h2>Alarm Clock</h2>
      <div
        className="digital-clock"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Digit value={hoursTens as AllowedDigit} />
        <Digit value={hoursOnes as AllowedDigit} />
        {colonActive ? (
          <BlinkingDigit value=":" />
        ) : (
          <Digit value={":" as any} />
        )}
        <Digit value={minutesTens as AllowedDigit} />
        <Digit value={minutesOnes as AllowedDigit} />
      </div>
      <div className="indicators" style={{ marginTop: "0.5em" }}>
        {alarmActive && (
          <span style={{ marginRight: "1em", color: "red", fontWeight: "bold" }}>
            ALARM
          </span>
        )}
        {beepActive && (
          <span style={{ color: "orange", fontWeight: "bold" }}>BEEP</span>
        )}
      </div>
    </div>
  );
};

export default AlarmClock;
