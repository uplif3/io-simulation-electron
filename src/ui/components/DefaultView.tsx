import React, { useEffect, useState } from "react";
import Switch from "react-switch";
import SVGKnob from "./SVGKnob";
import "./DefaultView.css";

const DefaultView: React.FC = () => {
  const [ledStatus, setLedStatus] = useState<boolean[]>(Array(8).fill(false));
  const [switchStatus, setSwitchStatus] = useState<boolean[]>(Array(8).fill(false));
  const [buttonStatus, setButtonStatus] = useState<boolean[]>(Array(4).fill(false));
  const [slider0, setSlider0] = useState<number>(0);
  const [slider1, setSlider1] = useState<number>(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [knobValue, setKnobValue] = useState<number>(0);

  useEffect(() => {
    window.electron.on("led-event", (hexCode: string) => {
      const binaryStatus = parseInt(hexCode, 16)
        .toString(2)
        .padStart(8, "0")
        .split("")
        .map((bit) => bit === "1");
      setLedStatus(binaryStatus);
    });

    const keyDownListener = (event: KeyboardEvent) => {
      if (event.repeat) return; // Verhindert mehrfaches Senden bei gedrückter Taste

      const keyMap: { [key: string]: number } = { "4": 0, "3": 1, "2": 2, "1": 3 };
      if (event.key in keyMap) {
        setPressedKeys((prev) => new Set([...prev, event.key]));
      }
    };

    const keyUpListener = (event: KeyboardEvent) => {
      const keyMap: { [key: string]: number } = { "4": 0, "3": 1, "2": 2, "1": 3 };
      if (event.key in keyMap) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.key);
          return newSet;
        });
      }
    };

    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);

    return () => {
      window.electron.off("led-event", () => {});
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    };
  }, []);

  useEffect(() => {
    const keyMap: { [key: string]: number } = { "4": 0, "3": 1, "2": 2, "1": 3 };
    const updatedStatus = [false, false, false, false];

    pressedKeys.forEach((key) => {
      if (key in keyMap) {
        updatedStatus[keyMap[key]] = true;
      }
    });

    setButtonStatus(updatedStatus);
    
    let value = 0;
    updatedStatus.forEach((isPressed, i) => {
      if (isPressed) value += 1 << i;
    });

    const hexValue = value.toString(16).padStart(2, "0");
    window.electron.send("button-click", hexValue);
  }, [pressedKeys]);

  const handleSwitchChange = (index: number) => {
    const updatedStatus = [...switchStatus];
    updatedStatus[index] = !updatedStatus[index];
    setSwitchStatus(updatedStatus);

    const reversed = [...updatedStatus].reverse();
    const value = reversed.reduce((acc, cur, idx) => acc + (cur ? (1 << idx) : 0), 0);
    const hexCode = value.toString(16).padStart(2, "0");
    window.electron.send("update-switch-status", hexCode);
  };

  const handleButtonClick = (index: number) => {
    const updatedStatus = [...buttonStatus];
    updatedStatus[index] = !updatedStatus[index];
    setButtonStatus(updatedStatus);

    let value = 0;
    updatedStatus.forEach((isPressed, i) => {
      if (isPressed) value += 1 << i;
    });

    const hexValue = value.toString(16).padStart(2, "0");
    window.electron.send("button-click", hexValue);
  };

  const sendScaleMessage = (channel: string, value: number) => {
    const hexValue = value.toString(16).padStart(4, "0");
    const message = `${channel}${hexValue}`;
    window.electron.send("update-scale", message);
  };

  const handleSliderChange = (channel: string, newValue: number) => {
    if (channel === "a") {
      setSlider0(newValue);
      sendScaleMessage(channel, newValue);
    } else if (channel === "b") {
      setSlider1(newValue);
      sendScaleMessage(channel, newValue);
    }
  };

  return (
    <div className="default-view">
      {/* LED-Anzeige */}
      <div className="led-row">
        {ledStatus.map((isOn, index) => (
          <div key={index} className="led-container">
            <div className={`led ${isOn ? "led-on" : "led-off"}`}></div>
            <span className="led-label">LED {7 - index}</span>
          </div>
        ))}
      </div>

      {/* Schalter */}
      <div className="switch-row">
        {switchStatus.map((isOn, index) => (
          <div key={index} className="switch-container">
            <Switch
              onChange={() => handleSwitchChange(index)}
              checked={isOn}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={20}
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={48}
            />
            <span className="switch-label">Switch {7 - index}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="button-row">
        {buttonStatus
          .map((status, index) => ({ status, index }))
          .reverse()
          .map(({ status, index }) => (
            <button
              key={index}
              className="action-button"
              onClick={() => handleButtonClick(index)}
              style={{ backgroundColor: status ? "lightgreen" : "gray" }}
            >
              Button {index + 1}
            </button>
          ))}
      </div>

      {/* Slider-Bereich */}
      <div className="slider-row">
        <div className="slider-container">
          <label htmlFor="slider0">Scale 0</label>
          <input
            id="slider0"
            type="range"
            min="0"
            max="1023"
            value={slider0}
            onChange={(e) => handleSliderChange("a", Number(e.target.value))}
          />
          <span>{slider0}</span>
        </div>
        <div className="slider-container">
          <label htmlFor="slider1">Scale 1</label>
          <input
            id="slider1"
            type="range"
            min="0"
            max="1023"
            value={slider1}
            onChange={(e) => handleSliderChange("b", Number(e.target.value))}
          />
          <span>{slider1}</span>
        </div>

        <div>
          <label>Knob 0</label>
          <SVGKnob
            min={0}
            max={1023}
            value={knobValue}
            onChange={(val) => {
              setKnobValue(val);
              handleSliderChange("a", val);
            }}
            size={80}
            trackColor="#444"
            pointerColor="#00BFFF"
          />
          <span>{knobValue}</span>
        </div>
      </div>
    </div>
  );
};

export default DefaultView;
