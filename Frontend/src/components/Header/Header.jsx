import "./Header.css";
import { useEffect, useState } from "react";

function Header() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3001/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
        setAvatarUrl(data.avatarUrl || "");
      });
  }, []);

  return (
    <header
      className="Header"
      style={{ display: "flex", alignItems: "center", gap: 16 }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className="profile__avatar"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
      ) : (
        <div
          className="profile__avatar profile__avatar--default"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#888",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {(username || "?").charAt(0).toUpperCase()}
        </div>
      )}
      <span style={{ fontWeight: 600, fontSize: 18 }}>{username}</span>
    </header>
  );
}

export default Header;
