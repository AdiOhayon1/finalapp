import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import profileLogo from "./passport_logo.png";
import { useNavigate } from "react-router-dom";

export default function Reg() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setRegistrationSuccess(false);

    if (password !== confirmPassword) {
      setError("The passwords don't match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: email,
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRegistrationSuccess(true);
      setError("");
    } catch (error) {
      console.error("Error registering user:", error.message);
      setError(error.message);
      setRegistrationSuccess(false);
    }
  };

  const handleSignInClick = () => {
    navigate("/log");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        onClick={handleBackClick}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.5)", // ✅ תואם לרקע של ה־LOG
          border: "none",
          borderRadius: "40%",
          padding: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "20px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        }}
      >
        ➤
      </button>

      <div className="reg form-container">
        <img src={profileLogo} alt="Profile logo" className="profile-image" />
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password verification"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {registrationSuccess && (
          <>
            <p style={{ color: "green", marginTop: "15px" }}>
              Your registration was successful
            </p>
            <button
              className="btn btn-primary"
              onClick={handleSignInClick}
              style={{ marginTop: "10px" }}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
