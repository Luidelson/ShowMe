import React from 'react';
import './About.css';

function About() {
  return (
    <main className="about" aria-labelledby="about-heading">
      <section className="about__main">
        <h1 id="about-heading" className="about__heading visually-hidden">
          About ShowMe
        </h1>
        <p>
          For years, I struggled to keep track of which episode I left off on
          across the many shows I watch on different platforms. It’s frustrating
          to lose your place and waste time searching for where you left off.
        </p>
        <p>
          <strong>ShowMe</strong> is designed to solve this problem. With
          ShowMe, you can create a free account, discover new shows you’ll love,
          and easily save your progress for each series. No more jumping between
          apps or scrolling through episodes—ShowMe remembers exactly where you
          left off, so you can get back to watching without the hassle.
        </p>
      </section>
    </main>
  );
}

export default About;
