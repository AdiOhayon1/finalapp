import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import profileLogo from "./passport_logo.png";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Log = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/feed");
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific Firebase error codes
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Invalid email address");
          break;
        case "auth/user-disabled":
          toast.error("This account has been disabled");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password");
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Please try again later");
          break;
        default:
          toast.error("Failed to login. Please check your credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <ToastContainer position="top-center" />
      <button
        onClick={handleBackClick}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.5)", 
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
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Not registered yet? <a href="/reg">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Log;
