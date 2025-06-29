import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";

const Launcher: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverLogo, setHoverLogo] = useState(false);
  const offsetY = useRef(0);

  const onGripMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    offsetY.current =
      e.clientY - (ref.current?.getBoundingClientRect().top || 0);
    document.body.style.userSelect = "none";
    e.stopPropagation();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !ref.current) return;
    const newY = e.clientY - offsetY.current;
    ref.current.style.top = `${Math.max(
      0,
      Math.min(window.innerHeight - ref.current.offsetHeight, newY)
    )}px`;
  };

  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const handleClick = () => {
    console.log("open my sidepanel");
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  };

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: "40%",
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px 0 0 5px",
        background: "#000000",
        width: "40px",
        height: "60px",
        padding: "4px 0",
        cursor: "default",
        zIndex: 999999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
        gap: "4px",
      }}
    >
      {/* Clickable logo */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHoverLogo(true)}
        onMouseLeave={() => setHoverLogo(false)}
        style={{
          cursor: "pointer",
          padding: "4px",
          borderRadius: "6px",
        }}
      >
        <img
          src={chrome.runtime.getURL("public/icons/logo.png")}
          alt="Skynet logo"
          style={{
            width: "38px",
            height: "38px",
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
            opacity: hoverLogo ? 1 : 0.8,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>
      <div
        onMouseDown={onGripMouseDown}
        style={{
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "ns-resize",
          marginTop: "-12px",
        }}
      >
        <FontAwesomeIcon
          icon={faGrip}
          style={{ color: "#fcfcfc", fontSize: "14px", opacity: 0.7 }}
        />
      </div>
    </div>
  );
};

export default Launcher; 