import './Navigation.css';
import { Link } from 'react-router-dom';

function Navigation({ user }) {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        ShowMe
      </Link>
      <div className="nav-links">
        {/* <button className="nav_add-show-btn">+ Add Show</button> */}
        <Link to="/shows">Shows</Link>
        <Link to="/about">About</Link>
        {user && <Link to="/profile">Profile</Link>}
      </div>
    </nav>
  );
}

export default Navigation;
