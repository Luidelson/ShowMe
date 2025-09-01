import React from "react";
import "./Preloader.css";

function Preloader() {
  return (
    <div style={{ position: "relative", height: "80px" }}>
      <div className="circle-preloader"></div>
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "16px",
          color: "#444",
        }}
      >
        <br></br>
        Loading...
      </div>
    </div>
  );
}

export default Preloader;
