import React from "react";

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <div
      className="theme-toggle-bubble"
      onClick={() => setDarkMode((prev) => !prev)}
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        marginRight: 8,
        userSelect: "none",
      }}
      aria-label="Toggle dark mode"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") setDarkMode((prev) => !prev);
      }}
    >
      <span
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          background: darkMode ? "#222" : "#eee",
          border: "2px solid #888",
          display: "flex",
          alignItems: "center",
          position: "relative",
          transition: "background 0.3s",
          marginRight: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {/* Sun icon on left (hidden in dark mode) */}
        {!darkMode && (
          <span
            style={{
              position: "absolute",
              left: 6,
              top: 5,
              fontSize: 15,
              transition: "opacity 0.3s",
              pointerEvents: "none",
            }}
          >
            ☀️
          </span>
        )}
        {/* Moon icon on right (hidden in light mode) */}
        {darkMode && (
          <span
            style={{
              position: "absolute",
              right: 6,
              top: 5,
              fontSize: 15,
              transition: "opacity 0.3s",
              pointerEvents: "none",
            }}
          >
            🌙
          </span>
        )}
        {/* Bubble */}
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: darkMode ? "#1976d2" : "#ffd600",
            position: "absolute",
            left: darkMode ? 18 : 4,
            top: 2,
            transition: "left 0.3s, background 0.3s",
            boxShadow: "0 2px 8px rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: darkMode ? "#fff" : "#222",
            zIndex: 2,
          }}
        >
          {darkMode ? "🌙" : "☀️"}
        </span>
      </span>
      <span style={{ fontWeight: 600, color: darkMode ? "#1976d2" : "#222" }}>
        {darkMode ? "Dark" : "Light"}
      </span>
    </div>
  );
}

export default ThemeToggle;
