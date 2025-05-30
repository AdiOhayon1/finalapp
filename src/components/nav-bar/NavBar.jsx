import React from "react";
import { FaUser } from "react-icons/fa";
import "./NavBar.css";

const NavBar = ({ onClick }) => {
  return (
    <div className="sidebar">
      <button onClick={onClick} className="profile-button">
        <FaUser className="profile-icon" />
        Profile
      </button>
    </div>
  );
};

export default NavBar; 