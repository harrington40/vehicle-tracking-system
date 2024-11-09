import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Navbar</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/subscription">Subscription</Link></li>
        <li className="dropdown">
          <Link to="#" className="dropbtn">Main Menu</Link>
          <div className="dropdown-content">
            <Link to="/device-management">Device Management</Link>
            <Link to="/account-management">Account Management</Link>
            <Link to="/fleet-management">Fleet Management</Link>
          </div>
        </li>
      </ul>
      <div className="navbar-search">
        <input type="text" placeholder="Search" />
      </div>
    </nav>
  );
};

export default Navbar;
