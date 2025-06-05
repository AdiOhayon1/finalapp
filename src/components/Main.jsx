import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import profileLogo from "./passport_logo.png";

const Main = () => {
  useEffect(() => {
    fetch("http://localhost:5001/")
      .then((res) => res.text())
      .then((data) => console.log("✔ API Response:", data))
      .catch((err) => console.error("❌ API Error:", err));
  }, []);

  return (
    <div className="page-container">
      <img src={profileLogo} alt="Profile logo" className="profile-image" />
      <h1>Welcome to PostPassport ♡</h1>
      <p>
        Your gateway to sharing recommendations and beautiful photos from around
        the world ღ
      </p>
      <div className="links">
        <Link to="/log" className="btn btn-info">
          Login
        </Link>{" "}
        <Link to="/reg" className="btn btn-info">
          Register
        </Link>{" "}
      </div>
    </div>
  );
};

export default Main;
