import React, { useState, useRef, useEffect } from "react";
import "./MessageModal.css";

function MessageModal({ open, onClose, friend, messages, onSend }) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  if (!open) return null;
  return (
    <div className="message-modal__overlay" onClick={onClose}>
      <div
        className="message-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="message-modal__header">
          <img
            src={
              friend?.avatarUrl ||
              "https://ui-avatars.com/api/?name=" + (friend?.username || "F")
            }
            alt="avatar"
            className="message-modal__avatar"
          />
          <span className="message-modal__title">
            {friend?.username || "Friend"}
          </span>
          <button className="message-modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="message-modal__chatbox">
          {messages.length === 0 ? (
            <div className="message-modal__empty">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={
                  msg.fromMe
                    ? "message-modal__msg message-modal__msg--me"
                    : "message-modal__msg message-modal__msg--friend"
                }
              >
                <span>{msg.text}</span>
                <div className="message-modal__timestamp">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          className="message-modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
        >
          <input
            className="message-modal__input"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button className="message-modal__send-btn" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessageModal;
