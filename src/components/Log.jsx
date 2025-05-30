import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import profileLogo from "./passport_logo.png";
import { useNavigate } from 'react-router-dom';

const Log = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/feed');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page-container">
      <img src={profileLogo} alt="Profile logo" className="profile-image" />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button className="btn btn-primary" type="submit">Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <p>
        Not registered yet? <a href="/reg">Register here</a>
      </p>
    </div>
  );
};

export default Log;