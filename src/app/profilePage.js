// ProfilePage.js
import React from 'react';
import Navbar from './navbar';
import DeviceTable from './deviceTable'; // Import DeviceTable component
import './profilePage.css';

const ProfilePage = () => {
  return (
    <div>
      <Navbar/>
      <div className="profile-page">
        
        {/* Sidebar Section */}
        <div className="profile-sidebar">
          <img src="/avatar.png" alt="User Avatar" className="avatar" />
          <h2>John Doe</h2>
          <p>Full Stack Developer</p>
          <p>Bay Area, San Francisco, CA</p>
          <button className="btn follow-btn">Follow</button>
          <button className="btn message-btn">Message</button>
          <div className="social-links">
            <p><a href="https://bootdey.com">Website</a></p>
            <p><a href="https://github.com/bootdey">Github</a></p>
            <p><a href="https://twitter.com/bootdey">Twitter</a></p>
            <p><a href="https://instagram.com/bootdey">Instagram</a></p>
            <p><a href="https://facebook.com/bootdey">Facebook</a></p>
          </div>
        </div>

        {/* Main Profile Information and Device Table */}
        <div className="profile-main">
          
          {/* Profile Information Section */}
          <div className="profile-info">
            <h2>Profile Information</h2>
            <form>
              <label>Full Name</label>
              <input type="text" defaultValue="John Doe" />

              <label>Email</label>
              <input type="email" defaultValue="john@example.com" />

              <label>Phone</label>
              <input type="text" defaultValue="(239) 816-9029" />

              <label>Mobile</label>
              <input type="text" defaultValue="(320) 380-4539" />

              <label>Address</label>
              <input type="text" defaultValue="Bay Area, San Francisco, CA" />

              <button type="button" className="btn save-btn">Save Changes</button>
            </form>
          </div>

          {/* Device Table Section */}
          <DeviceTable />
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
