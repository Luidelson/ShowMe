import React from "react";
import "./WhatsNew.css";

function WhatsNew() {
  return (
    <div className="whatsnew-container">
      <div className="whatsnew-content">
        <h1>What's New</h1>
        <ul>
          <li>
            Friends section added: You can now add, search, and manage friends.
            Your own account is filtered out from friends and search results.
          </li>
          <li>
            Movies section added: Track, view, and manage your favorite movies.
          </li>
          <li>
            Navigation bar updated: "What's New" link added for quick access to
            updates.
          </li>
          <li>
            Bug fixes: Internal server errors and JSX rendering issues resolved
            in Friends and Movies components.
          </li>
        </ul>
        <p>Enjoy the new features and improvements!</p>
      </div>
    </div>
  );
}

export default WhatsNew;
