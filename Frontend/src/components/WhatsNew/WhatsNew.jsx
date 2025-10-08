import React from "react";
import "./WhatsNew.css";

function WhatsNew() {
  return (
    <div className="whatsnew-container">
      <div className="whatsnew-content">
        <h1>What's New</h1>
        <ul>
          <li>
            <b>Dark Mode:</b> You can now enable dark mode for a more comfortable viewing experience at night or in low light.
          </li>
          <li>
            <b>Friends:</b> You can now add, search for, and manage friends.
            When searching, you won't see your own account or people you've
            already added as friends.
          </li>
          <li>
            <b>Movies:</b> Keep track of your favorite movies and manage your
            movie list easily.
          </li>
          <li>
            <b>Easy Navigation:</b> The navigation bar now includes a "What's
            New" link so you can quickly see the latest updates.
          </li>
          <li>
            <b>Simple Usernames:</b> If you don't pick a name when signing up,
            you'll automatically get a unique username like "User12345" that
            stays the same everywhere.
          </li>
          <li>
            <b>Profile Pictures:</b> If you don't upload a profile picture,
            you'll see the first letter of your username on a gray background.
          </li>
          <li>
            <b>Back Button:</b> There's now a back button under the Friend
            Requests button to help you return to the previous page easily.
          </li>
          <li>
            <b>Bug Fixes:</b> We've fixed errors and made the app run smoother,
            especially in the Friends and Movies sections.
          </li>
        </ul>
        <p style={{ marginTop: 16 }}>
          We hope these updates make ShowMe easier and more fun to use! If you
          have feedback or ideas, let us know.
        </p>
      </div>
    </div>
  );
}

export default WhatsNew;
