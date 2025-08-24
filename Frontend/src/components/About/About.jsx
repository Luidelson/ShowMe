import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-container">
      <main className="about-main">
        <p>
          For years, I struggled to keep track of which episode I left off on
          across the many shows I watch on different platforms. It’s frustrating
          to lose your place and waste time searching for where you left off.
          <br />
          <br />
          <strong>ShowMe</strong> is designed to solve this problem. With
          ShowMe, you can create a free account, discover new shows you’ll love,
          and easily save your progress for each series. No more jumping between
          apps or scrolling through episodes—ShowMe remembers exactly where you
          left off, so you can get back to watching without the hassle.
        </p>
      </main>
    </div>
  );
}

export default About;
