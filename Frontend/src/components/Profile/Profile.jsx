import React from "react";
import "./Profile.css";

function Profile() {
  return (
    <div className="profile-wrapper">
      <aside className="profile-sidebar">
        <div className="profile-name">Profile Name</div>

        <button className="profile-signout-btn">Sign Out</button>
      </aside>
      <main className="profile-main">{/* Add profile content here */}</main>
    </div>
  );
}

export default Profile;
